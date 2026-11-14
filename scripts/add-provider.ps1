# add-provider.ps1 - add an AI provider and its models, step by step
#
#   .\add-provider.ps1             interactive
#   .\add-provider.ps1 -Inspect    read-only: show how custom connections are stored (keys hidden)
#
#   1. Pick a provider from the menu (or a custom one such as Kaggle)
#   2. Paste its API key (hidden) - the script adds it to OmniRoute and checks it works
#   3. It fetches that provider's models and lists them
#   4. Pick the models you want (and optionally a combo)
#   5. It updates ai-models.json and applies everything (ai-sync)
#
# Needs OMNIROUTE_MANAGE_KEY, OMNIROUTE_KEY and OWUI_KEY (saved by setup-ai.ps1 -Configure).

param(
    [switch]$Inspect,                 # read-only: show how OmniRoute stores custom (OpenAI-compatible) connections
    [string]$OmniUrl = 'http://localhost:20128',
    [string]$File = ''                 # default: C:\Users\YOU\ai-config\ai-models.json
)

$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot

# --- Your list lives in ONE place, shared by every version of the scripts ---------------------
#   Default: C:\Users\YOU\ai-config\ai-models.json   (change with the AI_CONFIG_DIR environment variable)
#   Backups: C:\Users\YOU\ai-config\backups\         (last 10 kept, made before every change)
function Get-ConfigDir {
    if ($env:AI_CONFIG_DIR) { return $env:AI_CONFIG_DIR }
    $home_ = if ($env:USERPROFILE) { $env:USERPROFILE } else { $HOME }
    return (Join-Path $home_ 'ai-config')
}

function Resolve-ConfigFile([string]$Requested) {
    if ($Requested) { return $Requested }
    $dir  = Get-ConfigDir
    $file = Join-Path $dir 'ai-models.json'
    $local = Join-Path $PSScriptRoot 'ai-models.json'
    $template = Join-Path $PSScriptRoot 'ai-models.default.json'
    if (-not (Test-Path $file)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        if (Test-Path $local) {
            Copy-Item $local $file
            Rename-Item $local 'ai-models.json.moved' -Force
            Write-Host "Your list now lives in one place: $file (the copy here was renamed to ai-models.json.moved)" -ForegroundColor Cyan
        } elseif (Test-Path $template) {
            Copy-Item $template $file
            Write-Host "Created your list from the default: $file" -ForegroundColor Cyan
        } else {
            throw "No list found. Expected $file or ai-models.default.json next to the scripts."
        }
    } elseif (Test-Path $local) {
        # An old copy next to the scripts would be confusing: keep it, but out of the way
        Rename-Item $local 'ai-models.json.ignored' -Force
        Write-Host "Using $file. The old copy in this folder was renamed to ai-models.json.ignored." -ForegroundColor DarkYellow
    }
    return $file
}

function Backup-Config([string]$Path, [int]$Keep = 10) {
    if (-not (Test-Path $Path)) { return }
    $dir = Join-Path (Split-Path $Path) 'backups'
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Copy-Item $Path (Join-Path $dir ('ai-models-{0:yyyyMMdd-HHmmss}.json' -f (Get-Date)))
    Get-ChildItem $dir -Filter 'ai-models-*.json' | Sort-Object Name -Descending |
        Select-Object -Skip $Keep | Remove-Item -Force
}

$File = Resolve-ConfigFile $File

function Say([string]$Text, [string]$Colour = 'Gray') { Write-Host $Text -ForegroundColor $Colour }

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

function Get-Catalog { @((Invoke-Api GET "$OmniUrl/v1/models" $env:OMNIROUTE_KEY).data | ForEach-Object { $_.id }) }

# Turn "1,3,5-7" into numbers
function Parse-Selection([string]$Text, [int]$Max) {
    $out = @()
    foreach ($part in ($Text -split ',')) {
        $p = $part.Trim()
        if ($p -match '^(\d+)-(\d+)$') { $out += [int]$Matches[1]..[int]$Matches[2] }
        elseif ($p -match '^\d+$') { $out += [int]$p }
    }
    return @($out | Where-Object { $_ -ge 1 -and $_ -le $Max } | Select-Object -Unique)
}

