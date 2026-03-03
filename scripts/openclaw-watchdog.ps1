param(
  [int]$IntervalSec = 30,
  [int]$MissThreshold = 3,
  [string]$Workspace = "C:\Users\llc\.openclaw\workspace"
)

$ErrorActionPreference = "SilentlyContinue"
$stateDir = Join-Path $Workspace "memory"
New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
$stateFile = Join-Path $stateDir "watchdog-state.json"

$miss = 0
$lastTrigger = Get-Date "2000-01-01"

while ($true) {
  $gatewayProc = Get-CimInstance Win32_Process -Filter "name='node.exe'" |
    Where-Object { $_.CommandLine -match "openclaw\\dist\\index.js gateway" }

  if ($null -eq $gatewayProc) {
    $miss++
  } else {
    $miss = 0
  }

  $now = Get-Date
  if ($miss -ge $MissThreshold -and ($now - $lastTrigger).TotalMinutes -ge 10) {
    $lastTrigger = $now

    $state = [ordered]@{
      lastTrigger = $now.ToString("o")
      reason = "gateway process missing"
      missCount = $miss
    } | ConvertTo-Json
    Set-Content -Encoding UTF8 -Path $stateFile -Value $state

    & "C:\Users\llc\.openclaw\workspace\scripts\openclaw-recover.ps1" -Workspace $Workspace
    $miss = 0
  }

  Start-Sleep -Seconds $IntervalSec
}
