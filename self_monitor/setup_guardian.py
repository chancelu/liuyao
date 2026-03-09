#!/usr/bin/env python3
"""
OpenClaw Guardian Setup Script
一键安装和配置自监控系统
"""

import os
import sys
import subprocess
import json
import shutil
from pathlib import Path
import argparse


class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_header(text):
    print(f"\n{Colors.HEADER}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{text.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{'='*60}{Colors.ENDC}\n")


def print_success(text):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")


def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")


def print_warning(text):
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")


def print_info(text):
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")


def run_command(cmd, shell=True, capture_output=True):
    """运行命令并返回结果"""
    try:
        result = subprocess.run(
            cmd,
            shell=shell,
            capture_output=capture_output,
            text=True,
            timeout=30
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)


def check_python():
    """检查 Python 环境"""
    print_header("检查 Python 环境")
    
    python_version = sys.version_info
    print_info(f"Python 版本: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print_error("需要 Python 3.8 或更高版本")
        return False
    
    print_success("Python 版本检查通过")
    return True


def check_openclaw():
    """检查 OpenClaw 安装"""
    print_header("检查 OpenClaw 安装")
    
    success, stdout, stderr = run_command("openclaw --version")
    
    if success:
        print_success(f"OpenClaw 已安装: {stdout.strip()}")
        return True
    else:
        print_error("OpenClaw 未安装或不在 PATH 中")
        print_info("请先安装 OpenClaw: https://docs.openclaw.ai")
        return False


def install_dependencies():
    """安装 Python 依赖"""
    print_header("安装依赖包")
    
    dependencies = [
        "pywin32",
        "psutil",
        "requests",
        "schedule"
    ]
    
    for dep in dependencies:
        print_info(f"正在安装 {dep}...")
        success, stdout, stderr = run_command(f"pip install {dep}", timeout=60)
        
        if success:
            print_success(f"{dep} 安装成功")
        else:
            print_error(f"{dep} 安装失败: {stderr}")
            return False
    
    return True


def create_directories():
    """创建必要的目录结构"""
    print_header("创建目录结构")
    
    dirs = [
        "logs",
        "config",
        "data",
        "scripts"
    ]
    
    base_path = Path(__file__).parent
    
    for d in dirs:
        dir_path = base_path / d
        dir_path.mkdir(exist_ok=True)
        print_success(f"创建目录: {dir_path}")


def create_config():
    """创建默认配置文件"""
    print_header("创建配置文件")
    
    config = {
        "gateway_port": 7377,
        "gateway_host": "localhost",
        "check_interval": 30,
        "max_failures": 3,
        "restart_window": 3600,
        "processes": [
            {
                "name": "openclaw-gateway",
                "command": "openclaw gateway start",
                "port": 7377,
                "health_check": "port",
                "restart_on_failure": True
            },
            {
                "name": "agent-session",
                "command": "openclaw agent start",
                "health_check": "process",
                "process_pattern": "openclaw.*agent",
                "restart_on_failure": True
            }
        ],
        "notifications": {
            "on_restart": True,
            "on_recovery": True,
            "on_failure": False
        }
    }
    
    config_path = Path(__file__).parent / "config" / "monitor_config.json"
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print_success(f"配置文件已创建: {config_path}")


def install_windows_service():
    """安装 Windows 服务"""
    print_header("安装 Windows 服务")
    
    service_name = "OpenClawGuardian"
    
    # 检查服务是否已存在
    success, stdout, stderr = run_command(f"sc query {service_name}")
    
    if success and "RUNNING" in stdout:
        print_warning(f"服务 {service_name} 已存在并正在运行")
        return True
    elif success:
        print_warning(f"服务 {service_name} 已存在但未运行")
        print_info("尝试启动服务...")
        run_command(f"sc start {service_name}")
        return True
    
    # 创建服务
    python_path = sys.executable
    guardian_script = Path(__file__).parent / "guardian.py"
    
    cmd = f'"{python_path}" "{guardian_script}"'
    
    create_cmd = f'sc create {service_name} binPath= "{cmd}" start= auto displayName= "{service_name}"'
    
    print_info(f"创建服务: {service_name}")
    success, stdout, stderr = run_command(create_cmd)
    
    if success:
        print_success(f"服务 {service_name} 创建成功")
        
        # 配置服务失败恢复
        failure_cmd = f'sc failure {service_name} reset= 86400 actions= restart/5000/restart/10000/run/30000'
        run_command(failure_cmd)
        
        # 启动服务
        print_info("启动服务...")
        run_command(f"sc start {service_name}")
        
        return True
    else:
        print_error(f"创建服务失败: {stderr}")
        return False


def create_startup_task():
    """创建开机启动任务（备用方案）"""
    print_header("创建开机启动任务")
    
    task_name = "OpenClawGuardianStartup"
    python_path = sys.executable
    guardian_script = Path(__file__).parent / "guardian.py"
    
    # 删除旧任务
    run_command(f"schtasks /delete /tn {task_name} /f", capture_output=False)
    
    # 创建新任务
    create_cmd = f'''schtasks /create /tn {task_name} /tr "\"{python_path}\" \"{guardian_script}\"" /sc onlogon /rl highest'''
    
    success, stdout, stderr = run_command(create_cmd)
    
    if success:
        print_success(f"开机启动任务 {task_name} 创建成功")
        return True
    else:
        print_error(f"创建任务失败: {stderr}")
        return False


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='OpenClaw Guardian Setup')
    parser.add_argument('--service', action='store_true', help='Install as Windows service')
    parser.add_argument('--task', action='store_true', help='Create startup task')
    parser.add_argument('--config-only', action='store_true', help='Create config only')
    args = parser.parse_args()
    
    print_header("OpenClaw Guardian 安装程序")
    print_info("开始安装自监控系统...\n")
    
    # 检查环境
    if not check_python():
        return 1
    
    if not check_openclaw():
        print_warning("OpenClaw 未安装，但将继续安装 Guardian（仅监控）")
    
    # 创建目录结构
    create_directories()
    
    # 安装依赖
    if not args.config_only:
        if not install_dependencies():
            print_warning("部分依赖安装失败，但将继续安装")
    
    # 创建配置文件
    create_config()
    
    if args.config_only:
        print_success("\n配置文件已创建！")
        return 0
    
    # 安装 Windows 服务或创建启动任务
    if args.service:
        if install_windows_service():
            print_success("\nWindows 服务安装成功！")
        else:
            print_error("\nWindows 服务安装失败")
            return 1
    elif args.task:
        if create_startup_task():
            print_success("\n启动任务创建成功！")
        else:
            print_error("\n启动任务创建失败")
            return 1
    else:
        print_info("\n未指定服务或任务模式，仅创建配置文件")
        print_info("使用 --service 安装 Windows 服务")
        print_info("使用 --task 创建开机启动任务")
    
    print_header("安装完成")
    print_success("OpenClaw Guardian 安装完成！")
    print_info("\n使用方法:")
    print("  1. 手动启动: python self_monitor/guardian.py")
    print("  2. 查看日志: logs/guardian.log")
    print("  3. 修改配置: config/monitor_config.json")
    print("\nGuardian 将自动监控 OpenClaw 进程，检测到问题会自动重启。")
    print("重启后 Guardian 会通知你：'刚刚我卡死重启了哥们，我现在好了'")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