# Write ai-models.json in a tidy, readable layout
function Save-List($cfg) {
    $q = { param($s) '"' + ($s -replace '"', '\"') + '"' }
    $lines = @('{', '  "combos": {')
    $names = @($cfg.combos.PSObject.Properties.Name)
    for ($i = 0; $i -lt $names.Count; $i++) {
        $items = @($cfg.combos.($names[$i])) | ForEach-Object { '      ' + (& $q $_) }
        $lines += '    ' + (& $q $names[$i]) + ': ['
        $lines += ($items -join ",`r`n")
        $lines += '    ]' + $(if ($i -lt $names.Count - 1) { ',' } else { '' })
    }
    $lines += '  },'
    $lines += '  "models": ['
    $lines += ((@($cfg.models) | ForEach-Object { '    ' + (& $q $_) }) -join ",`r`n")
    if ($cfg.settings) {
        $lines += '  ],'
        $json = ConvertTo-Json -InputObject $cfg.settings -Depth 10
        $lines += '  "settings": ' + (($json -split "`r?`n") -join "`r`n  ")
    } else {
        $lines += '  ]'
    }
    $lines += '}'
    [IO.File]::WriteAllText($File, ($lines -join "`r`n") + "`r`n", (New-Object Text.UTF8Encoding($false)))
}

# --- Checks ----------------------------------------------------------------------------
foreach ($v in 'OMNIROUTE_MANAGE_KEY', 'OMNIROUTE_KEY', 'OWUI_KEY') {
    if (-not [Environment]::GetEnvironmentVariable($v)) { Say "Missing $v - run .\setup-ai.ps1 -Configure first." Red; return }
}
try { $catalog = Get-Catalog } catch { Say "OmniRoute is not answering at $OmniUrl - start it (start-ai.bat)." Red; return }
if (-not (Test-Path $File)) { Say "List file not found: $File" Red; return }

# --- Inspect (read-only, keys hidden): helps automate custom connections such as Kaggle ---------
if ($Inspect) {
    function Hide($o) {
        if ($o -is [System.Management.Automation.PSCustomObject]) {
            foreach ($p in @($o.PSObject.Properties)) {
                if ($p.Name -match 'key|token|secret|password|auth|cookie|credential') { $p.Value = '***' }
                elseif ($p.Value -is [string] -and $p.Name -match 'url|host|endpoint|domain|address' -and
                        $p.Value -notmatch '^(https?://)?(localhost|127\.0\.0\.1)(:|/|$)') { $p.Value = '<address hidden>' }
                else { Hide $p.Value }
            }
        } elseif ($o -is [array]) { foreach ($x in $o) { Hide $x } }
    }
    foreach ($path in '/api/providers', '/api/provider-nodes') {
        Say "`nGET $path" Cyan
        try {
            $data = Invoke-Api GET "$OmniUrl$path" $env:OMNIROUTE_MANAGE_KEY
            $text = ConvertTo-Json -InputObject $data -Depth 8 -Compress
            # Show only entries that look custom/OpenAI-compatible (kaggle, ollama, compatible), keys hidden
            $copy = $text | ConvertFrom-Json
            Hide $copy
            $list = @()
            foreach ($prop in 'connections', 'providers', 'nodes', 'data', 'items') { if ($copy.PSObject.Properties[$prop]) { $list = @($copy.$prop); break } }
            if ($list.Count -eq 0 -and $copy -is [array]) { $list = $copy }
            $custom = @($list | Where-Object { (ConvertTo-Json $_ -Depth 8 -Compress) -match 'kaggle|ollama|compatible|11434|ngrok' })
            if ($custom.Count -eq 0) { $custom = @($list | Select-Object -First 2) }
            Say (ConvertTo-Json -InputObject $custom -Depth 8)
        } catch { Say "  not available: $(Read-Error $_)" DarkGray }
    }
    Say "`nKeys and non-local addresses are hidden above. Before sharing this anywhere, check again that no key," Yellow
    Say "token or tunnel address is left in it." Yellow
    return
}

