#!/usr/bin/env python3
"""
OpenClaw Guardian - 两级守护进程

Level 1 (Watchdog)：每 30s 检查进程是否存在，不存在直接重启
Level 2 (HealthCheck)：每 30s 检查端口+RPC，连续失败 3 次触发重启

重启流程：
  1. 检测并 kill 僵尸进程
  2. openclaw gateway stop
  3. openclaw gateway start
  4. 验证是否恢复
  5. 未恢复 → Claude Code 自动修复
  6. 发送 Telegram + 飞书通知
"""

import json
import logging
import os
import subprocess
import sys
import time
from collections import deque
from datetime import datetime, timedelta
from pathlib import Path

import psutil

# ─── 路径设置 ──────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)
CONFIG_PATH = BASE_DIR / "config.json"

# ─── 日志 ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_DIR / "guardian.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger("guardian")

# ─── 导入本地模块 ──────────────────────────────────────────
sys.path.insert(0, str(BASE_DIR))
from health_check import HealthChecker
from notify import notify_restarted, notify_claude_fixed, notify_unfixable, notify

# ─── 配置加载 ──────────────────────────────────────────────

def load_config() -> dict:
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ─── 僵尸进程检测与清理 ────────────────────────────────────

def find_port_pids(port: int) -> list[int]:
    """找出占用指定端口的所有 PID"""
    pids = []
    try:
        for conn in psutil.net_connections(kind="inet"):
            if conn.laddr.port == port and conn.status in ("LISTEN", "ESTABLISHED", "CLOSE_WAIT"):
                if conn.pid:
                    pids.append(conn.pid)
    except Exception as e:
        logger.warning(f"查找端口占用 PID 失败: {e}")
    return list(set(pids))


def kill_zombie_processes(port: int):
    """
    检测端口 18789 上的进程：
    - 端口有占用但 RPC 不通 → 视为僵尸，强制 kill
    """
    pids = find_port_pids(port)
    if not pids:
        return
    logger.warning(f"端口 {port} 被 PID {pids} 占用，尝试 kill 僵尸进程")
    for pid in pids:
        try:
            p = psutil.Process(pid)
            cmdline = " ".join(p.cmdline())
            logger.warning(f"  强制 kill PID {pid}: {cmdline[:80]}")
            p.kill()
        except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
            logger.warning(f"  无法 kill PID {pid}: {e}")
    time.sleep(2)


# ─── 进程存在性检查（Level 1 Watchdog）─────────────────────

def gateway_process_exists() -> bool:
    """检查是否有 node.exe 进程运行 openclaw gateway"""
    try:
        for proc in psutil.process_iter(["pid", "name", "cmdline"]):
            try:
                cmdline = " ".join(proc.info["cmdline"] or [])
                if "node" in proc.info["name"].lower() and "gateway" in cmdline and "openclaw" in cmdline:
                    return True
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
    except Exception as e:
        logger.error(f"进程检查异常: {e}")
    return False


# ─── 重启逻辑 ──────────────────────────────────────────────

def do_restart(port: int) -> bool:
    """
    执行重启流程，返回是否成功。
    """
    logger.info("── 开始重启 OpenClaw Gateway ──")

    # Step 1: kill 僵尸进程
    kill_zombie_processes(port)

    # Step 2: 正常停止
    logger.info("运行 openclaw gateway stop ...")
    subprocess.run("openclaw gateway stop", capture_output=True, timeout=20, shell=True)
    time.sleep(3)

    # Step 3: 重新启动
    logger.info("运行 openclaw gateway start ...")
    subprocess.run("openclaw gateway start", capture_output=True, timeout=30, shell=True)
    time.sleep(8)

    # Step 4: 验证
    checker = HealthChecker(max_failures=1)
    healthy, reason = checker.run_check()
    if healthy:
        logger.info("Gateway 重启成功，RPC probe: ok")
        return True
    else:
        logger.error(f"重启后仍不健康: {reason}")
        return False


