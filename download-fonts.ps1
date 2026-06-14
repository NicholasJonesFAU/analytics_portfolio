# Downloads self-hosted Inter and Playfair Display fonts into ./fonts
$ErrorActionPreference = 'Stop'
$fontDir = Join-Path $PSScriptRoot 'fonts'
New-Item -ItemType Directory -Force -Path $fontDir | Out-Null

$fonts = @(
  @('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', 'inter-regular.woff2'),
  @('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', 'inter-medium.woff2'),
  @('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2', 'inter-semibold.woff2'),
  @('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', 'inter-bold.woff2'),
  @('https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgEM86xQ.woff2', 'playfair-semibold.woff2'),
  @('https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXDTLYgEM86xQ.woff2', 'playfair-bold.woff2')
)

foreach ($font in $fonts) {
  $out = Join-Path $fontDir $font[1]
  Write-Host "Downloading $($font[1])..."
  Invoke-WebRequest -Uri $font[0] -OutFile $out -UseBasicParsing
}

Get-ChildItem $fontDir -Filter '*.woff2' | Format-Table Name, Length -AutoSize
Write-Host 'Done.'
