# ai-sync.ps1 - one list file, one command
#
#   .\ai-sync.ps1 -Find kaggle     find exact model IDs in OmniRoute (any provider)
#   .\ai-sync.ps1 -Edit            open ai-models.json in Notepad
#   .\ai-sync.ps1                  apply ai-models.json: combos in OmniRoute + models in Open WebUI
#   .\ai-sync.ps1 -Prune           same, and also REMOVE Open WebUI models that are not in the file
#   .\ai-sync.ps1 -Test            apply, then run the fallback test on every combo
#
# OPTIONAL FEATURES - all OFF by default (fewest tokens). Switch on only what you need:
#   .\ai-sync.ps1 -Enable file_upload                      attach files/documents in chat
#   .\ai-sync.ps1 -Enable vision -VisionModels id1,id2     these models may receive images
#   .\ai-sync.ps1 -Enable image -ImageModel id             image generation in Open WebUI
#   .\ai-sync.ps1 -Enable web_search                       web search toggle (needs web search set up in Open WebUI)
#   .\ai-sync.ps1 -Enable code_interpreter / memory / builtin_tools   (builtin_tools adds thousands of tokens per message)
#   .\ai-sync.ps1 -Disable file_upload                     switch a feature off again
#   .\ai-sync.ps1 -Context 8192                            context window of your laptop's Ollama (0 = leave unchanged)
#   .\ai-sync.ps1 -Features                                show what is on and off
#   .\ai-sync.ps1 -Detail                                  full output of every step (default: only what changed)
#
# YOUR LIST lives in one place for every script version: C:\Users\YOU\ai-config\ai-models.json
#   .\ai-sync.ps1 -Restore latest                          undo: bring back the newest backup
#   .\ai-sync.ps1 -Restore ai-models-20261114-101500.json  a specific backup (ai-config\backups)
#
# Needs OWUI_KEY, OMNIROUTE_KEY and OMNIROUTE_MANAGE_KEY environment variables.