def do_claude_fix() -> bool:
    """
    让 Claude Code 自动诊断并修复，返回是否成功。
    """
    logger.info("── 启动 Claude Code 自动修复 ──")
    workspace = str(BASE_DIR.parent)
    prompt = (
        "OpenClaw Gateway 启动失败，无法连接到端口 18789。"
        "请运行 'openclaw gateway status' 诊断问题，然后修复它。"
        "修复完成后确保 'openclaw gateway status' 显示 'RPC probe: ok'。"
    )
    try:
        result = subprocess.run(
            ["claude", "--dangerously-skip-permissions", "-p", prompt],
            capture_output=True,
            text=True,
            timeout=180,
            cwd=workspace,
        )
        logger.info(f"Claude Code 输出:\n{result.stdout[-500:]}")
    except subprocess.TimeoutExpired:
        logger.error("Claude Code 修复超时（180s）")
        return False
    except FileNotFoundError:
        logger.error("找不到 claude 命令，请确认 Claude Code 已安装")
        return False
    except Exception as e:
        logger.error(f"Claude Code 运行异常: {e}")
        return False

    # 再次验证
    time.sleep(5)
    checker = HealthChecker(max_failures=1)
    healthy, reason = checker.run_check()
    if healthy:
        logger.info("Claude Code 修复成功")
        return True
    else:
        logger.error(f"Claude Code 修复后仍不健康: {reason}")
        return False


# ─── 重启频率保护 ──────────────────────────────────────────

class RestartRateGuard:
    def __init__(self, max_per_hour: int):
        self.max_per_hour = max_per_hour
        self._timestamps: deque = deque()

    def record(self):
        self._timestamps.append(datetime.now())
        self._cleanup()

    def exceeded(self) -> bool:
        self._cleanup()
        return len(self._timestamps) >= self.max_per_hour

    def _cleanup(self):
        cutoff = datetime.now() - timedelta(hours=1)
        while self._timestamps and self._timestamps[0] < cutoff:
            self._timestamps.popleft()


# ─── 主守护循环 ────────────────────────────────────────────

def run():
    config = load_config()
    port = config.get("gateway_port", 18789)
    check_interval = config.get("check_interval", 30)
    max_failures = config.get("max_failures", 3)
    max_restarts_per_hour = config.get("max_restarts_per_hour", 5)

    logger.info("=" * 60)
    logger.info("OpenClaw Guardian 启动")
    logger.info(f"  端口: {port} | 检查间隔: {check_interval}s | 最大失败: {max_failures} | 每小时最多重启: {max_restarts_per_hour}")
    logger.info("=" * 60)

    health_checker = HealthChecker(max_failures=max_failures)
    rate_guard = RestartRateGuard(max_per_hour=max_restarts_per_hour)

    while True:
        try:
            need_restart = False
            restart_reason = ""

            # ── Level 1: Watchdog ──────────────────────────
            if not gateway_process_exists():
                logger.warning("[L1 Watchdog] Gateway 进程不存在，触发重启")
                need_restart = True
                restart_reason = "进程不存在"
            else:
                # ── Level 2: HealthCheck ───────────────────
                healthy, reason = health_checker.run_check()
                if not healthy:
                    logger.warning(f"[L2 HealthCheck] {reason}")
                    if health_checker.should_restart():
                        need_restart = True
                        restart_reason = reason
                else:
                    logger.info("[OK] Gateway 健康")

            # ── 执行重启 ───────────────────────────────────
            if need_restart:
                if rate_guard.exceeded():
                    msg = f"重启频率过高（1小时内已重启 {rate_guard.max_per_hour} 次），停止自动重启，请人工检查"
                    logger.error(msg)
                    notify(msg)
                    # 暂停 10 分钟再继续监控
                    time.sleep(600)
                    continue

                logger.warning(f"触发重启，原因: {restart_reason}")
                rate_guard.record()
                health_checker.failure_count = 0

                success = do_restart(port)

                if success:
                    notify_restarted()
                else:
                    logger.error("普通重启失败，尝试 Claude Code 修复")
                    # 再次 kill 僵尸进程后交给 Claude
                    kill_zombie_processes(port)
                    claude_success = do_claude_fix()
                    if claude_success:
                        notify_claude_fixed()
                    else:
                        notify_unfixable()

        except Exception as e:
            logger.error(f"守护循环异常: {e}", exc_info=True)

        time.sleep(check_interval)


if __name__ == "__main__":
    run()
