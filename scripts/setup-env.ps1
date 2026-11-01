# Interactive helper: collects the Supabase keys and writes .env.local.
#
#   powershell -ExecutionPolicy Bypass -File scripts\setup-env.ps1
#
# The service_role key is read with masking so it never appears on screen.

$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

$target = Join-Path (Get-Location) ".env.local"

function Read-Masked([string]$prompt) {
  Write-Host $prompt -NoNewline
  $sec = Read-Host -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
  $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  return $plain.Trim()
}

Write-Host ""
Write-Host "Redline Deco - Supabase credentials" -ForegroundColor Cyan
Write-Host "Dashboard: Project Settings -> API" -ForegroundColor DarkGray
Write-Host ""

# 1. Project URL ------------------------------------------------------------
do {
  $url = (Read-Host "Project URL  (https://xxxx.supabase.co)").TrimEnd('/')
} while ($url -notmatch '^https://[a-z0-9]+\.supabase\.co$')

# 2. Anon public key -------------------------------------------------------
do {
  $anon = (Read-Host "`nanon `public key").Trim()
} while ($anon -notmatch '^eyJ')

# 3. service_role key (masked) --------------------------------------------
do {
  $service = Read-Masked "`nservice_role key (input hidden)  "
} while ($service -notmatch '^eyJ')

$content = @(
  "# Supabase credentials - never commit this file."
  "# NEXT_PUBLIC_* values are safe to expose. SUPABASE_SERVICE_ROLE_KEY is not:"
  "# it bypasses all database security rules and can change anything."
  ""
  "NEXT_PUBLIC_SUPABASE_URL=$url"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY=$anon"
  "SUPABASE_SERVICE_ROLE_KEY=$service"
  ""
) -join "`n"

[IO.File]::WriteAllText($target, $content, (New-Object Text.UTF8Encoding $false))

Write-Host ""
Write-Host "Wrote $target" -ForegroundColor Green

# Confirm the file cannot be committed by accident.
$ignored = git check-ignore -q .env.local 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Verified: .env.local is gitignored" -ForegroundColor Green
} else {
  Write-Host "WARNING: .env.local is NOT gitignored - do not commit it" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  1. Upload your photos:   npx tsx scripts\migrate-to-supabase.ts"
Write-Host "  2. Start the site:       npm run dev"
Write-Host ""
Write-Host "The service_role key never left this window and was not echoed." -ForegroundColor DarkGray
