$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeDir = "C:\Program Files\nodejs"
$npmCmd = Join-Path $nodeDir "npm.cmd"

if (-not (Test-Path $npmCmd)) {
  throw "Could not find npm at $npmCmd. Install Node.js or update test.ps1 with the correct path."
}

$env:Path = "$nodeDir;$env:Path"

Write-Host "Stopping existing Vite/Node processes for this project if they are running..."
$escapedRoot = [Regex]::Escape($projectRoot)
$projectProcesses = Get-CimInstance Win32_Process |
  Where-Object {
    $_.Name -eq "node.exe" -and
    $_.CommandLine -match $escapedRoot -and
    ($_.CommandLine -match "vite" -or $_.CommandLine -match "npm")
  }

foreach ($process in $projectProcesses) {
  try {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
    Write-Host "Stopped process $($process.ProcessId)"
  } catch {
    Write-Warning "Could not stop process $($process.ProcessId): $($_.Exception.Message)"
  }
}

Set-Location $projectRoot

Write-Host "Installing dependencies if needed..."
& $npmCmd install

Write-Host "Running production build verification..."
& $npmCmd run build

Write-Host "Starting Vite dev server..."
& $npmCmd run dev
