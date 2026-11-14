# omniroute-combo.ps1 - create or update a fallback combo in OmniRoute from the command line
#
#   .\omniroute-combo.ps1                       create/update 'my-free' with the default model list
#   .\omniroute-combo.ps1 -Name my-coding -Models 'groq/openai/gpt-oss-120b','openrouter/cohere/north-mini-code:free'
#   .\omniroute-combo.ps1 -NoOllama             leave the local Ollama model out
#
# What it does, safe to run again at any time:
#   1. Finds your LOCAL Ollama models in OmniRoute, whatever the connection is called
#      (e.g. ollama-local/llama3.2:3b), by matching the models installed on this laptop
#   2. Checks every model exists; puts the local model last as the offline fallback
#   3. Creates the combo, or updates it if one with that name already exists
#   4. Adds it to Open WebUI (owui-models.ps1) and sends a test "hi"
# Strategy 'priority' = always try the first model, move down the list only on an error or limit.
# Needs an OmniRoute key WITH Management Access (OMNIROUTE_MANAGE_KEY).

param(
    [string]$Name = 'my-free',
    [string[]]$Models = @(
        'groq/openai/gpt-oss-120b',
        'gemini/gemini-3-flash-preview',
        'nvidia/nvidia/nemotron-3-ultra-550b-a55b',
        'openrouter/nvidia/nemotron-3.5-lightning:free'
    ),
    [string]$Strategy = 'priority',
    [switch]$NoOllama,
    [string]$OllamaUrl = 'http://localhost:11434',
    [string]$OmniUrl = 'http://localhost:20128',
    [string]$ManageKey = $env:OMNIROUTE_MANAGE_KEY,
    [string]$ChatKey = $env:OMNIROUTE_KEY
)

$ErrorActionPreference = 'Stop'

function Read-Error($err) {
    try {
        $stream = $err.Exception.Response.GetResponseStream()
        $text = (New-Object IO.StreamReader($stream, [Text.Encoding]::UTF8)).ReadToEnd()
        if ($text) { return $text }
    } catch { }
    return $err.Exception.Message
}

# One helper for every call: GET / POST / PUT / DELETE, UTF-8 in and out
function Invoke-Api([string]$Method, [string]$Uri, [string]$Key, $Object = $null) {
    $params = @{ Uri = $Uri; Method = $Method; Headers = @{ Authorization = "Bearer $Key" }; UseBasicParsing = $true }
    if ($null -ne $Object) {
        $json = ConvertTo-Json -InputObject $Object -Depth 20
        $params.ContentType = 'application/json; charset=utf-8'
        $params.Body = [Text.Encoding]::UTF8.GetBytes($json)
    }
    $resp = Invoke-WebRequest @params
    $text = [Text.Encoding]::UTF8.GetString($resp.RawContentStream.ToArray())
    if ($text) { return ($text | ConvertFrom-Json) } else { return $null }
}

# Lists come back as [..], {data:[..]} or {combos:[..]} depending on version
function As-List($obj) {
    if ($null -eq $obj) { return @() }
    if ($obj -is [array]) { return $obj }
    foreach ($p in 'data', 'combos', 'items') {
        if ($obj.PSObject.Properties[$p]) { return @($obj.$p) }
    }
    return @($obj)
}


function Find-LocalPick([string[]]$Installed) {
    $hits = @()
    foreach ($id in $script:catalog) {
        if ($id -like 'ollama-cloud/*') { continue }
        foreach ($m in $Installed) { if ($id -like "*/$m") { $hits += $id; break } }
    }
    return ($hits | Sort-Object { if ($_ -match '1b') { 0 } elseif ($_ -match '3b') { 1 } else { 2 } } | Select-Object -First 1)
}

function Hide-Secrets($obj) {
    # Copy of a connection record with anything key-like blanked (at any depth), safe to print
    $copy = $obj | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $stack = New-Object System.Collections.Stack
    $stack.Push($copy)
    while ($stack.Count -gt 0) {
        $o = $stack.Pop()
        if ($o -is [System.Management.Automation.PSCustomObject]) {
            foreach ($p in @($o.PSObject.Properties)) {
                if ($p.Name -match 'key|token|secret|password|auth|cookie') { $p.Value = '***' }
                elseif ($null -ne $p.Value) { $stack.Push($p.Value) }
            }
        } elseif ($o -is [array]) { foreach ($x in $o) { if ($null -ne $x) { $stack.Push($x) } } }
    }
    return $copy
}

