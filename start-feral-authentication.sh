#!/bin/bash
# Starts feral-authentication-service and the feral-authentication dev server
# in the background, with the app pointed at the local service. The service
# needs its MySQL database running first.
# Stop both with ./stop-feral-authentication.sh

appDir=$(cd "$(dirname "$0")" && pwd)
serviceDir=${FERAL_AUTH_SERVICE_DIR:-$appDir/../feral-authentication-service}
servicePort=${FERAL_AUTH_SERVICE_PORT:-8003}
appPort=5173
runDir=$appDir/.run

mkdir -p "$runDir"

isRunning() {
  local pidFile=$runDir/$1.pid
  [ -f "$pidFile" ] && kill -0 "$(head -1 "$pidFile")" 2>/dev/null
}

# Saves the process's pid, for isRunning. Under Git Bash, the stop script
# goes by port instead
savePid() {
  echo "$1" > "$runDir/$2.pid"
}

# Waits up to $3 seconds for the url to answer with any HTTP status, failing
# early if the process dies
waitForUrl() {
  local name=$1
  local url=$2
  local seconds=$3
  local status
  for _ in $(seq 1 "$seconds"); do
    status=$(curl -s -o /dev/null -w '%{http_code}' -X "${4:-GET}" "$url")
    if [ "$status" != "000" ]; then
      return 0
    fi
    if ! isRunning "$name"; then
      echo "FAILED: $name exited. Last lines of $runDir/$name.log:"
      tail -20 "$runDir/$name.log"
      rm -f "$runDir/$name.pid"
      return 1
    fi
    sleep 1
  done
  echo "FAILED: $name did not answer at $url within $seconds seconds. See $runDir/$name.log"
  return 1
}

installIfNeeded() {
  if [ ! -d "$1/node_modules" ]; then
    echo "Installing dependencies in $1"
    (cd "$1" && npm ci) || exit 1
  fi
}

if [ ! -d "$serviceDir" ]; then
  echo "feral-authentication-service not found at $serviceDir (set FERAL_AUTH_SERVICE_DIR to override)"
  exit 1
fi

if isRunning feral-authentication-service; then
  echo "feral-authentication-service is already running"
else
  installIfNeeded "$serviceDir"
  echo "Starting feral-authentication-service on port $servicePort (it builds first)"
  (cd "$serviceDir" && PORT=$servicePort exec npm run dev) > "$runDir/feral-authentication-service.log" 2>&1 &
  savePid $! feral-authentication-service
  # Any reply will do: an unauthenticated verify answers 401 once it's up
  waitForUrl feral-authentication-service \
    "http://localhost:$servicePort/api/feral-authentication-service/v0/tokens/verify" 120 POST || exit 1
fi

if isRunning feral-authentication-app; then
  echo "feral-authentication-app is already running"
else
  installIfNeeded "$appDir"
  echo "Starting feral-authentication-app on port $appPort"
  (cd "$appDir" \
    && VITE_AUTH_SERVICE_V0_BASE_URL=http://localhost:$servicePort/api/feral-authentication-service/v0 \
       exec node ./node_modules/vite/bin/vite.js --port "$appPort" --strictPort) \
    > "$runDir/feral-authentication-app.log" 2>&1 &
  savePid $! feral-authentication-app
  waitForUrl feral-authentication-app "http://localhost:$appPort/auth/" 60 || exit 1
fi

echo
echo "App:     http://localhost:$appPort/auth/"
echo "Service: http://localhost:$servicePort/api/feral-authentication-service/v0"
echo "Logs:    $runDir"
