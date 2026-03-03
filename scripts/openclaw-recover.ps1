param(
  [string]$Workspace = "C:\Users\llc\.openclaw\workspace"
)

$ErrorActionPreference = "SilentlyContinue"
$logDir = Join-Path $Workspace "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logFile = Join-Path $logDir "openclaw-recover.log"

$ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"[$ts] Recovery triggered" | Add-Content $logFile

# Try to bring gateway back first
openclaw gateway start | Out-Null

# Build a recovery brief for Claude Code
$briefPath = Join-Path $Workspace "RECOVERY_BRIEF.md"
@"
# OpenClaw Recovery Brief

Triggered at: $ts

## Task
OpenClaw appears unhealthy or exited unexpectedly.

Please:
1. Run `openclaw status`
2. Check gateway and model config (`~/.openclaw/openclaw.json`)
3. Inspect latest logs in `%LOCALAPPDATA%\\Temp\\openclaw\\`
4. Propose minimal safe fix, then apply
5. Summarize root cause + fix
"@ | Set-Content -Encoding UTF8 $briefPath

# Launch Claude Code in a new terminal for supervised recovery
$cmd = "Set-Location '$Workspace'; claude" 
Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd | Out-Null

"[$ts] Claude Code launched" | Add-Content $logFile
