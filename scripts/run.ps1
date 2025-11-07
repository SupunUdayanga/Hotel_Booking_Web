# Starts the Hotel Booking stack via Docker Compose
param(
    [switch]$Rebuild
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Join-Path $scriptDir '..'
Set-Location $root

Write-Host "Starting Docker Desktop if needed..."
# Try to start Docker Desktop on Windows if not already running
try {
    $proc = Get-Process -Name 'Docker Desktop' -ErrorAction SilentlyContinue
    if (-not $proc) {
        Start-Process -FilePath "$Env:ProgramFiles\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue | Out-Null
        Start-Sleep -Seconds 5
    }
} catch {}

# Wait for Docker engine to be ready
$maxWait = 60
$waited = 0
while ($waited -lt $maxWait) {
    try {
        docker version | Out-Null
        break
    } catch {
        Start-Sleep -Seconds 3
        $waited += 3
    }
}

if ($Rebuild) {
    Write-Host "Rebuilding images..."
    docker compose build --no-cache
}

Write-Host "Starting containers..."
 docker compose up -d

Write-Host "Stack is starting. Frontend: http://localhost:8080" -ForegroundColor Green
