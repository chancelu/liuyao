# OpenClaw Crash Watchdog

## Files
- `scripts/openclaw-watchdog.ps1` — checks OpenClaw gateway process periodically
- `scripts/openclaw-recover.ps1` — starts gateway + opens Claude Code for supervised recovery

## Start watchdog (manual)
```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\llc\.openclaw\workspace\scripts\openclaw-watchdog.ps1
```

## Optional: Run in background
```powershell
Start-Process powershell -ArgumentList '-ExecutionPolicy','Bypass','-File','C:\Users\llc\.openclaw\workspace\scripts\openclaw-watchdog.ps1'
```

## Stop
Close the watchdog PowerShell window, or kill the process.

## Notes
- It triggers recovery after 3 missed checks (default every 30s).
- Cooldown is 10 minutes between triggers.
- Recovery is **supervised**: it launches `claude` in a new terminal instead of silent autonomous actions.
