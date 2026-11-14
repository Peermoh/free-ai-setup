# owui-import.ps1 - loads a saved Open WebUI setup from JSON files
#   models.json            per-model settings  -> POST /api/v1/models/import (adds/updates, never deletes)
#   openai-connection.json the OmniRoute connection + Model IDs allow-list -> POST /openai/config/update
# Usage:  .\owui-import.ps1 -Key sk-xxxxx
# Each part is optional: a missing file is skipped, a failed part does not stop the other.

param(
    [Parameter(Mandatory = $true)][string]$Key,
    [string]$Url = 'http://localhost:8080',
    [string]$Folder = (Join-Path $HOME 'owui-config')
)

$ErrorActionPreference = 'Stop'
$headers = @{ Authorization = "Bearer $Key" }

function Send-Json([string]$Endpoint, [string]$Json, [string]$Label) {
    try {
        $bytes = [Text.Encoding]::UTF8.GetBytes($Json)
        Invoke-WebRequest -Uri "$Url$Endpoint" -Method Post -Headers $headers `
            -ContentType 'application/json; charset=utf-8' -Body $bytes -UseBasicParsing | Out-Null
        Write-Host "$Label : imported" -ForegroundColor Green
    } catch {
        Write-Host "$Label : FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 1. Connection first, so the allow-listed models exist before their settings arrive
$connFile = Join-Path $Folder 'openai-connection.json'
if (Test-Path $connFile) {
    $conn = [IO.File]::ReadAllText($connFile)
    Send-Json '/openai/config/update' $conn 'Connection + Model IDs'
} else {
    Write-Host 'Connection : skipped (openai-connection.json not found)' -ForegroundColor Yellow
}

# 2. Per-model settings. The export file is a JSON array; import wants {"models": [...]}
$modelsFile = Join-Path $Folder 'models.json'
if (Test-Path $modelsFile) {
    $models = [IO.File]::ReadAllText($modelsFile).Trim()
    Send-Json '/api/v1/models/import' ('{"models": ' + $models + '}') 'Model settings'
} else {
    Write-Host 'Model settings : skipped (models.json not found)' -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Refresh the Open WebUI page (Ctrl + F5) to see the changes.'
