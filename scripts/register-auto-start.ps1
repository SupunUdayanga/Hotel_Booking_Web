# Registers a Scheduled Task to auto-start the Hotel Booking stack on user logon
param(
    [string]$TaskName = 'HotelBookingAutoStart'
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Join-Path $scriptDir '..'
$runScript = Join-Path $scriptDir 'run.ps1'

if (-not (Test-Path $runScript)) {
    throw "run.ps1 not found at $runScript"
}

# Build the PowerShell command to execute run.ps1 minimized, allowing rebuild flag if desired
$psExe = (Get-Command powershell).Source
$arguments = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$runScript`""

$action = New-ScheduledTaskAction -Execute $psExe -Argument $arguments
$trigger = New-ScheduledTaskTrigger -AtLogOn
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -Compatibility Win8 -StartWhenAvailable

try {
    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings | Out-Null
    Write-Host "Scheduled Task '$TaskName' created. The stack will auto-start on login." -ForegroundColor Green
} catch {
    Write-Error $_
}
