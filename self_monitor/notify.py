#!/usr/bin/env python3
"""
Notification Module - 发送 Telegram 和飞书通知
"""

import json
import os
import time
import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

CONFIG_PATH = Path(__file__).parent / "config.json"


def _load_config() -> dict:
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_config(config: dict):
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)


# ─── Telegram ─────────────────────────────────────────────

PROXIES = {"http": "http://127.0.0.1:10809", "https": "http://127.0.0.1:10809"}


def _get_telegram_chat_id(bot_token: str) -> str | None:
    """从 getUpdates 自动获取最新消息的 chat_id，获取到后写入 config.json"""
    try:
        import requests
        url = f"https://api.telegram.org/bot{bot_token}/getUpdates"
        resp = requests.get(url, timeout=10, proxies=PROXIES, verify=False)
        data = resp.json()
        results = data.get("result", [])
        if results:
            chat_id = str(results[-1]["message"]["chat"]["id"])
            logger.info(f"自动获取到 Telegram chat_id: {chat_id}")
            config = _load_config()
            config["telegram"]["chat_id"] = chat_id
            _save_config(config)
            return chat_id
    except Exception as e:
        logger.error(f"自动获取 Telegram chat_id 失败: {e}")
    return None


def send_telegram(message: str) -> bool:
    try:
        import requests
        config = _load_config()
        tg = config.get("telegram", {})
        bot_token = tg.get("bot_token", "")
        chat_id = tg.get("chat_id", "")

        if not bot_token:
            logger.warning("Telegram bot_token 未配置")
            return False

        if not chat_id:
            chat_id = _get_telegram_chat_id(bot_token)
            if not chat_id:
                logger.warning("无法获取 Telegram chat_id，请先给 bot 发送一条消息")
                return False

        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        resp = requests.post(url, json={"chat_id": chat_id, "text": message}, timeout=10, proxies=PROXIES, verify=False)
        if resp.status_code == 200:
            logger.info("Telegram 通知发送成功")
            return True
        else:
            logger.error(f"Telegram 通知失败: {resp.status_code} {resp.text}")
            return False
    except Exception as e:
        logger.error(f"Telegram 通知异常: {e}")
        return False


# ─── 飞书 Bot API ──────────────────────────────────────────

def _get_feishu_token(app_id: str, app_secret: str) -> str | None:
    try:
        import requests
        url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
        resp = requests.post(url, json={"app_id": app_id, "app_secret": app_secret}, timeout=10, proxies=PROXIES)
        data = resp.json()
        if data.get("code") == 0:
            return data["tenant_access_token"]
        logger.error(f"获取飞书 token 失败: {data}")
    except Exception as e:
        logger.error(f"飞书 token 请求异常: {e}")
    return None


def send_feishu(message: str) -> bool:
    try:
        import requests
        config = _load_config()
        fs = config.get("feishu", {})
        app_id = fs.get("app_id", "")
        app_secret = fs.get("app_secret", "")
        open_id = fs.get("user_open_id", "")

        if not all([app_id, app_secret, open_id]):
            logger.warning("飞书配置不完整")
            return False

        token = _get_feishu_token(app_id, app_secret)
        if not token:
            return False

        url = "https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id"
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        payload = {
            "receive_id": open_id,
            "msg_type": "text",
            "content": json.dumps({"text": message})
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=10, proxies=PROXIES)
        data = resp.json()
        if data.get("code") == 0:
            logger.info("飞书通知发送成功")
            return True
        else:
            logger.error(f"飞书通知失败: {data}")
            return False
    except Exception as e:
        logger.error(f"飞书通知异常: {e}")
        return False


# ─── 统一通知入口 ──────────────────────────────────────────

def notify(message: str):
    """同时向 Telegram 和飞书发送通知"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    full_msg = f"[{timestamp}] {message}"
    logger.info(f"发送通知: {full_msg}")

    tg_ok = send_telegram(full_msg)
    fs_ok = send_feishu(full_msg)

    if not tg_ok and not fs_ok:
        logger.error("所有通知渠道均失败")

    # 写入本地日志
    log_dir = Path(__file__).parent / "logs"
    log_dir.mkdir(exist_ok=True)
    with open(log_dir / "notifications.log", "a", encoding="utf-8") as f:
        f.write(full_msg + "\n")


def notify_restarted():
    notify("刚刚卡了我刚重启好")


def notify_claude_fixed():
    notify("刚刚卡了Claude给我修好了")


def notify_unfixable():
    notify("无法修复，无法启动龙虾")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    notify("测试通知：守护进程已启动")