param(
    [string]$Find,
    [switch]$Edit,
    [switch]$Prune,
    [switch]$Test,
    [string[]]$Enable = @(),
    [string[]]$Disable = @(),
    [string[]]$VisionModels = @(),
    [string]$ImageModel,
    [int]$Context = -1,
    [switch]$Features,
    [switch]$Detail,                   # show the full output of every step
    [string]$File = '',                 # default: C:\Users\YOU\ai-config\ai-models.json
    [string]$Restore,                  # 'latest' or a backup file name
    [string]$Url = 'http://localhost:8080',
    [string]$OmniUrl = 'http://localhost:20128',
    [string]$OllamaUrl = 'http://localhost:11434'
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

if ($Restore) {
    $bdir = Join-Path (Split-Path $File) 'backups'
    $pick = if ($Restore -eq 'latest') { Get-ChildItem $bdir -Filter 'ai-models-*.json' -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1 }
            else { Get-Item (Join-Path $bdir $Restore) -ErrorAction SilentlyContinue }
    if (-not $pick) { Write-Host "No backup found in $bdir" -ForegroundColor Red; return }
    Backup-Config $File
    Copy-Item $pick.FullName $File -Force
    Write-Host "Restored $($pick.Name). Run .\ai-sync.ps1 -Prune to apply it." -ForegroundColor Green
    return
}

if ($Edit) { Backup-Config $File; Start-Process notepad $File; Write-Host "Editing $File (a backup was made first)."; return }
if ($Find) { & (Join-Path $here 'owui-models.ps1') -Search $Find; return }

foreach ($v in 'OWUI_KEY', 'OMNIROUTE_KEY', 'OMNIROUTE_MANAGE_KEY') {
    if (-not [Environment]::GetEnvironmentVariable($v)) {
        Write-Host "Missing environment variable $v - see the guide, Step 7." -ForegroundColor Red; return
    }
}
if (-not (Test-Path $File)) { Write-Host "List file not found: $File" -ForegroundColor Red; return }
Write-Host "List: $File" -ForegroundColor DarkGray

function Get-Json([string]$Uri, [string]$Key) {
    $resp = Invoke-WebRequest -Uri $Uri -Headers @{ Authorization = "Bearer $Key" } -UseBasicParsing
    return ([Text.Encoding]::UTF8.GetString($resp.RawContentStream.ToArray()) | ConvertFrom-Json)
}

# --- Read the list file --------------------------------------------------------------
try { $cfg = [IO.File]::ReadAllText($File) | ConvertFrom-Json }
catch {
    Write-Host "ai-models.json has a typo: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host '  Check for a missing comma or quote. Every line in a list ends with a comma except the last.'
    return
}

# --- Optional features: read, change on request, save --------------------------------------
$FeatureNames = @('file_upload', 'vision', 'image', 'web_search', 'code_interpreter', 'memory', 'builtin_tools')
$flagNames    = @('file_upload', 'web_search', 'code_interpreter', 'memory', 'builtin_tools')

if (-not $cfg.settings) { $cfg | Add-Member -NotePropertyName settings -NotePropertyValue ([pscustomobject]@{}) -Force }
$defaults = [ordered]@{ file_upload = $false; web_search = $false; code_interpreter = $false; memory = $false;
                        builtin_tools = $false; vision_models = @(); image_model = ''; local_context = 0 }
foreach ($k in $defaults.Keys) {
    if (-not $cfg.settings.PSObject.Properties[$k]) { $cfg.settings | Add-Member -NotePropertyName $k -NotePropertyValue $defaults[$k] }
}

function Save-List($cfg) {
    # Tidy, readable layout; keeps combos, models and settings
    $q = { param($v) '"' + ([string]$v -replace '"', '\"') + '"' }
    $L = @('{', '  "combos": {')
    $names = @($cfg.combos.PSObject.Properties.Name)
    for ($i = 0; $i -lt $names.Count; $i++) {
        $L += '    ' + (& $q $names[$i]) + ': ['
        $L += ((@($cfg.combos.($names[$i])) | ForEach-Object { '      ' + (& $q $_) }) -join ",`r`n")
        $L += '    ]' + $(if ($i -lt $names.Count - 1) { ',' } else { '' })
    }
    $L += '  },'
    $L += '  "models": ['
    $L += ((@($cfg.models) | ForEach-Object { '    ' + (& $q $_) }) -join ",`r`n")
    $L += '  ],'
    $st = $cfg.settings
    $b = { param($v) if ($v) { 'true' } else { 'false' } }
    $vm = @($st.vision_models | Where-Object { $_ })
    $L += '  "settings": {'
    $L += '    "file_upload": ' + (& $b $st.file_upload) + ','
    $L += '    "web_search": ' + (& $b $st.web_search) + ','
    $L += '    "code_interpreter": ' + (& $b $st.code_interpreter) + ','
    $L += '    "memory": ' + (& $b $st.memory) + ','
    $L += '    "builtin_tools": ' + (& $b $st.builtin_tools) + ','
    $L += '    "vision_models": [' + (($vm | ForEach-Object { & $q $_ }) -join ', ') + '],'
    $L += '    "image_model": ' + (& $q $st.image_model) + ','
    $L += '    "local_context": ' + [int]$st.local_context
    $L += '  }'
    $L += '}'
    [IO.File]::WriteAllText($File, ($L -join "`r`n") + "`r`n", (New-Object Text.UTF8Encoding($false)))
}

function Show-Features($st) {
    $on = { param($v) if ($v) { 'ON ' } else { 'off' } }
    Write-Host ''
    Write-Host 'Optional features (off = fewest tokens):' -ForegroundColor Cyan
    foreach ($f in $flagNames) { Write-Host ("  {0}  {1}" -f (& $on $st.$f), $f) }
    $vm = @($st.vision_models | Where-Object { $_ })
    Write-Host ("  {0}  vision{1}" -f (& $on ($vm.Count -gt 0)), $(if ($vm.Count) { "  ($($vm -join ', '))" } else { '' }))
    Write-Host ("  {0}  image{1}" -f (& $on ([bool]$st.image_model)), $(if ($st.image_model) { "  ($($st.image_model))" } else { '' }))
    Write-Host ("  laptop context window: {0}" -f $(if ([int]$st.local_context -gt 0) { "$($st.local_context) tokens" } else { 'unchanged' }))
}

# Accept both  -Enable a,b  and  -Enable "a,b"
$Enable       = @($Enable       | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })
$Disable      = @($Disable      | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })
$VisionModels = @($VisionModels | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })

$changedSettings = $false
foreach ($name in @($Enable + $Disable)) {
    if ($FeatureNames -notcontains $name) {
        Write-Host "Unknown feature '$name'. Choose from: $($FeatureNames -join ', ')" -ForegroundColor Red; return
    }
}
foreach ($name in $Enable) {
    switch ($name) {
        'vision' {
            if ($VisionModels.Count -eq 0) { Write-Host 'Add the models that may receive images, e.g.: -Enable vision -VisionModels gemini/gemini-3-flash-preview' -ForegroundColor Red; return }
            $cfg.settings.vision_models = @($VisionModels)
        }
        'image' {
            if (-not $ImageModel) { Write-Host 'Add the image model, e.g.: -Enable image -ImageModel nvidia/black-forest-labs/flux.1-schnell' -ForegroundColor Red; return }
            $cfg.settings.image_model = $ImageModel
        }
        default { $cfg.settings.$name = $true }
    }
    $changedSettings = $true
}
foreach ($name in $Disable) {
    switch ($name) {
        'vision' { $cfg.settings.vision_models = @() }
        'image'  { $cfg.settings.image_model = '' }
        default  { $cfg.settings.$name = $false }
    }
    $changedSettings = $true
}
if ($Context -ge 0) { $cfg.settings.local_context = $Context; $changedSettings = $true }
if ($Enable -contains 'builtin_tools') {
    Write-Host 'Note: builtin_tools adds thousands of hidden tokens to every message and can break small-limit models (error 413).' -ForegroundColor Yellow
}
if ($changedSettings) { Backup-Config $File; Save-List $cfg; Write-Host "Saved your feature choices to $File" -ForegroundColor Green }
if ($Features) { Show-Features $cfg.settings; return }

# --- What OmniRoute offers, and which ID is the local model -------------------------------
Write-Host 'Checking OmniRoute and Open WebUI (a few seconds) ...' -ForegroundColor DarkGray
$catalog = @((Get-Json "$OmniUrl/v1/models" $env:OMNIROUTE_KEY).data | ForEach-Object { $_.id })

$localId = $null
try {
    $installed = @((Invoke-RestMethod -Uri "$OllamaUrl/api/tags" -UseBasicParsing).models |
        ForEach-Object { $_.name } | Where-Object { $_ -notmatch 'embed|bge|nomic|rerank' })
    $hits = @()
    foreach ($id in $catalog) {
        if ($id -like 'ollama-cloud/*') { continue }
        foreach ($m in $installed) { if ($id -like "*/$m") { $hits += $id; break } }
    }
    $localId = $hits | Sort-Object { if ($_ -match '1b') { 0 } elseif ($_ -match '3b') { 1 } else { 2 } } | Select-Object -First 1
} catch { }
if (-not $localId) { Write-Host "  !  your laptop model is not available (Ollama not running or not connected) - 'local' entries are skipped" -ForegroundColor Yellow }
elseif ($Detail) { Write-Host "local = $localId" -ForegroundColor DarkGray }