function Import-LocalOllama([string[]]$Installed) {
    # 1. Find the OpenAI-compatible connection that points at local Ollama
    try { $raw = Invoke-Api GET "$OmniUrl/api/providers" $ManageKey }
    catch { Write-Host "  Could not list provider connections: $(Read-Error $_)" -ForegroundColor Yellow; return $null }

    $all = @()
    foreach ($p in 'connections', 'providers', 'data', 'items') {
        if ($raw.PSObject.Properties[$p]) { $all = @($raw.$p); break }
    }
    if ($all.Count -eq 0 -and $raw -is [array]) { $all = $raw }

    $conn = $all | Where-Object { ($_ | ConvertTo-Json -Depth 10 -Compress) -match '11434' } | Select-Object -First 1
    if (-not $conn) {
        Write-Host "  No connection pointing at $OllamaUrl found in OmniRoute." -ForegroundColor Yellow
        Write-Host "  Create it once: Providers > + Add OpenAI Compatible > Base URL $OllamaUrl/v1, API key: ollama"
        return $null
    }

    # 2. Its provider id can sit in different fields depending on version - try each
    $candidates = @()
    foreach ($f in 'provider', 'providerId', 'nodeId', 'providerNodeId', 'prefix', 'id') {
        if ($conn.PSObject.Properties[$f] -and $conn.$f -and -not ($candidates -contains [string]$conn.$f)) { $candidates += [string]$conn.$f }
    }

    foreach ($prov in $candidates) {
        $ok = 0
        foreach ($m in $Installed) {
            try {
                Invoke-Api POST "$OmniUrl/api/provider-models" $ManageKey ([ordered]@{ provider = $prov; modelId = $m; modelName = $m }) | Out-Null
                $ok++
            } catch {
                if ((Read-Error $_) -match 'exist') { $ok++ }
            }
        }
        if ($ok -gt 0) {
            Start-Sleep -Seconds 2
            try { $script:catalog = @((As-List (Invoke-Api GET "$OmniUrl/v1/models" $ChatKey)) | ForEach-Object { $_.id }) } catch { }
            $pick = Find-LocalPick $Installed
            if ($pick) { Write-Host "  Imported via provider '$prov'." -ForegroundColor Green; return $pick }
        }
    }

    # 3. Did not work - show the record (secrets hidden) so the right field can be identified
    Write-Host '  Import did not make the model visible. Connection record (keys hidden):' -ForegroundColor Yellow
    Write-Host ((Hide-Secrets $conn) | ConvertTo-Json -Depth 10)
    return $null
}

if (-not $ManageKey) {
    Write-Host 'No admin key. Create an OmniRoute key with Management Access ON, then:' -ForegroundColor Red
    Write-Host "  [Environment]::SetEnvironmentVariable('OMNIROUTE_MANAGE_KEY', 'your-admin-key', 'User')"
    return
}
if (-not $ChatKey) { $ChatKey = $ManageKey }

try { $script:catalog = @((As-List (Invoke-Api GET "$OmniUrl/v1/models" $ChatKey)) | ForEach-Object { $_.id }) }
catch { Write-Host "Could not read OmniRoute's model list: $(Read-Error $_)" -ForegroundColor Red; return }

