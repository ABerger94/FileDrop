$ErrorActionPreference = "Stop"

$appRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$releaseExe = Join-Path $appRoot "src-tauri\target\release\filedrop.exe"
$cargoBin = Join-Path $env:USERPROFILE ".cargo\bin"

if (Test-Path $releaseExe) {
  Start-Process -FilePath $releaseExe
  exit
}

if (Test-Path (Join-Path $cargoBin "cargo.exe")) {
  $env:Path = "$cargoBin;$env:Path"
}

if (-not (Get-Command "cargo" -ErrorAction SilentlyContinue)) {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show(
    "FileDrop desktop needs Rust/Cargo before the Tauri app can run.`n`nInstall Rust with winget or rustup, then run npm run desktop:dev from C:\Users\alekn\org-file-share-app.",
    "FileDrop desktop setup required",
    "OK",
    "Information"
  ) | Out-Null
  exit
}

Start-Process -FilePath "npm.cmd" -ArgumentList "run", "desktop:dev" -WorkingDirectory $appRoot
