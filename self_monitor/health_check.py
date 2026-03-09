#!/usr/bin/env python3
"""
Health Check Module - 检测 OpenClaw Gateway 健康状态
两种检查方式：
1. 端口连通性（18789）
2. openclaw gateway status 命令确认 RPC probe: ok
"""

import socket
import subprocess
import logging
from datetime import datetime
from typing import Tuple

logger = logging.getLogger(__name__)

GATEWAY_HOST = "127.0.0.1"
GATEWAY_PORT = 18789
MAX_FAILURES = 3


class HealthChecker:
    def __init__(self, max_failures: int = MAX_FAILURES):
        self.max_failures = max_failures
        self.failure_count = 0
        self.last_check_time: datetime | None = None

    def check_port(self) -> bool:
        """检查端口 18789 是否可连接"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex((GATEWAY_HOST, GATEWAY_PORT))
            sock.close()
            ok = result == 0
            if not ok:
                logger.warning(f"端口 {GATEWAY_PORT} 不可达 (code={result})")
            return ok
        except Exception as e:
            logger.error(f"端口检查异常: {e}")
            return False

    def check_rpc(self) -> bool:
        """运行 openclaw gateway status，确认 RPC probe: ok"""
        try:
            result = subprocess.run(
                "openclaw gateway status",
                capture_output=True,
                text=True,
                timeout=15,
                shell=True
            )
            output = result.stdout + result.stderr
            ok = "RPC probe: ok" in output
            if not ok:
                logger.warning(f"RPC probe 未通过，输出：{output[:200]}")
            return ok
        except Exception as e:
            logger.error(f"RPC 检查异常: {e}")
            return False

    def run_check(self) -> Tuple[bool, str]:
        """
        运行完整健康检查。
        返回 (healthy, reason)
        只有端口和 RPC 都通过才算健康。
        """
        self.last_check_time = datetime.now()

        port_ok = self.check_port()
        if not port_ok:
            self.failure_count += 1
            reason = f"端口 {GATEWAY_PORT} 不可达（连续失败 {self.failure_count} 次）"
            logger.warning(reason)
            return False, reason

        rpc_ok = self.check_rpc()
        if not rpc_ok:
            self.failure_count += 1
            reason = f"RPC probe 失败（连续失败 {self.failure_count} 次）"
            logger.warning(reason)
            return False, reason

        # 健康，重置失败计数
        if self.failure_count > 0:
            logger.info(f"Gateway 恢复健康（之前失败 {self.failure_count} 次）")
        self.failure_count = 0
        return True, "ok"

    def should_restart(self) -> bool:
        """失败次数达到阈值时返回 True"""
        return self.failure_count >= self.max_failures
