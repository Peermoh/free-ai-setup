# omniroute-test.ps1 - prove the combo works, including fallback
#
#   .\omniroute-test.ps1                 test 'my-free'
#   .\omniroute-test.ps1 -Name my-coding test another combo
#
# Part 1  calls every model in the combo directly: OK/FAIL, seconds, tokens
# Part 2  simulates outages with temporary combos whose first models are FAKE IDs
#         (they cannot exist, so nothing is charged), and checks who answers instead:
#           Test A: fake -> Groq              expect Groq to answer
#           Test B: fake -> fake -> Ollama    expect the local model to answer
#         The temporary combos are deleted afterwards.
# Part 3  sends one real message to the combo itself.
# Uses about 10 requests of free quota. Keys: OMNIROUTE_MANAGE_KEY and OMNIROUTE_KEY.

param(
    [string]$Name = 'my-free',
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

function Invoke-Api([string]$Method, [string]$Uri, [string]$Key, $Object = $null, [int]$Timeout = 180) {
    $params = @{ Uri = $Uri; Method = $Method; Headers = @{ Authorization = "Bearer $Key" }; UseBasicParsing = $true; TimeoutSec = $Timeout }
    if ($null -ne $Object) {
        $params.ContentType = 'application/json; charset=utf-8'
        $params.Body = [Text.Encoding]::UTF8.GetBytes((ConvertTo-Json -InputObject $Object -Depth 20))
    }
    $resp = Invoke-WebRequest @params
    $text = [Text.Encoding]::UTF8.GetString($resp.RawContentStream.ToArray())
    if ($text) { return ($text | ConvertFrom-Json) } else { return $null }
}

function As-List($obj) {
    if ($null -eq $obj) { return @() }
    if ($obj -is [array]) { return $obj }
    foreach ($p in 'data', 'combos', 'items') { if ($obj.PSObject.Properties[$p]) { return @($obj.$p) } }
    return @($obj)
}

# Send "hi" to a model or combo; returns who answered, time and tokens
function Ask([string]$Model) {
    $sw = [Diagnostics.Stopwatch]::StartNew()
    try {
        $r = Invoke-Api POST "$OmniUrl/v1/chat/completions" $ChatKey ([ordered]@{
            model = $Model; max_tokens = 60
            messages = @(@{ role = 'user'; content = 'Reply with one short sentence: hello.' }) })
        $sw.Stop()
        $text = [string]$r.choices[0].message.content
        if ($text.Length -gt 60) { $text = $text.Substring(0, 60) + '...' }
        return [pscustomobject]@{ Ok = $true; By = $r.model; Secs = [math]::Round($sw.Elapsed.TotalSeconds, 1); In = $r.usage.prompt_tokens; Text = $text.Trim() }
    } catch {
        $sw.Stop()
        $msg = Read-Error $_
        if ($msg.Length -gt 110) { $msg = $msg.Substring(0, 110) + '...' }
        return [pscustomobject]@{ Ok = $false; By = ''; Secs = [math]::Round($sw.Elapsed.TotalSeconds, 1); In = ''; Text = $msg }
    }
}

function Find-Combo([string]$ComboName) {
    return (As-List (Invoke-Api GET "$OmniUrl/api/combos" $ManageKey)) | Where-Object { $_.name -eq $ComboName } | Select-Object -First 1
}

function Remove-Combo([string]$ComboName) {
    try { $c = Find-Combo $ComboName; if ($c -and $c.id) { Invoke-Api DELETE "$OmniUrl/api/combos/$($c.id)" $ManageKey | Out-Null } } catch { }
}

if (-not $ManageKey -or -not $ChatKey) {
    Write-Host 'Needs OMNIROUTE_MANAGE_KEY (admin) and OMNIROUTE_KEY (chat) environment variables.' -ForegroundColor Red
    return
}

$pass = 0; $fail = 0

# --- Part 1: every member on its own ---------------------------------------------------
$combo = $null
try { $combo = Find-Combo $Name } catch { }
if (-not $combo) { Write-Host "Combo '$Name' not found in OmniRoute." -ForegroundColor Red; return }

$members = @($combo.models | ForEach-Object { if ($_ -is [string]) { $_ } elseif ($_.model) { $_.model } elseif ($_.id) { $_.id } })
Write-Host ''
Write-Host "PART 1 - each model in '$Name' on its own ($($members.Count) models)" -ForegroundColor Cyan
$i = 0
$results = foreach ($m in $members) {
    $i++
    Write-Host "  [$i/$($members.Count)] $m ..." -NoNewline
    $r = Ask $m
    if ($r.Ok) { Write-Host " OK" -ForegroundColor Green; $pass++ } else { Write-Host " FAIL" -ForegroundColor Red; $fail++ }
    [pscustomobject]@{ '#' = $i; Model = $m; Result = $(if ($r.Ok) { 'OK' } else { 'FAIL' }); Secs = $r.Secs; 'In tok' = $r.In; Reply = $r.Text }
}
$results | Format-Table -AutoSize -Wrap

# --- Part 2: simulated outages -------------------------------------------------------------
$groq  = $members | Where-Object { $_ -like 'groq/*' } | Select-Object -First 1
# The local model is the member that matches a model installed in Ollama on this PC
$local = $null
try {
    $installed = @((Invoke-RestMethod -Uri 'http://localhost:11434/api/tags' -UseBasicParsing).models | ForEach-Object { $_.name })
    $local = $members | Where-Object { $id = $_; $id -notlike 'ollama-cloud/*' -and ($installed | Where-Object { $id -like "*/$_" }) } | Select-Object -Last 1
} catch { }
if (-not $local) { Write-Host "  (test B skipped: no laptop model in '$Name' - start Ollama and run .\ai-sync.ps1)" -ForegroundColor Yellow }
$fake1 = 'groq/simulated-outage-model-1'
$fake2 = 'gemini/simulated-outage-model-2'

$tests = @(
    [pscustomobject]@{ Label = 'A: one provider down'; Combo = 'zz-test-failover'; Models = @($fake1, $groq); Expect = $groq },
    [pscustomobject]@{ Label = 'B: all cloud down';    Combo = 'zz-test-local';    Models = @($fake1, $fake2, $local); Expect = $local }
) | Where-Object { $_.Expect }

Write-Host "PART 2 - simulated outages (fake models first, nothing is charged)" -ForegroundColor Cyan
foreach ($t in $tests) {
    Remove-Combo $t.Combo
    try {
        Invoke-Api POST "$OmniUrl/api/combos" $ManageKey ([ordered]@{
            name = $t.Combo; strategy = 'priority'; models = @($t.Models | ForEach-Object { [ordered]@{ model = $_ } }) }) | Out-Null
    } catch {
        Write-Host "  $($t.Label): could not create the test combo - $(Read-Error $_)" -ForegroundColor Yellow
        $fail++; continue
    }
    Write-Host "  $($t.Label)"
    Write-Host "     route   : $($t.Models -join '  ->  ')"
    $r = Ask $t.Combo
    # The answering model may be reported with or without its provider prefix
    $expectShort = ($t.Expect -split '/', 2)[1]
    $hit = $r.Ok -and $r.By -and ($r.By -eq $t.Expect -or $r.By -eq $expectShort -or $t.Expect -like "*/$($r.By)")
    if ($hit) {
        Write-Host "     result  : PASS - answered by $($r.By) in $($r.Secs)s" -ForegroundColor Green; $pass++
    } elseif ($r.Ok) {
        Write-Host "     result  : CHECK - answered by $($r.By), expected $($t.Expect)" -ForegroundColor Yellow; $fail++
    } else {
        Write-Host "     result  : FAIL - $($r.Text)" -ForegroundColor Red; $fail++
    }
    Remove-Combo $t.Combo
}

# --- Part 3: the real combo ------------------------------------------------------------------
Write-Host ''
Write-Host "PART 3 - '$Name' itself" -ForegroundColor Cyan
$r = Ask $Name
if ($r.Ok) { Write-Host "  PASS - answered by $($r.By) in $($r.Secs)s, $($r.In) input tokens: $($r.Text)" -ForegroundColor Green; $pass++ }
else { Write-Host "  FAIL - $($r.Text)" -ForegroundColor Red; $fail++ }

Write-Host ''
$colour = if ($fail -eq 0) { 'Green' } else { 'Yellow' }
Write-Host "Summary: $pass passed, $fail failed or need a look." -ForegroundColor $colour
Write-Host 'Temporary test combos removed.'
