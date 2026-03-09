# 静默启动 v2rayN TUN 模式
# 这个脚本会隐藏 sing_box.exe 的终端窗口

$v2rayNPath = "C:\Users\llc\Desktop\tool\v2rayN-With-Core\v2rayN-With-Core"
$singBoxPath = "$v2rayNPath\bin\sing_box\sing_box.exe"

# 检查文件是否存在
if (-not (Test-Path $singBoxPath)) {
    Write-Error "找不到 sing_box.exe: $singBoxPath"
    exit 1
}

# 创建启动参数（隐藏窗口）
$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = $singBoxPath
$startInfo.Arguments = "run -c `"$v2rayNPath\config.json`""
$startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
$startInfo.CreateNoWindow = $true
$startInfo.UseShellExecute = $false

# 启动进程
Write-Host "正在启动 v2rayN TUN 模式（隐藏窗口）..." -ForegroundColor Green
$process = [System.Diagnostics.Process]::Start($startInfo)

if ($process) {
    Write-Host "TUN 模式已启动，进程 ID: $($process.Id)" -ForegroundColor Green
    Write-Host "你可以现在启动 OpenClaw Gateway 了" -ForegroundColor Yellow
} else {
    Write-Error "启动失败"
}
