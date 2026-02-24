<#
.SYNOPSIS
    Generates a monthly shift schedule in turni.json file.

.DESCRIPTION
    This script takes a month and year as parameters and updates the turni.json file with:
    - A properly formatted Italian title (e.g., "Turni di Marzo 2026")
    - Shift entries for all valid days of the week in that month
    - Empty team arrays (to be filled manually later)
    - Preserves existing availableRoles and validDayOfWeek configuration
    - Creates timestamped backups in public/backups folder

.PARAMETER Month
    The month number (1-12). 1=January, 2=February, etc.

.PARAMETER Year
    The 4-digit year (must be >= 2000).

.EXAMPLE
    .\generate-turni.ps1 -Month 3 -Year 2026
    Generates shifts for March 2026.

.EXAMPLE
    .\generate-turni.ps1 -Month 12 -Year 2025
    Generates shifts for December 2025.

.NOTES
    - Creates a timestamped backup in public/backups before modifying turni.json
    - turni.json is located in public/turni.json
    - Only generates shifts for days specified in validDayOfWeek
    - All team arrays are left empty
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateRange(1,12)]
    [int]$Month,

    [Parameter(Mandatory=$true)]
    [ValidateRange(2000,9999)]
    [int]$Year
)

# Italian month names
$italianMonths = @{
    1 = "Gennaio"
    2 = "Febbraio"
    3 = "Marzo"
    4 = "Aprile"
    5 = "Maggio"
    6 = "Giugno"
    7 = "Luglio"
    8 = "Agosto"
    9 = "Settembre"
    10 = "Ottobre"
    11 = "Novembre"
    12 = "Dicembre"
}

# Path to turni.json in public folder
$turniPath = Join-Path $PSScriptRoot "public\turni.json"
$backupsDir = Join-Path $PSScriptRoot "public\backups"

# Create backups directory if it doesn't exist
if (-not (Test-Path $backupsDir)) {
    New-Item -Path $backupsDir -ItemType Directory -Force | Out-Null
    Write-Host "Created backups directory: $backupsDir" -ForegroundColor Yellow
}

# Check if turni.json exists
if (-not (Test-Path $turniPath)) {
    Write-Error "turni.json not found at: $turniPath"
    exit 1
}

# Read existing turni.json to preserve configuration
try {
    $existingContent = Get-Content $turniPath -Raw | ConvertFrom-Json
    $availableRoles = $existingContent.availableRoles
    $validDayOfWeek = $existingContent.validDayOfWeek
    $availableTeamMembers = $existingContent.availableTeamMembers
} catch {
    Write-Error "Failed to read or parse turni.json: $_"
    exit 1
}

# Validate that we have the required properties
if ($null -eq $availableRoles -or $null -eq $validDayOfWeek -or $null -eq $availableTeamMembers) {
    Write-Error "turni.json is missing required properties (availableRoles, validDayOfWeek, or availableTeamMembers)"
    exit 1
}

# Create backup with timestamp in backups folder
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFileName = "turni.json.bak.$timestamp"
$backupPath = Join-Path $backupsDir $backupFileName
try {
    Copy-Item $turniPath $backupPath -Force
    Write-Host "Backup created: $backupPath" -ForegroundColor Green
} catch {
    Write-Error "Failed to create backup: $_"
    exit 1
}

# Get Italian month name
$monthName = $italianMonths[$Month]

# Generate title
$title = "Turni di $monthName $Year"

# Generate all dates in the month that match validDayOfWeek
$shifts = @()
$daysInMonth = [DateTime]::DaysInMonth($Year, $Month)

for ($day = 1; $day -le $daysInMonth; $day++) {
    $date = Get-Date -Year $Year -Month $Month -Day $day
    $dayOfWeek = $date.DayOfWeek.ToString()
    
    # Check if this day of week is valid
    if ($validDayOfWeek -contains $dayOfWeek) {
        $dateString = $date.ToString("yyyy-MM-dd")
        $shifts += @{
            date = $dateString
            team = @()
        }
    }
}

# Build the new JSON structure
$newContent = @{
    title = $title
    shifts = $shifts
    availableRoles = $availableRoles
    validDayOfWeek = $validDayOfWeek
    availableTeamMembers = $availableTeamMembers
}

# Write to turni.json with pretty formatting
try {
    $jsonOutput = $newContent | ConvertTo-Json -Depth 10
    Set-Content -Path $turniPath -Value $jsonOutput -Encoding UTF8
    Write-Host "Successfully updated turni.json" -ForegroundColor Green
    Write-Host "Title: $title" -ForegroundColor Cyan
    Write-Host "Shifts generated: $($shifts.Count)" -ForegroundColor Cyan
} catch {
    Write-Error "Failed to write turni.json: $_"
    Write-Host "Restoring from backup..." -ForegroundColor Yellow
    Copy-Item $backupPath $turniPath -Force
    exit 1
}