# --- 1. Pick a provider ----------------------------------------------------------------------
$menu = @(
    @{ Id = 'groq';       Name = 'Groq';           Cost = 'FREE';        Key = 'gsk_...';   Where = 'console.groq.com > API Keys';
       Limits = 'Per-model limits; some models allow only 2,000-7,000 tokens per minute';
       Data = 'States it does not train on API data';
       Mind = 'Fastest replies. Small per-minute limits can reject big messages (error 413).' },
    @{ Id = 'gemini';     Name = 'Google Gemini';  Cost = 'FREE';        Key = 'AIza...';   Where = 'aistudio.google.com/apikey';
       Limits = 'Per-model daily limits; Flash models are the free ones';
       Data = 'Free tier: prompts may be used to improve Google products and read by human reviewers (outside EU/UK/Switzerland)';
       Mind = 'Never send private or work data. Adding billing changes the terms but can start charges.' },
    @{ Id = 'nvidia';     Name = 'NVIDIA NIM';     Cost = 'FREE TRIAL';  Key = 'nvapi-...'; Where = 'build.nvidia.com';
       Limits = 'About 40 requests per minute; many models, including Mistral ones';
       Data = 'Not kept after a session, but may be used to improve products';
       Mind = 'For testing and evaluation only, not production. Can be ended at any time. Phone verification needed.' },
    @{ Id = 'openrouter'; Name = 'OpenRouter';     Cost = 'FREE + PAID'; Key = 'sk-or-...'; Where = 'openrouter.ai/keys';
       Limits = 'Free models end in :free - 20 per minute, 50 per day for ALL OpenRouter models together';
       Data = 'Depends on who hosts each model; about half of the free models may train on prompts';
       Mind = 'Pick only :free models to stay free. Free models can disappear without notice.' },
    @{ Id = 'mistral';    Name = 'Mistral';        Cost = 'CHECK';       Key = '';          Where = 'console.mistral.ai > API Keys';
       Limits = 'A free Experiment tier exists and is rate limited, but it needs phone verification and keys can stay inactive until that is done';
       Data = 'The free Experiment tier requires opting in to training, so prompts may be used to improve Mistral models';
       Mind = 'Check the current terms in the console before you rely on it. Free alternative: pick NVIDIA NIM and choose its mistralai/ models.' },
    @{ Id = 'cerebras';   Name = 'Cerebras';       Cost = 'CREDITS';     Key = 'csk-...';   Where = 'cloud.cerebras.ai';
       Limits = 'Starter credits rather than a standing free tier';
       Data = 'States it does not train on API data';
       Mind = 'May ask for a payment method before the API works. Set a spending limit first.' },
    @{ Id = 'cohere';     Name = 'Cohere';         Cost = 'FREE TRIAL';  Key = '';          Where = 'dashboard.cohere.com > API keys';
       Limits = 'Trial key, roughly 100 requests per day';
       Data = 'Check its terms';
       Mind = 'Non-commercial use only on the trial key.' },
    @{ Id = '';           Name = 'Other provider'; Cost = 'CHECK';       Key = '';          Where = 'the provider''s website';
       Limits = 'Unknown - check the provider''s pricing page';
       Data = 'Unknown - check whether it trains on or logs prompts';
       Mind = 'Type the provider ID exactly as OmniRoute names it. Avoid unknown relays for anything private.' },
    @{ Id = '#custom';    Name = 'Custom / Kaggle / your laptop Ollama (OpenAI-compatible)'; Cost = 'YOUR OWN'; Key = ''; Where = '';
       Limits = 'Kaggle: weekly GPU hours. Laptop: no provider quota - limited by your PC''s speed and memory';
       Data = 'Laptop Ollama: nothing leaves your PC. Kaggle is cloud: prompts travel through a tunnel to a cloud machine - not for personal, company, client or bank data';
       Mind = 'Added once in the OmniRoute page; this script then lists its models.' }
)

$costColour = @{ 'FREE' = 'Green'; 'FREE TRIAL' = 'Green'; 'FREE + PAID' = 'Yellow'; 'CREDITS' = 'Yellow'; 'PAID' = 'Red'; 'CHECK' = 'Yellow'; 'YOUR OWN' = 'Cyan' }

