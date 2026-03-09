# 启动 OpenClaw Gateway（带 TUN 模式检测）

Write-Host "检查 v2rayN TUN 模式状态..." -ForegroundColor Yellow

# 检查 TUN 网卡是否存在
$tunAdapter = Get-NetAdapter -Name "*sing*" -ErrorAction SilentlyContinue
if (-not $tunAdapter) {
    Write-Host "警告：未检测到 TUN 网卡，请确保 v2rayN TUN 模式已启动" -ForegroundColor Red
    Write-Host "你可以运行 .\v2rayn-silent-start.ps1 来启动 TUN 模式" -ForegroundColor Yellow
    $continue = Read-Host "是否继续启动 OpenClaw? (y/n)"
    if ($continue -ne "y") { exit 1 }
} else {
    Write-Host "TUN 网卡已检测到: $($tunAdapter.Name)" -ForegroundColor Green
    Write-Host "TUN 状态: $($tunAdapter.Status)" -ForegroundColor Green
}

# 设置代理环境变量（确保 Gateway 使用代理）
$env:HTTP_PROXY = "http://127.0.0.1:10809"
$env:HTTPS_PROXY = "http://127.0.0.1:10809"

Write-Host "`n代理环境变量已设置：" -ForegroundColor Cyan
Write-Host "HTTP_PROXY: $env:HTTP_PROXY"
Write-Host "HTTPS_PROXY: $env:HTTPS_PROXY"

# 检查 OpenClaw Gateway 状态
Write-Host "`n检查 OpenClaw Gateway 状态..." -ForegroundColor Yellow
$gatewayStatus = openclaw status 2>&1
if ($gatewayStatus -match "running|Running|OK") {
    Write-Host "Gateway 已经在运行" -ForegroundColor Green
} else {
    Write-Host "Gateway 未运行，正在启动..." -ForegroundColor Yellow
    openclaw gateway start
    Start-Sleep 3
    
    # 验证启动状态
    $newStatus = openclaw status 2>&1
    if ($newStatus -match "running|Running|OK") {
        Write-Host "Gateway 启动成功！" -ForegroundColor Green
    } else {
        Write-Host "Gateway 启动可能有问题，请检查日志" -ForegroundColor Red
    }
}

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "OpenClaw Gateway 管理脚本执行完成！" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "`n你现在可以：" -ForegroundColor Cyan
Write-Host "1. 在 Telegram 中给 @xbei_homie_bot 发消息" -ForegroundColor White
Write-Host "2. 使用 web_search 工具搜索网络" -ForegroundColor White
