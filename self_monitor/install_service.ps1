# OpenClaw Guardian Windows Service Installer
# 以管理员身份运行 PowerShell 并执行此脚本

param(
    [string]$ServiceName = "OpenClawGuardian",
    [string]$DisplayName = "OpenClaw Guardian - Self-Monitoring Service",
    [string]$Description = "自动监控和恢复 OpenClaw 进程的服务"
)

# 检查管理员权限
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "请以管理员身份运行此脚本！"
    exit 1
}

# 获取当前目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceDir = Split-Path -Parent $ScriptDir

Write-Host "安装目录: $WorkspaceDir" -ForegroundColor Green

# 检查 Python
$PythonPath = (Get-Command python -ErrorAction SilentlyContinue).Source
if (-not $PythonPath) {
    $PythonPath = (Get-Command python3 -ErrorAction SilentlyContinue).Source
}

if (-not $PythonPath) {
    Write-Error "未找到 Python，请先安装 Python"
    exit 1
}

Write-Host "Python 路径: $PythonPath" -ForegroundColor Green

# 安装必要的 Python 包
Write-Host "安装必要的 Python 包..." -ForegroundColor Yellow
& $PythonPath -m pip install pywin32 psutil --quiet

# 创建服务主脚本
$ServiceScript = @"
import win32serviceutil
import win32service
import win32event
import servicemanager
import subprocess
import sys
import os
import time
import logging
import psutil

