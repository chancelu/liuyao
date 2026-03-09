param()

$ScriptDir = "D:\openclaw\workspace\self_monitor"
$GuardianScript = "$ScriptDir\guardian.py"
$LogFile = "$ScriptDir\logs\guardian.log"

New-Item -ItemType Directory -Force -Path "$ScriptDir\logs" | Out-Null

$PythonPath = "D:\Python314\python.exe"
if (-not (Test-Path $PythonPath)) {
    $PythonCmd = Get-Command python3 -ErrorAction SilentlyContinue
    if ($PythonCmd) { $PythonPath = $PythonCmd.Source }
    else {
        Write-Error "Python not found at D:\Python314\python.exe"
        exit 1
    }
}

$procs = Get-WmiObject Win32_Process | Where-Object { $_.CommandLine -like "*guardian.py*" }
if ($procs) {
    Write-Host "Guardian already running, skip."
    exit 0
}

Write-Host "Starting OpenClaw Guardian..."
Start-Process -FilePath $PythonPath `
    -ArgumentList "`"$GuardianScript`"" `
    -WorkingDirectory $ScriptDir `
    -WindowStyle Hidden `
    -RedirectStandardOutput $LogFile `
    -RedirectStandardError "$ScriptDir\logs\guardian_err.log"

Write-Host "Guardian started. Log: $LogFile"