# --- 1. Find the local Ollama model in OmniRoute -----------------------------------
$localPick = $null
if (-not $NoOllama) {
    # Chat models installed on this laptop (embedding models cannot chat, so skip them)
    $installed = @()
    try {
        $installed = @((Invoke-RestMethod -Uri "$OllamaUrl/api/tags" -UseBasicParsing).models |
            ForEach-Object { $_.name } | Where-Object { $_ -notmatch 'embed|bge|nomic|rerank' })
    } catch { }

    if ($installed.Count -eq 0) {
        Write-Host "Ollama is not running (or has no chat model) at $OllamaUrl - combo will be cloud-only." -ForegroundColor Yellow
        Write-Host '  Start Ollama from the Start menu, or pull a model: ollama pull llama3.2:3b'
    } else {
        $localPick = Find-LocalPick $installed

        if (-not $localPick) {
            Write-Host "Ollama is running ($($installed -join ', ')), but OmniRoute lists none of its models. Trying to import them..." -ForegroundColor Cyan
            $localPick = Import-LocalOllama $installed
        }

        if ($localPick) {
            Write-Host "Local Ollama model found in OmniRoute: $localPick" -ForegroundColor Green
        } else {
            Write-Host '  Could not import automatically. One-time step in OmniRoute > Providers:' -ForegroundColor Yellow
            Write-Host "    open the OpenAI Compatible connection for $OllamaUrl/v1 > Test > Import from /models,"
            Write-Host '    then run this script again.'
        }
    }
}

# --- 2. Check the cloud models; local model goes last ---------------------------------
$final = New-Object 'System.Collections.Generic.List[string]'
foreach ($m in $Models) {
    if ($final.Contains($m)) { continue }
    if ($catalog -contains $m) { $final.Add($m); Write-Host "  ok       $m" -ForegroundColor Green }
    else { Write-Host "  missing  $m  (skipped - check the ID with owui-models.ps1 -Search)" -ForegroundColor Yellow }
}
if ($localPick -and -not $final.Contains($localPick)) {
    $final.Add($localPick)
    Write-Host "  ok       $localPick  (local, last resort)" -ForegroundColor Green
}
if ($final.Count -eq 0) { Write-Host 'No valid models - nothing created.' -ForegroundColor Red; return }

$body = [ordered]@{
    name     = $Name
    strategy = $Strategy
    models   = @($final | ForEach-Object { [ordered]@{ model = $_ } })
}

# --- 3. Create, or update if it already exists ----------------------------------------
$existing = $null
try { $existing = (As-List (Invoke-Api GET "$OmniUrl/api/combos" $ManageKey)) | Where-Object { $_.name -eq $Name } | Select-Object -First 1 } catch { }

try {
    if ($existing -and $existing.id) {
        try {
            Invoke-Api PUT "$OmniUrl/api/combos/$($existing.id)" $ManageKey $body | Out-Null
            Write-Host "Combo '$Name' updated ($Strategy, $($final.Count) models)." -ForegroundColor Green
        } catch {
            # Some versions do not accept PUT: replace it instead
            Invoke-Api DELETE "$OmniUrl/api/combos/$($existing.id)" $ManageKey | Out-Null
            Invoke-Api POST "$OmniUrl/api/combos" $ManageKey $body | Out-Null
            Write-Host "Combo '$Name' replaced ($Strategy, $($final.Count) models)." -ForegroundColor Green
        }
    } else {
        $result = Invoke-Api POST "$OmniUrl/api/combos" $ManageKey $body
        Write-Host "Combo '$Name' created ($Strategy, $($final.Count) models)." -ForegroundColor Green
        if ($result -and $result.warning) { Write-Host "OmniRoute warning: $($result.warning)" -ForegroundColor Yellow }
    }
} catch {
    Write-Host "Saving the combo failed: $(Read-Error $_)" -ForegroundColor Red
    return
}
Write-Host ("Order: " + ($final -join '  ->  '))

# --- 4. Make sure Open WebUI has it, then test ------------------------------------------
$helper = Join-Path $PSScriptRoot 'owui-models.ps1'
if ((Test-Path $helper) -and $env:OWUI_KEY) { & $helper -Add $Name }
else { Write-Host "Add it to Open WebUI with: .\owui-models.ps1 -Add '$Name'" }

try {
    $test = Invoke-Api POST "$OmniUrl/v1/chat/completions" $ChatKey ([ordered]@{
        model = $Name; messages = @(@{ role = 'user'; content = 'hi' }) })
    Write-Host ''
    Write-Host "Test reply : $($test.choices[0].message.content)"
    Write-Host "Answered by: $($test.model)   input tokens: $($test.usage.prompt_tokens)" -ForegroundColor Cyan
} catch {
    Write-Host "Test message failed: $(Read-Error $_)" -ForegroundColor Yellow
}
