$ErrorActionPreference = "Stop"

$appRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$url = "http://127.0.0.1:4180"

try {
  Invoke-WebRequest -UseBasicParsing -Uri $url -Method Head -TimeoutSec 2 | Out-Null
} catch {
  Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $appRoot -WindowStyle Hidden
  Start-Sleep -Seconds 1
}

Start-Process $url
