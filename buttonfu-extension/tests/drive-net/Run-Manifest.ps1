param(
    [string]$DriveNetExe = 'DriveNet.Cli.exe',
    [string]$ResultJson,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$AdditionalArgs
)

$scriptRoot = Split-Path -Parent $PSCommandPath
$manifestPath = Join-Path $scriptRoot 'manifest.yaml'
$repoRoot = (Resolve-Path (Join-Path $scriptRoot '..\..\..')).Path

if (-not $ResultJson) {
    $ResultJson = Join-Path $repoRoot '.drive-net\test-results.json'
}

Push-Location $repoRoot
try {
    & $DriveNetExe test --manifest $manifestPath --result-json $ResultJson @AdditionalArgs
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}