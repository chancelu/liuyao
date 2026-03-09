@echo off
chcp 65001 >nul
title OpenClaw Guardian - 自监控系统
echo.
echo ===========================================
echo     OpenClaw Guardian 自监控系统
echo ===========================================
echo.

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

echo [OK] Python 已安装

REM 检查 OpenClaw
openclaw --version >nul 2>&1
if errorlevel 1 (
    echo [警告] 未找到 OpenClaw，Guardian 将仅监控进程状态
) else (
    echo [OK] OpenClaw 已安装
)

REM 检查依赖
echo.
echo 检查依赖包...
python -c "import psutil" >nul 2>&1
if errorlevel 1 (
    echo 安装 psutil...
    pip install psutil -q
)

echo [OK] 依赖检查完成

REM 创建必要的目录
echo.
echo 创建目录结构...
if not exist "logs" mkdir logs
if not exist "config" mkdir config
if not exist "data" mkdir data
echo [OK] 目录创建完成

REM 启动 Guardian
echo.
echo ===========================================
echo     启动 Guardian 监控系统
echo ===========================================
echo.
echo 功能说明：
echo   - 每 30 秒检查一次 OpenClaw 进程
echo   - 如果检测到进程挂掉，自动重启
echo   - 重启后会发送通知消息
echo   - 防止无限重启循环（1小时内最多5次）
echo.
echo 按 Ctrl+C 停止监控
echo.
pause

REM 启动监控
python self_monitor/guardian.py

REM 如果异常退出
echo.
echo [警告] Guardian 已停止
pause
