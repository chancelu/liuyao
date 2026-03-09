# 设置系统环境变量（用户级别）
[Environment]::SetEnvironmentVariable("HTTP_PROXY", "http://127.0.0.1:10809", "User")
[Environment]::SetEnvironmentVariable("HTTPS_PROXY", "http://127.0.0.1:10809", "User")

# 验证设置
Write-Host "HTTP_PROXY: $([Environment]::GetEnvironmentVariable('HTTP_PROXY', 'User'))"
Write-Host "HTTPS_PROXY: $([Environment]::GetEnvironmentVariable('HTTPS_PROXY', 'User'))"
Write-Host "环境变量设置完成！请重启 OpenClaw Gateway 以应用新设置。"
