$ErrorActionPreference = "Stop"

$nodeDir = "C:\Program Files\nodejs"
$npmCmd = Join-Path $nodeDir "npm.cmd"

if (-not (Test-Path $npmCmd)) {
  throw "Could not find npm at $npmCmd. Install Node.js or update start.ps1 with the correct path."
}

$env:Path = "$nodeDir;$env:Path"

Write-Host "Installing dependencies if needed..."
& $npmCmd install

Write-Host "Starting Vite dev server..."
& $npmCmd run dev