# Turn a list from the file into real, existing IDs
function Resolve-List($list, [string]$Where) {
    $out = New-Object 'System.Collections.Generic.List[string]'
    foreach ($m in @($list)) {
        $id = if ($m -eq 'local') { $localId } else { $m }
        if (-not $id) { continue }
        if ($out.Contains($id)) { continue }
        if ($catalog -contains $id) { $out.Add($id) }
        else {
            Write-Host "  !  skipped in ${Where}: '$m' is not offered by OmniRoute right now" -ForegroundColor Yellow
            $short = (($m -split '/')[-1] -split ':')[0]
            $stem = ($short -split '-')[0..([Math]::Min(1, ($short -split '-').Count - 1))] -join '-'
            $near = @($catalog | Where-Object { $_ -like "*$stem*" } | Select-Object -First 5)
            if ($near.Count) { Write-Host "     similar: $($near -join ', ')" -ForegroundColor DarkYellow }
            Write-Host "     If it should exist: OmniRoute > Providers > that provider > filter 'Hidden only' > eye icon." -ForegroundColor DarkYellow
        }
    }
    return ,$out.ToArray()
}

# Run a helper script; show its output only with -Detail (or when it reports a problem)
function Run-Step([string]$Script, [hashtable]$Arguments) {
    $lines = @(& (Join-Path $here $Script) @Arguments *>&1 | ForEach-Object { "$_" })
    if ($Detail) { $lines | ForEach-Object { Write-Host "     $_" -ForegroundColor DarkGray } }
    return ,$lines
}

function Report-Problems($lines) {
    $bad = @($lines | Where-Object { $_ -match 'fail|error|refused|invalid|could not|missing' })
    if ($bad.Count -and -not $Detail) { $bad | Select-Object -First 3 | ForEach-Object { Write-Host "     $_" -ForegroundColor Yellow } }
}

# --- 1. Combos: only touched when their model order changed --------------------------------------
Write-Host ''
Write-Host 'Combos' -ForegroundColor Cyan
$existing = @{}
try {
    $raw = Get-Json "$OmniUrl/api/combos" $env:OMNIROUTE_MANAGE_KEY
    $list = if ($raw -is [array]) { $raw } elseif ($raw.combos) { $raw.combos } elseif ($raw.data) { $raw.data } else { @($raw) }
    foreach ($c in $list) {
        if ($c.name) { $existing[$c.name] = (@($c.models | ForEach-Object { if ($_ -is [string]) { $_ } elseif ($_.model) { $_.model } else { $_.id } }) -join '|') }
    }
} catch { }

$comboNames = @()
if ($cfg.combos) {
    foreach ($c in $cfg.combos.PSObject.Properties) {
        $comboNames += $c.Name
        $ids = Resolve-List $c.Value "combo $($c.Name)"
        if ($ids.Count -eq 0) { Write-Host ("  {0,-12} no valid models - skipped" -f $c.Name) -ForegroundColor Red; continue }
        if ($existing.ContainsKey($c.Name) -and $existing[$c.Name] -eq ($ids -join '|') -and -not $Detail) {
            Write-Host ("  {0,-12} unchanged ({1} models)" -f $c.Name, $ids.Count) -ForegroundColor DarkGray
            continue
        }
        Write-Host ("  {0,-12} updating and testing (up to 30 seconds) ..." -f $c.Name) -ForegroundColor DarkGray
        $lines = Run-Step 'omniroute-combo.ps1' @{ Name = $c.Name; Models = $ids; NoOllama = $true }
        $state = if ($existing.ContainsKey($c.Name)) { 'updated' } else { 'created' }
        $answer = ($lines | Where-Object { $_ -match '^Answered by' } | Select-Object -First 1)
        Write-Host ("  {0,-12} {1}: {2}" -f $c.Name, $state, (($ids | ForEach-Object { ($_ -split '/')[-1] }) -join ' -> ')) -ForegroundColor Green
        if ($answer) { Write-Host "               test OK - $($answer -replace '\s+input tokens.*','')" -ForegroundColor DarkGray }
        Report-Problems $lines
    }
}

