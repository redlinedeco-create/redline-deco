$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$log = Join-Path $env:TEMP "redline-preview.log"
Set-Content -Path $log -Value ("preview start " + (Get-Date -Format "HH:mm:ss"))

# Production only serves what `next build` produced, so rebuild whenever any
# source file is newer than .next\BUILD_ID (otherwise the LAN would show stale pages).
$buildId = Join-Path $root ".next\BUILD_ID"
$tracked = @(
  Get-ChildItem -Path (Join-Path $root "app"), (Join-Path $root "components"), `
    (Join-Path $root "lib"), (Join-Path $root "data"), (Join-Path $root "types"), `
    (Join-Path $root "public") -Recurse -File -ErrorAction SilentlyContinue
  Get-ChildItem -Path $root -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -in @("next.config.mjs", "tailwind.config.js", "postcss.config.js", ".env.local") }
) | Where-Object { $_.Extension -in @(".ts", ".tsx", ".js", ".jsx", ".mjs", ".css", ".json") -or $_.Name -eq ".env.local" }

$latest = ($tracked | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime

if (-not (Test-Path $buildId) -or (Get-Item $buildId).LastWriteTime -lt $latest) {
  Add-Content -Path $log -Value ("building (sources newer than BUILD_ID) ...")
  & npm run build *>&1 | Tee-Object -FilePath $log -Append
  if ($LASTEXITCODE -ne 0) {
    Add-Content -Path $log -Value "BUILD FAILED - server not started"
    exit 1
  }
} else {
  Add-Content -Path $log -Value "build is current - skipping build"
}

& npm run preview *>&1 | Tee-Object -FilePath $log -Append
$code = $LASTEXITCODE
Add-Content -Path $log -Value ("EXIT=" + $code + " at " + (Get-Date -Format "HH:mm:ss"))
