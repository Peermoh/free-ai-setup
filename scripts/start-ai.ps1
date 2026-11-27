# start-ai.ps1 - starts Ollama, OmniRoute and Open WebUI from ONE window
# - OmniRoute and Open WebUI run hidden in the background (logs in %USERPROFILE%\ai-logs)
# - Only the Open WebUI chat page opens in the browser
# - Skips anything already running; warns and continues if something is missing
# - Press Enter in this window to stop what it started

$ErrorActionPreference = 'Continue'

# Reload PATH so newly installed tools are found, even from an old window
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')

# Let Python write its logs to a file without encoding errors
$env:PYTHONIOENCODING = 'utf-8'
$env:PYTHONUTF8 = '1'

$logDir = Join-Path $HOME 'ai-logs'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null

function Test-Port([int]$Port) {
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $ok = $client.ConnectAsync('127.0.0.1', $Port).Wait(1000) -and $client.Connected
        $client.Close()
        return $ok
    } catch { return $false }
}

function Wait-Port([int]$Port, [int]$Seconds) {
    $deadline = (Get-Date).AddSeconds($Seconds)
    while (-not (Test-Port $Port) -and (Get-Date) -lt $deadline) { Start-Sleep -Seconds 2 }
    return (Test-Port $Port)
}

# Finds a real program (.exe or .cmd), never a .ps1 wrapper
function Find-App([string]$Name) {
    $cmd = Get-Command $Name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($cmd) { return $cmd.Source } else { return $null }
}

# Starts a program hidden, with its output saved to a log file
function Start-Background([string]$Name, [string]$Exe, [string[]]$ArgList) {
    $safe = $Name -replace ' ', '-'
    $out  = Join-Path $logDir "$safe.log"
    $err  = Join-Path $logDir "$safe-error.log"
    return Start-Process -FilePath $Exe -ArgumentList $ArgList -WorkingDirectory $HOME -WindowStyle Hidden -RedirectStandardOutput $out -RedirectStandardError $err -PassThru
}

$ports   = [ordered]@{ 'Ollama' = 11434; 'OmniRoute' = 20128; 'Open WebUI' = 8080 }
$waits   = @{ 'Ollama' = 30; 'OmniRoute' = 180; 'Open WebUI' = 300 }
$results = [ordered]@{}
$started = @{}

# 1. Ollama (local models) - runs in the system tray
Write-Host '[1/3] Ollama...' -ForegroundColor Cyan
$ollamaApp = Join-Path $env:LOCALAPPDATA 'Programs\Ollama\ollama app.exe'
$ollamaCmd = Find-App 'ollama'
if (Test-Port 11434) {
    $results['Ollama'] = 'already running'
} elseif (Test-Path $ollamaApp) {
    Start-Process $ollamaApp
    $results['Ollama'] = 'starting'
} elseif ($ollamaCmd) {
    Start-Process $ollamaCmd -ArgumentList 'serve' -WindowStyle Hidden
    $results['Ollama'] = 'starting'
} else {
    $results['Ollama'] = 'NOT INSTALLED - skipped (cloud models still work)'
}

# 2. OmniRoute (the router) - hidden, no browser
Write-Host '[2/3] OmniRoute...' -ForegroundColor Cyan
$omniCmd = Find-App 'omniroute'
$npxCmd  = Find-App 'npx'
if (Test-Port 20128) {
    $results['OmniRoute'] = 'already running'
} elseif ($omniCmd -or $npxCmd) {
    try {
        if ($omniCmd) { $p = Start-Background 'OmniRoute' $omniCmd @('--no-open') }
        else          { $p = Start-Background 'OmniRoute' $npxCmd @('--yes', 'omniroute', '--no-open') }
        $started['OmniRoute'] = $p
        $results['OmniRoute'] = 'starting'
    } catch {
        $results['OmniRoute'] = 'FAILED to start - see logs'
    }
} else {
    $results['OmniRoute'] = 'NOT AVAILABLE - Node.js missing, skipped'
}

# 3. Open WebUI (the chat screen) - hidden, browser opens when ready
Write-Host '[3/3] Open WebUI...' -ForegroundColor Cyan
$webuiCmd = Find-App 'open-webui'
$webuiExe = Join-Path $env:LOCALAPPDATA 'Programs\Python\Python311\Scripts\open-webui.exe'
if (-not $webuiCmd -and (Test-Path $webuiExe)) { $webuiCmd = $webuiExe }
if (Test-Port 8080) {
    $results['Open WebUI'] = 'already running'
} elseif ($webuiCmd) {
    try {
        $started['Open WebUI'] = Start-Background 'Open WebUI' $webuiCmd @('serve')
        $results['Open WebUI'] = 'starting'
    } catch {
        $results['Open WebUI'] = 'FAILED to start - see logs'
    }
} else {
    $results['Open WebUI'] = 'NOT INSTALLED - skipped'
}

# Wait for whatever was started
foreach ($name in @($results.Keys)) {
    if ($results[$name] -eq 'starting') {
        Write-Host "Waiting for $name (up to $($waits[$name]) seconds)..." -ForegroundColor Yellow
        if (Wait-Port $ports[$name] $waits[$name]) { $results[$name] = 'running' }
        else { $results[$name] = 'not ready yet - check its log' }
    }
}

# Open ONLY the Open WebUI chat page
if (Test-Port 8080) {
    Start-Process 'http://localhost:8080'
} else {
    Write-Host 'Open WebUI is not ready, so no browser was opened.' -ForegroundColor Yellow
}

Write-Host ''
Write-Host '===== Summary =====' -ForegroundColor Green
foreach ($name in $results.Keys) { Write-Host ('{0,-11}: {1}' -f $name, $results[$name]) }
Write-Host ''
Write-Host "Chat page : http://localhost:8080"
Write-Host "OmniRoute : http://localhost:20128 (open it yourself when needed)"
Write-Host "Logs      : $logDir"
Write-Host ''

if ($started.Count -gt 0) {
    Write-Host 'Keep this window open while you use the AI.' -ForegroundColor Cyan
    Read-Host 'Press Enter to STOP OmniRoute and Open WebUI'
    foreach ($name in $started.Keys) {
        $p = $started[$name]
        if ($p -and -not $p.HasExited) {
            taskkill /PID $p.Id /T /F | Out-Null
            Write-Host "$name stopped."
        }
    }
    Write-Host 'Ollama keeps running in the system tray (it uses almost nothing when idle).'
    Start-Sleep -Seconds 3
} else {
    Read-Host 'Nothing new was started. Press Enter to close this window'
}
