# setup-ai.ps1 - set up the whole free AI stack with two commands
#
#   .\setup-ai.ps1 -Install     1) installs Ollama, Node.js, Python 3.11, OmniRoute, Open WebUI, a local model
#   (browser: create the keys - see the guide)
#   .\setup-ai.ps1 -Configure   2) saves your keys, adds AI providers to OmniRoute,
#                                  connects Open WebUI, applies token-saving settings, builds and tests combos
#
# Keys are typed with hidden input and sent straight to OmniRoute; provider keys are never saved to disk.
# Safe to run again: anything already done is skipped.

param(
    [switch]$Install,
    [switch]$Configure,
    [string]$OmniUrl = 'http://localhost:20128',
    [string]$Url = 'http://localhost:8080',
    [string]$OllamaUrl = 'http://localhost:11434',
    [string]$LocalModel = 'llama3.2:3b'
)

$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$todo = New-Object 'System.Collections.Generic.List[string]'   # things left for the user

function Say([string]$Text, [string]$Colour = 'Gray') { Write-Host $Text -ForegroundColor $Colour }
function Ok([string]$Text)   { Say "  OK    $Text" Green }
function Skip([string]$Text) { Say "  SKIP  $Text" DarkGray }
function Warn([string]$Text) { Say "  !     $Text" Yellow }

function Refresh-Path {
    $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
}

function Read-Hidden([string]$Prompt) {
    $secure = Read-Host -Prompt $Prompt -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr).Trim() }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

function Read-Error($err) {
    try {
        $text = (New-Object IO.StreamReader($err.Exception.Response.GetResponseStream(), [Text.Encoding]::UTF8)).ReadToEnd()
        if ($text) { return $text }
    } catch { }
    return $err.Exception.Message
}

function Invoke-Api([string]$Method, [string]$Uri, [string]$Key, $Object = $null) {
    $params = @{ Uri = $Uri; Method = $Method; Headers = @{ Authorization = "Bearer $Key" }; UseBasicParsing = $true; TimeoutSec = 120 }
    if ($null -ne $Object) {
        $params.ContentType = 'application/json; charset=utf-8'
        $params.Body = [Text.Encoding]::UTF8.GetBytes((ConvertTo-Json -InputObject $Object -Depth 20))
    }
    $resp = Invoke-WebRequest @params
    $text = [Text.Encoding]::UTF8.GetString($resp.RawContentStream.ToArray())
    if ($text) { return ($text | ConvertFrom-Json) } else { return $null }
}

function Test-Up([string]$Uri) {
    try { Invoke-WebRequest -Uri $Uri -UseBasicParsing -TimeoutSec 3 | Out-Null; return $true }
    catch { return [bool]$_.Exception.Response }    # any HTTP answer (even 401) means it is running
}

if (-not $Install -and -not $Configure) {
    Say 'Usage:'
    Say '  .\setup-ai.ps1 -Install     install all programs (once)'
    Say '  .\setup-ai.ps1 -Configure   keys, providers, Open WebUI, combos (after the browser steps)'
    return
}

