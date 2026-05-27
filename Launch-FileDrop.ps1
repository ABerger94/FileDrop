$ErrorActionPreference = "Stop"

$appRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$releaseExe = Join-Path $appRoot "src-tauri\target\release\filedrop.exe"

if (Test-Path $releaseExe) {
  Start-Process -FilePath $releaseExe
  exit
}

Start-Process -FilePath "npm.cmd" -ArgumentList "run", "desktop:dev" -WorkingDirectory $appRoot -WindowStyle Hidden
