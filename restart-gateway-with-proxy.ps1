# 设置代理环境变量
$env:HTTP_PROXY = "http://127.0.0.1:10809"
$env:HTTPS_PROXY = "http://127.0.0.1:10809"
$env:GLOBAL_AGENT_HTTP_PROXY = "http://127.0.0.1:10809"
$env:GLOBAL_AGENT_HTTPS_PROXY = "http://127.0.0.1:10809"

# 输出环境变量确认
Write-Host "环境变量已设置：" -ForegroundColor Green
Write-Host "HTTP_PROXY: $env:HTTP_PROXY"
Write-Host "HTTPS_PROXY: $env:HTTPS_PROXY"

# 停止 Gateway
Write-Host "`n正在停止 Gateway..." -ForegroundColor Yellow
openclaw gateway stop
Start-Sleep 2

# 启动 Gateway
Write-Host "`n正在启动 Gateway（带代理）..." -ForegroundColor Green
openclaw gateway start
