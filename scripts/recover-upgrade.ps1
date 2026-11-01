$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Log($m) {
  $line = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $m
  Write-Output $line
  Add-Content -Path (Join-Path $env:TEMP "rd-recover.log") -Value $line
}

Set-Content -Path (Join-Path $env:TEMP "rd-recover.log") -Value "start"

Log "restoring package files from HEAD"
git checkout -- package.json package-lock.json

Log "removing node_modules"
cmd /c rmdir /s /q node_modules
if (Test-Path node_modules) { Log "FAIL: node_modules still present"; exit 1 }
Log "node_modules gone"

Log "installing next@15.5.26 react@19 react-dom@19 (deps)"
& npm install next@15.5.26 react@19 react-dom@19 --save
if ($LASTEXITCODE -ne 0) { Log "FAIL: deps install exit $LASTEXITCODE"; exit 1 }

Log "installing eslint-config-next@15.5.26 @types/react@19 @types/react-dom@19 (devDeps)"
& npm install eslint-config-next@15.5.26 @types/react@19 @types/react-dom@19 --save-dev
if ($LASTEXITCODE -ne 0) { Log "FAIL: devDeps install exit $LASTEXITCODE"; exit 1 }

Log "DONE"
