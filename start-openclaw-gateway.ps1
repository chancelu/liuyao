# 设置代理环境变量
$env:HTTP_PROXY = "http://127.0.0.1:10809"
$env:HTTPS_PROXY = "http://127.0.0.1:10809"

# 验证设置
Write-Host "HTTP_PROXY: $env:HTTP_PROXY"
Write-Host "HTTPS_PROXY: $env:HTTPS_PROXY"

# 启动 OpenClaw Gateway
Write-Host "`n正在启动 OpenClaw Gateway..."
openclaw gateway start