# =====================================================================================
#  INSTALL
# =====================================================================================
if ($Install) {
    Say "`n=== Installing programs ===" Cyan
    $hasWinget = [bool](Get-Command winget -ErrorAction SilentlyContinue)
    if (-not $hasWinget) { Warn 'winget is not available - programs below must be installed by hand (links shown).' }

    $apps = @(
        @{ Name = 'Ollama';      Check = { Get-Command ollama -ErrorAction SilentlyContinue };  Id = 'Ollama.Ollama';      Link = 'https://ollama.com/download' },
        @{ Name = 'Node.js LTS'; Check = { Get-Command node -ErrorAction SilentlyContinue };    Id = 'OpenJS.NodeJS.LTS';  Link = 'https://nodejs.org (LTS, Windows Installer)' },
        @{ Name = 'Python 3.11'; Check = { (& py -3.11 --version 2>$null) -match '3\.11' };     Id = 'Python.Python.3.11'; Link = 'https://www.python.org/downloads/windows/ (3.11.9, tick Add to PATH)' }
    )
    foreach ($a in $apps) {
        $present = $false
        try { $present = [bool](& $a.Check) } catch { }
        if ($present) { Skip "$($a.Name) already installed"; continue }
        if ($hasWinget) {
            Say "  ...   installing $($a.Name)"
            winget install -e --id $a.Id --accept-package-agreements --accept-source-agreements --silent | Out-Null
            Refresh-Path
            $present = $false
            try { $present = [bool](& $a.Check) } catch { }
            if ($present) { Ok "$($a.Name) installed" } else { Warn "$($a.Name) may need a new PowerShell window"; $todo.Add("Open a new PowerShell window and run .\setup-ai.ps1 -Install again") }
        } else {
            Warn "$($a.Name): install from $($a.Link)"
            $todo.Add("Install $($a.Name): $($a.Link)")
        }
    }
    Refresh-Path

    # Local model
    if (Get-Command ollama -ErrorAction SilentlyContinue) {
        if ((& ollama list 2>$null) -match [regex]::Escape($LocalModel)) { Skip "local model $LocalModel already present" }
        else { Say "  ...   downloading local model $LocalModel (about 2 GB)"; & ollama pull $LocalModel; Ok "local model $LocalModel" }
    }

    # OmniRoute (global, fixed version)
    if (Get-Command node -ErrorAction SilentlyContinue) {
        if (Get-Command omniroute -ErrorAction SilentlyContinue) { Skip 'OmniRoute already installed' }
        else {
            # Running it with "npx omniroute" only uses a temporary copy that can change version on its own.
            Say '  ...   installing OmniRoute permanently (npm install -g) - your settings and keys are kept'
            & npm install -g omniroute | Out-Null
            Refresh-Path
            Ok 'OmniRoute installed - after starting it, check providers with: .\ai-sync.ps1 -Test'
        }
    }

    # Open WebUI (Python 3.11 specifically)
    $py311 = $false
    try { $py311 = (& py -3.11 --version 2>$null) -match '3\.11' } catch { }
    if ($py311) {
        $installed = $false
        try { $installed = [bool](& py -3.11 -m pip show open-webui 2>$null) } catch { }
        if ($installed) { Skip 'Open WebUI already installed' }
        else {
            Say '  ...   installing Open WebUI (15-30 minutes, may look frozen - this is normal)'
            & py -3.11 -m pip install open-webui
            Ok 'Open WebUI installed'
        }
        # Put Python's Scripts folder on PATH so "open-webui" works in every window
        $scripts = (& py -3.11 -c "import sysconfig; print(sysconfig.get_path('scripts'))").Trim()
        $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
        if ($userPath -notlike "*$scripts*") {
            [Environment]::SetEnvironmentVariable('Path', "$userPath;$scripts", 'User')
            Ok "added $scripts to PATH"
        } else { Skip 'Python Scripts folder already on PATH' }
    }
}

