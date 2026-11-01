$ErrorActionPreference = "Continue"
Set-Location (Split-Path -Parent $PSScriptRoot)

$log = Join-Path $env:TEMP "rd-build.log"
Set-Content -Path $log -Value ("build start " + (Get-Date -Format "HH:mm:ss"))

& npm run build *>&1 | Tee-Object -FilePath $log -Append
$code = $LASTEXITCODE
Add-Content -Path $log -Value ("EXIT=$code at " + (Get-Date -Format "HH:mm:ss"))
