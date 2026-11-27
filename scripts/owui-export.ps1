# owui-export.ps1 - saves your Open WebUI setup to JSON files
#   models.json            only the models you customised (settings changed or switched on)
#   openai-connection.json the OmniRoute connection, incl. the Model IDs allow-list
# Usage:  .\owui-export.ps1 -Key sk-xxxxx
# The connection file contains your OmniRoute key - keep it private.

param(
    [Parameter(Mandatory = $true)][string]$Key,
    [string]$Url = 'http://localhost:8080',
    [string]$Folder = (Join-Path $HOME 'owui-config')
)

$ErrorActionPreference = 'Stop'
$headers = @{ Authorization = "Bearer $Key" }
$utf8 = New-Object Text.UTF8Encoding($false)
New-Item -ItemType Directory -Path $Folder -Force | Out-Null

# Download as UTF-8 text (PowerShell 5.1 otherwise garbles characters like "Gratis" with an accent)
function Get-Utf8([string]$Endpoint) {
    $resp = Invoke-WebRequest -Uri "$Url$Endpoint" -Headers $headers -UseBasicParsing
    return [Text.Encoding]::UTF8.GetString($resp.RawContentStream.ToArray())
}

function Save-Text([string]$Text, [string]$File) {
    $path = Join-Path $Folder $File
    [IO.File]::WriteAllText($path, $Text, $utf8)
    Write-Host "Saved $path" -ForegroundColor Green
}

try {
    # 1. Model settings: every saved record, then keep only the ones you changed
    $all = Get-Utf8 '/api/v1/models/all' | ConvertFrom-Json
    $mine = @($all | Where-Object { $_.is_active -eq $true -or $null -ne $_.meta.capabilities })
    Save-Text (ConvertTo-Json -InputObject $mine -Depth 50) 'models.json'
    Write-Host ("  {0} customised models kept (out of {1} records)" -f $mine.Count, @($all).Count)

    # 2. Connection + Model IDs allow-list, saved exactly as the server sent it
    Save-Text (Get-Utf8 '/openai/config') 'openai-connection.json'

    Write-Host ''
    Write-Host "Done. Copy the folder $Folder to the other machine and run owui-import.ps1 there."
} catch {
    Write-Host "Export failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'Check that Open WebUI is running and that the key is an admin API key.'
}