# --- 2. Models shown in Open WebUI: only new ones are added ---------------------------------------
Write-Host ''
Write-Host 'Open WebUI models' -ForegroundColor Cyan
$wanted = @()
$wanted += Resolve-List $cfg.models 'models'
$wanted += $comboNames
$current = @()
try { $current = @((Get-Json "$Url/openai/config" $env:OWUI_KEY).OPENAI_API_CONFIGS.'0'.model_ids) } catch { }
$toAdd = @($wanted | Where-Object { $current -notcontains $_ })
if ($toAdd.Count -gt 0) {
    $lines = Run-Step 'owui-models.ps1' @{ Add = $toAdd }
    foreach ($m in $toAdd) { Write-Host "  +  $m" -ForegroundColor Green }
    Report-Problems $lines
}
$removed = @()
if ($Prune) {
    $extra = @($current | Where-Object { $wanted -notcontains $_ })
    if ($extra.Count -gt 0) {
        $lines = Run-Step 'owui-models.ps1' @{ Remove = $extra }
        foreach ($m in $extra) { Write-Host "  -  $m" -ForegroundColor Yellow }
        Report-Problems $lines
        $removed = $extra
    }
}
if ($toAdd.Count -eq 0 -and $removed.Count -eq 0) { Write-Host "  no changes ($($wanted.Count) models)" -ForegroundColor DarkGray }