Say "`nWhich provider do you want to add?" Cyan
for ($i = 0; $i -lt $menu.Count; $i++) {
    $m = $menu[$i]
    $connected = if ($m.Id -and $m.Id -ne '#custom' -and ($catalog | Where-Object { $_ -like "$($m.Id)/*" })) { '  (already connected)' } else { '' }
    Write-Host ("  {0}. " -f ($i + 1)) -NoNewline
    Write-Host ("{0,-14}" -f "[$($m.Cost)]") -ForegroundColor $costColour[$m.Cost] -NoNewline
    Write-Host " $($m.Name)$connected"
}
$choice = Read-Host 'Number'
if ($choice -notmatch '^\d+$' -or [int]$choice -lt 1 -or [int]$choice -gt $menu.Count) { Say 'No valid choice - nothing changed.' Yellow; return }
$p = $menu[[int]$choice - 1]

Say ''
Write-Host '  Cost        : ' -NoNewline; Write-Host $p.Cost -ForegroundColor $costColour[$p.Cost]
Say "  Limits      : $($p.Limits)"
Say "  Your data   : $($p.Data)"
Say "  Keep in mind: $($p.Mind)" Yellow
if ($p.Cost -eq 'PAID') {
    if ((Read-Host '  This provider needs a paid plan. Continue anyway? (y/N)') -notmatch '^[yY]') { Say 'Nothing changed.'; return }
}
elseif ($p.Cost -eq 'CHECK') {
    if ((Read-Host '  Check this provider''s current terms and costs before you rely on it. Continue? (y/N)') -notmatch '^[yY]') { Say 'Nothing changed.'; return }
}

# --- 2. Connect it ------------------------------------------------------------------------------
$keyAdded = $false
if ($p.Id -eq '#custom') {
    Say "`nOne-time step in the OmniRoute page ($OmniUrl > Providers > + Add OpenAI Compatible):" Cyan
    Say '  Name and Prefix : a short word, e.g. kaggle (or ollama for your laptop)'
    Say '  Base URL        : the server address ending in /v1'
    Say '                    Kaggle: https://YOUR-ADDRESS/v1   Laptop Ollama: http://localhost:11434/v1'
    Say '  API key         : Kaggle: your OLLAMA_API_TOKEN   Laptop Ollama: ollama'
    Say '  Then: Check > Add > Import from /models'
    $prefix = (Read-Host "`nWhen done, type the Prefix you used (e.g. kaggle)").Trim().Trim('/')
    if (-not $prefix) { Say 'No prefix - nothing changed.' Yellow; return }
} else {
    $prefix = $p.Id
    if (-not $prefix) {
        $prefix = (Read-Host 'Provider ID as OmniRoute names it (e.g. deepseek)').Trim().ToLower()
        if (-not $prefix) { Say 'No provider ID - nothing changed.' Yellow; return }
    }

    $already = [bool]($catalog | Where-Object { $_ -like "$prefix/*" })
    $addKey = $true
    if ($already) {
        $addKey = (Read-Host "$($p.Name) is already connected. Add another key anyway? (y/N)") -match '^[yY]'
    }
    if ($addKey) {
        if ($p.Where) { Say "  Get the key at: $($p.Where)" }
        $hint = if ($p.Key) { " $($p.Key)" } else { '' }
        $key = Read-Hidden "Paste the $($p.Name) API key$hint (hidden)"
        if (-not $key) { Say 'No key - nothing changed.' Yellow; return }
        Say '  Adding to OmniRoute (a few seconds) ...'
        try {
            Invoke-Api POST "$OmniUrl/api/providers" $env:OMNIROUTE_MANAGE_KEY ([ordered]@{ provider = $prefix; apiKey = $key; name = 'Primary' }) | Out-Null
            Say '  Added.' Green
            $keyAdded = $true
        } catch {
            Say "  OmniRoute refused it: $(Read-Error $_)" Red
            Say "  Check the key, or add it in the OmniRoute page (Providers > + Add Provider), then run this again and pick it." Yellow
            return
        } finally { $key = $null }
    }
}

# --- 3. Fetch its models ---------------------------------------------------------------------------
if ($keyAdded) { Say "`nFetching models from the new key (usually under 30 seconds, waits up to 30) ..." Cyan }
else           { Say "`nFetching models (a few seconds) ..." Cyan }
$models = @()
for ($try = 0; $try -lt 10; $try++) {
    try { $catalog = Get-Catalog } catch { }
    $models = @($catalog | Where-Object { $_ -like "$prefix/*" } | Sort-Object)
    if ($models.Count -gt 0) { break }
    Start-Sleep -Seconds 3
}
if ($models.Count -eq 0) {
    Say "  No '$prefix/' models yet. In OmniRoute open the provider > Test > Import from /models, then run this again." Yellow
    return
}

