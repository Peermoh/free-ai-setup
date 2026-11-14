# owui-models.ps1 - add, remove or find models without clicking in Open WebUI
#
#   Find model IDs in OmniRoute:   .\owui-models.ps1 -Search groq
#   Add models:                    .\owui-models.ps1 -Add 'groq/llama-3.3-70b-versatile','gemini/gemini-2.5-flash'
#   Remove models:                 .\owui-models.ps1 -Remove 'groq/openai/gpt-oss-safeguard-20b'
#   Re-apply settings to all:      .\owui-models.ps1
#
# Adding a model = put it in the Model IDs allow-list + switch it on + copy the same
# token-saving settings (Builtin Tools off etc.) that your existing models already use.
# The Open WebUI admin key comes from -Key, or from the OWUI_KEY environment variable.

param(
    [string]$Key = $env:OWUI_KEY,
    [string[]]$Add = @(),
    [string[]]$Remove = @(),
    [string]$Search,
    [string]$Url = 'http://localhost:8080',
    [string]$OmniUrl = 'http://localhost:20128',
    [string]$OmniKey = $env:OMNIROUTE_KEY
)

$ErrorActionPreference = 'Stop'

function Get-Json([string]$Uri, [hashtable]$Headers) {
    $resp = Invoke-WebRequest -Uri $Uri -Headers $Headers -UseBasicParsing
    return ([Text.Encoding]::UTF8.GetString($resp.RawContentStream.ToArray()) | ConvertFrom-Json)
}

function Post-Json([string]$Uri, $Object) {
    $json = ConvertTo-Json -InputObject $Object -Depth 50
    Invoke-WebRequest -Uri $Uri -Method Post -Headers $script:owui `
        -ContentType 'application/json; charset=utf-8' `
        -Body ([Text.Encoding]::UTF8.GetBytes($json)) -UseBasicParsing | Out-Null
}

# --- Search: list model IDs that OmniRoute offers ------------------------------
if ($Search) {
    $omniHeaders = @{}
    if ($OmniKey) { $omniHeaders.Authorization = "Bearer $OmniKey" }
    try {
        $list = Get-Json "$OmniUrl/v1/models" $omniHeaders
        $found = @($list.data | Where-Object { $_.id -like "*$Search*" } | Sort-Object id)
        $found | ForEach-Object { Write-Host $_.id }
        Write-Host ("{0} models match '{1}'" -f $found.Count, $Search) -ForegroundColor Cyan
    } catch {
        Write-Host "Could not read OmniRoute's model list: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host 'If OmniRoute requires an API key, pass -OmniKey or set OMNIROUTE_KEY.'
    }
    return
}

if (-not $Key) {
    Write-Host 'No Open WebUI key. Use -Key sk-xxxxx or set the OWUI_KEY environment variable.' -ForegroundColor Red
    return
}
$script:owui = @{ Authorization = "Bearer $Key" }

try {
    # --- 1. Update the Model IDs allow-list --------------------------------------
    $cfg  = Get-Json "$Url/openai/config" $script:owui
    $conn = $cfg.OPENAI_API_CONFIGS.'0'
    if (-not $conn) { throw 'No OpenAI-type connection found in Open WebUI.' }

    $ids = New-Object 'System.Collections.Generic.List[string]'
    foreach ($i in @($conn.model_ids)) { if ($i -and -not $ids.Contains($i)) { $ids.Add($i) } }
    foreach ($i in $Add)    { if (-not $ids.Contains($i)) { $ids.Add($i); Write-Host "Allow-list + $i" -ForegroundColor Green } }
    foreach ($i in $Remove) { if ($ids.Remove($i))        { Write-Host "Allow-list - $i" -ForegroundColor Yellow } }

    if ($Add.Count -gt 0 -or $Remove.Count -gt 0) {
        $conn.model_ids = [string[]]$ids.ToArray()
        Post-Json "$Url/openai/config/update" $cfg
        Write-Host 'Connection updated.'
    }

    # --- 2. Apply the same settings to every allow-listed model ------------------
    $all  = @(Get-Json "$Url/api/v1/models/all" $script:owui)
    $byId = @{}
    foreach ($m in $all) { $byId[$m.id] = $m }

    # Template = settings of a model you already configured by hand
    $tpl = $all | Where-Object { $ids.Contains($_.id) -and $null -ne $_.meta.capabilities } | Select-Object -First 1
    if ($tpl) {
        $caps  = $tpl.meta.capabilities
        $tools = $tpl.meta.builtinTools
        Write-Host "Using the settings of '$($tpl.id)' as the template."
    } else {
        $caps = [pscustomobject][ordered]@{ vision = $false; file_upload = $false; web_search = $true; image_generation = $true;
            code_interpreter = $false; terminal = $true; citations = $false; status_updates = $false; memory = $false; builtin_tools = $false }
        $tools = $null
        Write-Host 'No configured model found; using built-in token-saving defaults.'
    }
    if (-not $tools) {
        $tools = [pscustomobject][ordered]@{ time = $false; chats = $false; code_interpreter = $false; calendar = $false; user_input = $false;
            notes = $false; tasks = $false; skills = $false; memory = $false; knowledge = $false; automations = $false; tools = $false }
    }

    $records = @()
    foreach ($id in $ids) {
        $rec = $byId[$id]
        if (-not $rec) {
            $rec = [pscustomobject][ordered]@{ id = $id; base_model_id = $null; name = $id; params = [pscustomobject]@{};
                meta = [pscustomobject]@{}; access_grants = @(); is_active = $true }
        }
        if (-not $rec.meta) { $rec | Add-Member -NotePropertyName meta -NotePropertyValue ([pscustomobject]@{}) -Force }
        $rec.meta | Add-Member -NotePropertyName capabilities -NotePropertyValue $caps  -Force
        $rec.meta | Add-Member -NotePropertyName builtinTools -NotePropertyValue $tools -Force
        $rec.is_active = $true
        $records += $rec
    }
    foreach ($id in $Remove) {
        $rec = $byId[$id]
        if ($rec) { $rec.is_active = $false; $records += $rec }
    }

    if ($records.Count -gt 0) {
        Post-Json "$Url/api/v1/models/import" @{ models = @($records) }
    }
    Write-Host ("Settings applied to {0} model(s)." -f $records.Count) -ForegroundColor Green
    Write-Host 'Refresh Open WebUI (Ctrl + F5) to see the changes.'
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}
