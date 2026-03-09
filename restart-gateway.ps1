# 停止 Gateway
Write-Host "正在停止 Gateway..." -ForegroundColor Yellow
openclaw gateway stop
Start-Sleep 2

# 启动 Gateway
Write-Host "正在启动 Gateway..." -ForegroundColor Green
openclaw gateway start
Write-Host "`nGateway 启动完成！Telegram 应该可以正常工作了。" -ForegroundColor Green