# Keep chat models; hide embeddings, speech, image and video models
$chat = @($models | Where-Object { $_ -notmatch 'embed|rerank|whisper|tts|transcribe|speech|audio|flux|image|veo|sora|video|seedance|kling|wan-|lyria|parakeet|safety|guard|fastpitch|tacotron|calibration|parse|riva-tts' })
if ($prefix -eq 'openrouter') {
    $free = @($chat | Where-Object { $_ -like '*:free' })
    $onlyFree = (Read-Host "OpenRouter has $($chat.Count) chat models; $($free.Count) are free. Show only free ones? (Y/n)") -notmatch '^[nN]'
    if ($onlyFree) { $chat = $free }
}

# --- 4. Validate a NEW key with one short message (skipped for providers already connected) ----------
if ($keyAdded -and $chat.Count -gt 0) {
    $testModel = $chat | Select-Object -First 1
    Say "Testing the new key with one short message to $testModel (up to 1 minute) ..." DarkGray
    try {
        $params = @{ Uri = "$OmniUrl/v1/chat/completions"; Method = 'Post'; UseBasicParsing = $true; TimeoutSec = 60
                     Headers = @{ Authorization = "Bearer $env:OMNIROUTE_KEY" }; ContentType = 'application/json; charset=utf-8'
                     Body = [Text.Encoding]::UTF8.GetBytes((ConvertTo-Json @{ model = $testModel; max_tokens = 20; messages = @(@{ role = 'user'; content = 'Reply with: OK' }) } -Depth 5)) }
        $r = (Invoke-WebRequest @params).Content | ConvertFrom-Json
        Say "  Key works: $testModel answered '$(([string]$r.choices[0].message.content).Trim())'" Green
    } catch {
        Say "  That model did not answer in time. The key is added and its models are listed; some models are just slow or busy." Yellow
    }
}

# --- 5. Pick models ----------------------------------------------------------------------------------
$cfg = [IO.File]::ReadAllText($File) | ConvertFrom-Json
$inList = @($cfg.models)
Say "`n$($chat.Count) chat models from '$prefix':" Cyan
for ($i = 0; $i -lt $chat.Count; $i++) {
    $mark = if ($inList -contains $chat[$i]) { '  [already added]' } else { '' }
    Say ("  {0,3}. {1}{2}" -f ($i + 1), $chat[$i], $mark)
}
$sel = Read-Host "`nWhich ones? e.g. 1,3,5-7  or 'all'  (Enter = none)"
if (-not $sel) { Say 'Nothing selected - nothing changed.' Yellow; return }
$picked = if ($sel.Trim() -eq 'all') { $chat } else { @(Parse-Selection $sel $chat.Count | ForEach-Object { $chat[$_ - 1] }) }
if ($picked.Count -eq 0) { Say 'No valid numbers - nothing changed.' Yellow; return }

$newModels = @($inList)
foreach ($m in $picked) { if ($newModels -notcontains $m) { $newModels += $m } }
$cfg.models = $newModels

# --- 6. Optional: add to a combo (before 'local', so your laptop stays the last resort) ---------------
$comboNames = @($cfg.combos.PSObject.Properties.Name)
if ($comboNames.Count -gt 0) {
    $c = Read-Host "Also add them to a combo? $($comboNames -join ' / ') (Enter = no)"
    if ($c -and ($comboNames -contains $c.Trim())) {
        $list = @($cfg.combos.($c.Trim()))
        $tail = @($list | Where-Object { $_ -eq 'local' })
        $head = @($list | Where-Object { $_ -ne 'local' })
        foreach ($m in $picked) { if ($head -notcontains $m) { $head += $m } }
        $cfg.combos.($c.Trim()) = @($head + $tail)
        Say "  Added to combo '$($c.Trim())' (before 'local')." Green
    }
}

Backup-Config $File
Save-List $cfg
Say "Saved to $File : $($picked -join ', ')" Green

# --- 7. Apply ------------------------------------------------------------------------------------------
Say "`nApplying to OmniRoute and Open WebUI (about 10-30 seconds) ..." Cyan
& (Join-Path $here 'ai-sync.ps1') -Prune
