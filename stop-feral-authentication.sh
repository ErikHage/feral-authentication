#!/bin/bash
# Stops the processes started by ./start-feral-authentication.sh

runDir=$(cd "$(dirname "$0")" && pwd)/.run
servicePort=${FERAL_AUTH_SERVICE_PORT:-8003}
appPort=5173

# Git Bash: the saved Windows pid is the shell that started the process, and
# npm, nodemon and node outlive it. So find whoever listens on the port, climb
# the chain of processes that started it (npm, nodemon, npm-run-all, cmd and
# the bash that ran npm) and end that whole tree. Exits 1 if nothing listens,
# 2 if the port is still taken afterwards
stopWindowsTreeOnPort() {
  STOP_PORT=$1 powershell.exe -NoProfile -NonInteractive -Command '
    function Get-Listener {
      Get-NetTCPConnection -LocalPort $env:STOP_PORT -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1
    }
    $listener = Get-Listener
    if (-not $listener) { exit 1 }
    $byId = @{}
    Get-CimInstance Win32_Process | ForEach-Object { $byId[[int]$_.ProcessId] = $_ }
    $top = $byId[[int]$listener.OwningProcess]
    while ($true) {
      $parent = $byId[[int]$top.ParentProcessId]
      if (-not $parent -or $parent.CommandLine -notmatch "npm|nodemon|vite|server\.js") { break }
      $top = $parent
    }
    taskkill /PID $top.ProcessId /T /F | Out-Null
    foreach ($attempt in 1..10) {
      if (-not (Get-Listener)) { exit 0 }
      Start-Sleep -Milliseconds 500
    }
    exit 2
  '
}

stopProcess() {
  local name=$1
  local port=$2
  local pidFile=$runDir/$name.pid

  if [ -f /proc/self/winpid ]; then
    # Git Bash. Something still building (the service, before it listens)
    # isn't found; run this again once it's up
    stopWindowsTreeOnPort "$port"
    case $? in
      0) echo "Stopped $name" ;;
      1) echo "$name is not running" ;;
      *) echo "FAILED: $name still holds port $port" ;;
    esac
  elif [ -f "$pidFile" ] && kill -0 "$(head -1 "$pidFile")" 2>/dev/null; then
    kill "$(head -1 "$pidFile")"
    echo "Stopped $name"
  else
    echo "$name is not running"
  fi

  rm -f "$pidFile"
}

stopProcess feral-authentication-app "$appPort"
stopProcess feral-authentication-service "$servicePort"
