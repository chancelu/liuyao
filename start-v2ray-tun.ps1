# 静默启动 v2rayN TUN 模式
$v2rayNPath = "C:\Users\llc\Desktop\tool\v2rayN-With-Core\v2rayN-With-Core"
$singBoxPath = "$v2rayNPath\bin\sing_box\sing-box.exe"

# 检查文件是否存在
if (-not (Test-Path $singBoxPath)) {
    Write-Error "找不到 sing-box.exe: $singBoxPath"
    exit 1
}

# 找到配置文件
$configFiles = Get-ChildItem "$v2rayNPath\guiTemps" -Filter "*.json" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $configFiles) {
    # 尝试其他位置
    $configFiles = Get-ChildItem "$v2rayNPath\guiConfigs" -Filter "*.json" -ErrorAction SilentlyContinue | Select-Object -First 1
}

if ($configFiles) {
    $configPath = $configFiles.FullName
    Write-Host "找到配置文件: $configPath" -ForegroundColor Green
} else {
    # 使用默认配置
    $configPath = "$v2rayNPath\config.json"
    Write-Host "使用默认配置: $configPath" -ForegroundColor Yellow
}

# 创建启动参数（隐藏窗口）
$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = $singBoxPath
$startInfo.Arguments = "run -c `"$configPath`""
$startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
$startInfo.CreateNoWindow = $true
$startInfo.UseShellExecute = $false

# 启动进程
Write-Host "正在启动 TUN 模式..." -ForegroundColor Green
$process = [System.Diagnostics.Process]::Start($startInfo)

if ($process) {
    Write-Host "TUN 模式已启动！" -ForegroundColor Green
    Write-Host "进程 ID: $($process.Id)" -ForegroundColor Cyan
    Write-Host "`n你现在可以启动 OpenClaw Gateway 了" -ForegroundColor Yellow
    
    # 保存进程 ID 以便后续管理
    $process.Id | Out-File -FilePath "$env:TEMP\v2ray-tun-pid.txt" -Force
} else {
    Write-Error "启动失败"
}