# 配置日志
log_dir = os.path.join(r"$WorkspaceDir", "logs")
os.makedirs(log_dir, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(log_dir, 'guardian-service.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("OpenClawGuardian")

class OpenClawGuardianService(win32serviceutil.ServiceFramework):
    _svc_name_ = "$ServiceName"
    _svc_display_name_ = "$DisplayName"
    _svc_description_ = "$Description"
    
    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.stop_event = win32event.CreateEvent(None, 0, 0, None)
        self.running = False
        self.check_interval = 30  # 秒
        self.max_restarts = 3
        self.restart_count = 0
        self.last_restart = None
        
    def SvcStop(self):
        logger.info("服务停止请求接收")
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        self.running = False
        win32event.SetEvent(self.stop_event)
        
    def SvcDoRun(self):
        logger.info("="*60)
        logger.info("OpenClaw Guardian Service Started")
        logger.info("="*60)
        
        servicemanager.LogMsg(
            servicemanager.EVENTLOG_INFORMATION_TYPE,
            servicemanager.PYS_SERVICE_STARTED,
            (self._svc_name_, '')
        )
        
        self.running = True
        self.main_loop()
        
    def main_loop(self):
        """主监控循环"""
        while self.running:
            try:
                # 检查 OpenClaw Gateway
                gateway_healthy = self.check_gateway()
                
                if not gateway_healthy:
                    logger.error("Gateway unhealthy, attempting restart...")
                    self.restart_gateway()
                
                # 检查 Agent 进程
                agent_healthy = self.check_agent()
                
                if not agent_healthy:
                    logger.error("Agent unhealthy, attempting restart...")
                    self.restart_agent()
                
                # 等待下一次检查
                if self.running:
                    win32event.WaitForSingleObject(self.stop_event, self.check_interval * 1000)
                    
            except Exception as e:
                logger.error(f"Error in main loop: {e}", exc_info=True)
                time.sleep(5)
    
    def check_gateway(self) -> bool:
        """检查 Gateway 是否健康"""
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex(('localhost', 7377))
            sock.close()
            
            if result == 0:
                logger.debug("Gateway health check: OK")
                return True
            else:
                logger.warning(f"Gateway port check failed: {result}")
                return False
        except Exception as e:
            logger.error(f"Gateway health check error: {e}")
            return False
    
    def check_agent(self) -> bool:
        """检查 Agent 进程是否运行"""
        try:
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    cmdline = ' '.join(proc.info['cmdline'] or [])
                    if 'openclaw' in proc.info['name'].lower() or 'openclaw' in cmdline:
                        logger.debug("Agent health check: OK")
                        return True
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            logger.warning("Agent process not found")
            return False
        except Exception as e:
            logger.error(f"Agent health check error: {e}")
            return False
    
    def restart_gateway(self) -> bool:
        """重启 Gateway"""
        if not self._can_restart():
            logger.error("Restart rate limit exceeded, cannot restart gateway")
            self._send_notification(
                "🚨 CRITICAL: Gateway Restart Failed",
                "Gateway is down but restart rate limit exceeded. Manual intervention required."
            )
            return False
        
        try:
            logger.info("Stopping gateway...")
            subprocess.run(["openclaw", "gateway", "stop"], check=False, timeout=10)
            time.sleep(3)
            
            logger.info("Starting gateway...")
            subprocess.Popen(["openclaw", "gateway", "start"], 
                           creationflags=subprocess.CREATE_NEW_CONSOLE)
            
            self._record_restart()
            
            logger.info("Gateway restart initiated, waiting for health check...")
            time.sleep(10)
            
            # 验证重启是否成功
            if self.check_gateway():
                logger.info("✓ Gateway restarted successfully")
                self._send_notification(
                    "🔄 Gateway Restarted",
                    "Gateway was down and has been successfully restarted."
                )
                return True
            else:
                logger.error("✗ Gateway restart failed - health check failed")
                return False
                
        except Exception as e:
            logger.error(f"Error restarting gateway: {e}", exc_info=True)
            return False
    
    def restart_agent(self) -> bool:
        """重启 Agent"""
        if not self._can_restart():
            logger.error("Restart rate limit exceeded, cannot restart agent")
            return False
        
        try:
            logger.info("Restarting agent...")
            # 这里需要根据实际的 OpenClaw 启动方式调整
            # 示例：
            subprocess.Popen(["openclaw", "agent", "start"],
                          creationflags=subprocess.CREATE_NEW_CONSOLE)
            
            self._record_restart()
            
            time.sleep(5)
            
            if self.check_agent():
                logger.info("✓ Agent restarted successfully")
                return True
            else:
                logger.error("✗ Agent restart failed")
                return False
                
        except Exception as e:
            logger.error(f"Error restarting agent: {e}")
            return False
    
    def _can_restart(self) -> bool:
        """检查是否可以重启（频率限制）"""
        max_restarts = self.config.get('max_restarts', 5)
        restart_window = self.config.get('restart_window', 3600)
        
        if self.restart_count >= max_restarts:
            # 检查是否在重启窗口内
            if self.last_restart:
                time_since_last = (datetime.now() - self.last_restart).total_seconds()
                if time_since_last < restart_window:
                    return False
                else:
                    # 重置计数器
                    self.restart_count = 0
        
        return True
    
    def _record_restart(self):
        """记录重启"""
        self.restart_count += 1
        self.last_restart = datetime.now()
    
    def _send_notification(self, title: str, message: str):
        """发送通知"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        notification = f"""
{'='*60}
🔔 {title}
{'='*60}
时间: {timestamp}
消息: {message}
{'='*60}
"""
        logger.info(notification)
        
        # 可以在这里添加更多通知方式：
        # - 发送邮件
        # - 发送 Slack 消息  
        # - 发送 Telegram 消息
        # - 发送飞书通知
        # - 调用 Webhook
        
        # 示例：发送飞书通知（需要配置 webhook）
        try:
            import requests
            webhook_url = os.getenv("FEISHU_WEBHOOK_URL")
            if webhook_url:
                payload = {
                    "msg_type": "text",
                    "content": {
                        "text": f"{title}\n\n{message}\n\n时间: {timestamp}"
                    }
                }
                requests.post(webhook_url, json=payload, timeout=5)
        except Exception as e:
            logger.error(f"Failed to send Feishu notification: {e}")


# Windows 服务入口点
if __name__ == "__main__":
    if len(sys.argv) == 1:
        # 直接运行模式（用于测试）
        print("Running in console mode (for testing)...")
        guardian = ProcessGuardian()
        try:
            guardian.run()
        except KeyboardInterrupt:
            print("\nStopping guardian...")
            guardian.running = False
    else:
        # Windows 服务模式
        win32serviceutil.HandleCommandLine(OpenClawGuardianService)