# --- 3. Optional features --------------------------------------------------------------------------
function Post-Json([string]$Uri, [string]$Key, $Object) {
    $body = [Text.Encoding]::UTF8.GetBytes((ConvertTo-Json -InputObject $Object -Depth 30))
    $resp = Invoke-WebRequest -Uri $Uri -Method Post -Headers @{ Authorization = "Bearer $Key" } `
        -ContentType 'application/json; charset=utf-8' -Body $body -UseBasicParsing -TimeoutSec 180
    $text = [Text.Encoding]::UTF8.GetString($resp.RawContentStream.ToArray())
    if ($text) { return ($text | ConvertFrom-Json) } else { return $null }
}

function Set-Deep($obj, [string[]]$Names, $Value) {
    # Set every property whose name matches one of $Names, at any depth; returns how many were set
    $count = 0
    if ($null -eq $obj -or -not ($obj -is [System.Management.Automation.PSCustomObject])) { return 0 }
    foreach ($p in @($obj.PSObject.Properties)) {
        if ($Names -contains $p.Name) { $p.Value = $Value; $count++ }
        elseif ($p.Value -is [System.Management.Automation.PSCustomObject]) { $count += Set-Deep $p.Value $Names $Value }
    }
    return $count
}

$set = $cfg.settings
if ($set) {
    # Capabilities per model: everything off unless switched on in ai-models.json (applied silently)
    $fileUpload = [bool]$set.file_upload
    $vision = @(); if ($set.vision_models) { $vision += Resolve-List @($set.vision_models | Where-Object { $_ }) 'vision_models' }   # += keeps items separate
    try {
        $records = @(Get-Json "$Url/api/v1/models/all" $env:OWUI_KEY)
        $changed = @()
        foreach ($r in $records) {
            if ($wanted -notcontains $r.id) { continue }
            if (-not $r.meta) { $r | Add-Member -NotePropertyName meta -NotePropertyValue ([pscustomobject]@{}) -Force }
            $caps = [ordered]@{
                vision = ($vision -contains $r.id); file_upload = $fileUpload; citations = $fileUpload
                usage = $true; status_updates = $true
                web_search = [bool]$set.web_search; image_generation = [bool]$set.image_model
                code_interpreter = [bool]$set.code_interpreter; terminal = $false
                memory = [bool]$set.memory; builtin_tools = [bool]$set.builtin_tools
            }
            $r.meta | Add-Member -NotePropertyName capabilities -NotePropertyValue ([pscustomobject]$caps) -Force
            $changed += $r
        }
        if ($changed.Count -gt 0) { Post-Json "$Url/api/v1/models/import" $env:OWUI_KEY @{ models = @($changed) } | Out-Null }
    } catch { Write-Host "  !  could not update model features: $($_.Exception.Message)" -ForegroundColor Yellow }

    Write-Host ''
    if ($changedSettings -or $Detail) { Show-Features $set }
    else {
        $on = @($flagNames | Where-Object { $set.$_ })
        if (@($set.vision_models | Where-Object { $_ }).Count) { $on += 'vision' }
        if ($set.image_model) { $on += 'image' }
        if ($on.Count) { Write-Host "Optional features on: $($on -join ', ')   (.\ai-sync.ps1 -Features for details)" -ForegroundColor DarkGray }
        else { Write-Host 'Optional features: all off - fewest tokens   (.\ai-sync.ps1 -Features to change)' -ForegroundColor DarkGray }
    }

    # Context window of the laptop model (Ollama reads it when it starts)
    if ([int]$set.local_context -gt 0) {
        $want = [string][int]$set.local_context
        $have = [Environment]::GetEnvironmentVariable('OLLAMA_CONTEXT_LENGTH', 'User')
        if ($have -ne $want) {
            [Environment]::SetEnvironmentVariable('OLLAMA_CONTEXT_LENGTH', $want, 'User')
            Write-Host "  OK laptop context window set to $want tokens - quit Ollama from the tray and run start-ai.bat to apply" -ForegroundColor Green
        }
    }

    # Image generation: tested only when it was just switched on (or with -Detail)
    if ($set.image_model -and ($Enable -contains 'image' -or $Detail)) {
        $img = $set.image_model
        Write-Host "  Testing image model '$img' (up to 1 minute) ..." -ForegroundColor DarkGray
        $ok = $false
        try {
            $r = Post-Json "$OmniUrl/v1/images/generations" $env:OMNIROUTE_KEY ([ordered]@{ model = $img; prompt = 'a simple red circle on a white background'; n = 1; size = '512x512' })
            $ok = [bool]($r.data)
        } catch { Write-Host "  !  OmniRoute could not make a test image with '$img': $($_.Exception.Message)" -ForegroundColor Yellow }
        if ($ok) {
            try {
                $ic = Get-Json "$Url/api/v1/images/config" $env:OWUI_KEY
                $n  = Set-Deep $ic @('enabled', 'ENABLE_IMAGE_GENERATION') $true
                $n += Set-Deep $ic @('engine', 'IMAGE_GENERATION_ENGINE') 'openai'
                $n += Set-Deep $ic @('OPENAI_API_BASE_URL', 'IMAGES_OPENAI_API_BASE_URL') "$OmniUrl/v1"
                $n += Set-Deep $ic @('OPENAI_API_KEY', 'IMAGES_OPENAI_API_KEY') $env:OMNIROUTE_KEY
                $n += Set-Deep $ic @('MODEL', 'IMAGE_GENERATION_MODEL') $img
                if ($n -lt 4) { throw "unexpected settings layout ($n fields matched)" }
                Post-Json "$Url/api/v1/images/config/update" $env:OWUI_KEY $ic | Out-Null
                Write-Host "  OK image generation uses '$img' (image icon in the chat box)" -ForegroundColor Green
            } catch {
                Write-Host "  !  set it by hand: Admin > Settings > Images > Engine OpenAI, URL $OmniUrl/v1, key = OMNIROUTE_KEY, model $img" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  !  image generation not set up - test your image models (guide section 5) and pick one that works" -ForegroundColor Yellow
        }
    }
}

# --- 4. Optional fallback test ------------------------------------------------------------------
if ($Test) {
    foreach ($n in $comboNames) {
        Write-Host ''
        Write-Host "Testing '$n' (about 30-60 seconds; your laptop model is the slowest) ..." -ForegroundColor Cyan
        & (Join-Path $here 'omniroute-test.ps1') -Name $n
    }
}

Write-Host ''
Write-Host 'Done. Refresh Open WebUI (Ctrl + F5).' -ForegroundColor Green