# =====================================================================================
#  CONFIGURE
# =====================================================================================
if ($Configure) {
    Refresh-Path

    # --- 1. Your three keys ----------------------------------------------------------
    Say "`n=== 1. Your keys (saved for scripts) ===" Cyan
    $keyInfo = [ordered]@{
        'OMNIROUTE_MANAGE_KEY' = 'OmniRoute key WITH Management Access (admin-cli)'
        'OMNIROUTE_KEY'        = 'OmniRoute key WITHOUT Management Access (openwebui)'
        'OWUI_KEY'             = 'Open WebUI API key (sk-...)'
    }
    foreach ($k in $keyInfo.Keys) {
        $current = [Environment]::GetEnvironmentVariable($k, 'User')
        if ($current) { Skip "$k already saved"; Set-Item "env:$k" $current; continue }
        $value = Read-Hidden "Paste $($keyInfo[$k]) (hidden, Enter to skip)"
        if ($value) {
            [Environment]::SetEnvironmentVariable($k, $value, 'User'); Set-Item "env:$k" $value; Ok "$k saved"
        } else { Warn "$k skipped"; $todo.Add("Create/paste $k ($($keyInfo[$k]))") }
    }

    $omniUp = Test-Up "$OmniUrl/v1/models"
    $owuiUp = Test-Up "$Url/health"
    if (-not $omniUp) { Warn "OmniRoute is not running at $OmniUrl - start it (start-ai.bat) and run -Configure again."; $todo.Add('Start OmniRoute, then run .\setup-ai.ps1 -Configure again') }
    if (-not $owuiUp) { Warn "Open WebUI is not running at $Url - start it (start-ai.bat) and run -Configure again."; $todo.Add('Start Open WebUI, then run .\setup-ai.ps1 -Configure again') }

    # --- 2. AI providers in OmniRoute -------------------------------------------------
    if ($omniUp -and $env:OMNIROUTE_MANAGE_KEY -and $env:OMNIROUTE_KEY) {
        Say "`n=== 2. AI providers in OmniRoute ===" Cyan
        $getCatalog = { @((Invoke-Api GET "$OmniUrl/v1/models" $env:OMNIROUTE_KEY).data | ForEach-Object { $_.id }) }
        try { $catalog = & $getCatalog } catch { $catalog = @(); Warn "cannot read OmniRoute models: $(Read-Error $_)" }

        $providers = @(
            @{ Id = 'groq';       Name = 'Groq';       Hint = 'gsk_...';   Where = 'console.groq.com' },
            @{ Id = 'gemini';     Name = 'Gemini';     Hint = 'AIza...';   Where = 'aistudio.google.com/apikey' },
            @{ Id = 'nvidia';     Name = 'NVIDIA NIM'; Hint = 'nvapi-...'; Where = 'build.nvidia.com' },
            @{ Id = 'openrouter'; Name = 'OpenRouter'; Hint = 'sk-or-...'; Where = 'openrouter.ai/keys' }
        )
        foreach ($p in $providers) {
            if ($catalog | Where-Object { $_ -like "$($p.Id)/*" }) { Skip "$($p.Name) already connected"; continue }
            $key = Read-Hidden "Paste your $($p.Name) key $($p.Hint) from $($p.Where) (hidden, Enter to skip)"
            if (-not $key) { Warn "$($p.Name) skipped"; continue }
            try {
                Invoke-Api POST "$OmniUrl/api/providers" $env:OMNIROUTE_MANAGE_KEY ([ordered]@{ provider = $p.Id; apiKey = $key; name = 'Primary' }) | Out-Null
                Start-Sleep -Seconds 3
                $catalog = & $getCatalog
                if ($catalog | Where-Object { $_ -like "$($p.Id)/*" }) { Ok "$($p.Name) connected" }
                else { Warn "$($p.Name) added - models not listed yet. In OmniRoute: Providers > $($p.Name) > Test > Import from /models"; $todo.Add("OmniRoute: $($p.Name) > Test > Import from /models") }
            } catch {
                Warn "$($p.Name) could not be added: $(Read-Error $_)"
                $todo.Add("Add $($p.Name) by hand: OmniRoute > Providers > + Add Provider")
            }
            $key = $null
        }

        # Local Ollama (OpenAI-compatible connection - added by hand once, then detected here)
        $local = $catalog | Where-Object { $_ -notlike 'ollama-cloud/*' -and $_ -like "*/$LocalModel" }
        if ($local) { Skip "local Ollama connected ($($local | Select-Object -First 1))" }
        else {
            Warn 'local Ollama is not connected to OmniRoute yet (one-time browser step).'
            $todo.Add("OmniRoute: + Add OpenAI Compatible > Name ollama, Base URL $OllamaUrl/v1, API key ollama > Test > Import from /models")
        }
    }

    # --- 3. Open WebUI -------------------------------------------------------------------
    if ($owuiUp -and $env:OWUI_KEY -and $env:OMNIROUTE_KEY) {
        Say "`n=== 3. Open WebUI ===" Cyan

        # Connection to OmniRoute (keeps your existing model list)
        try {
            $cfg = Invoke-Api GET "$Url/openai/config" $env:OWUI_KEY
            $cfg.ENABLE_OPENAI_API = $true
            $cfg.OPENAI_API_BASE_URLS = @("$OmniUrl/v1")
            $cfg.OPENAI_API_KEYS = @($env:OMNIROUTE_KEY)
            if (-not $cfg.OPENAI_API_CONFIGS) { $cfg | Add-Member -NotePropertyName OPENAI_API_CONFIGS -NotePropertyValue ([pscustomobject]@{}) -Force }
            if (-not $cfg.OPENAI_API_CONFIGS.'0') {
                $cfg.OPENAI_API_CONFIGS | Add-Member -NotePropertyName '0' -NotePropertyValue ([pscustomobject]@{ enable = $true; model_ids = @() }) -Force
            }
            Invoke-Api POST "$Url/openai/config/update" $env:OWUI_KEY $cfg | Out-Null
            Ok "connected to OmniRoute ($OmniUrl/v1)"
        } catch { Warn "connection not set: $(Read-Error $_)"; $todo.Add("Open WebUI: Admin > Settings > Connections > OpenAI API > $OmniUrl/v1 with the openwebui key") }

        # Direct Ollama connection off (Ollama is reached through OmniRoute)
        try {
            $ocfg = Invoke-Api GET "$Url/ollama/config" $env:OWUI_KEY
            if ($ocfg.ENABLE_OLLAMA_API) {
                $ocfg.ENABLE_OLLAMA_API = $false
                Invoke-Api POST "$Url/ollama/config/update" $env:OWUI_KEY $ocfg | Out-Null
                Ok 'direct Ollama connection switched off'
            } else { Skip 'direct Ollama connection already off' }
        } catch { Warn 'could not switch off the direct Ollama connection'; $todo.Add('Open WebUI: Admin > Settings > Connections > Ollama API > off') }

        # Background helper requests off (follow-ups, tags, autocomplete)
        try {
            $tcfg = Invoke-Api GET "$Url/api/v1/tasks/config" $env:OWUI_KEY
            foreach ($f in 'ENABLE_FOLLOW_UP_GENERATION', 'ENABLE_TAGS_GENERATION', 'ENABLE_AUTOCOMPLETE_GENERATION') {
                if ($tcfg.PSObject.Properties[$f]) { $tcfg.$f = $false }
            }
            Invoke-Api POST "$Url/api/v1/tasks/config/update" $env:OWUI_KEY $tcfg | Out-Null
            Ok 'follow-up, tag and autocomplete generation switched off'
        } catch { Warn 'could not change background task settings'; $todo.Add('Open WebUI: Admin > Settings > Interface > Follow-Up and Tags generation off') }
    }

    # --- 4. Combos + models + tests ---------------------------------------------------------
    if ($omniUp -and $owuiUp -and $env:OWUI_KEY -and $env:OMNIROUTE_KEY -and $env:OMNIROUTE_MANAGE_KEY) {
        Say "`n=== 4. Combos and models (ai-sync) ===" Cyan
        & (Join-Path $here 'ai-sync.ps1') -Prune -Test
    }
}

# =====================================================================================
Say "`n=== Summary ===" Cyan
if ($todo.Count -eq 0) { Say 'All done. Refresh Open WebUI (Ctrl + F5).' Green }
else {
    Say 'Still to do by hand:' Yellow
    $i = 0
    foreach ($t in ($todo | Select-Object -Unique)) { $i++; Say "  $i. $t" Yellow }
}
