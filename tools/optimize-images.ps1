<#
  AMERICANO Świdnik — optymalizacja obrazów
  ------------------------------------------------------------
  Na tej maszynie nie ma Node, ImageMagick ani działającego
  Pythona, więc skalujemy przez System.Drawing (GDI+).
  WebP tą drogą nie zrobimy — GDI+ nie ma enkodera WebP.

  Oryginały NIE są nadpisywane w miejscu: przed pierwszym
  zapisem lądują w assets/_src/ i tam zostają. Skrypt jest
  idempotentny — jeśli oryginał już leży w _src/, to on jest
  źródłem, więc powtórne uruchomienie nie kompresuje ponownie
  pliku już skompresowanego (bez tego jakość spadałaby
  kaskadowo przy każdym przebiegu).

  Uruchomienie:
    powershell -ExecutionPolicy Bypass -File tools\optimize-images.ps1
#>

param(
  [int]$GalleryHeight = 560,   # galeria renderuje się do 320 px → 560 daje zapas na ~1,75x
  [int]$LogoWidth     = 360,   # logo renderuje się do 110 px → 360 z zapasem na 2x
  [int]$Quality       = 80
)

Add-Type -AssemblyName System.Drawing

$root   = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$assets = Join-Path $root 'assets'
$src    = Join-Path $assets '_src'

if (-not (Test-Path $src)) { New-Item -ItemType Directory -Path $src | Out-Null }

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
             Where-Object { $_.MimeType -eq 'image/jpeg' }

# Kadrowanie zdjęć z galerii — liczby to piksele ORYGINAŁU z _src/,
# odcinane od danej krawędzi. Powód jest treściowy, nie estetyczny:
# część zdjęć z Facebooka ma wklejone naklejki z godzinami otwarcia
# na konkretne dni. Takie godziny są nieaktualne i sprzeczne z tabelą
# w sekcji „Kontakt", więc na stronie komercyjnej nie mogą zostać.
#
# pizza-6: biała plansza „01.05.26r. 13:00-23:00 / 02.05 / 03.05"
#          (majówka) siedzi na wieku kartonu nad pizzą. Sam placek
#          zaczyna się dopiero ~420 px od góry, więc 380 px zdejmuje
#          całą planszę i nie tnie jedzenia.
#
# Naklejki NA jedzeniu są nie do wykadrowania — takie zdjęcia
# wypadają z galerii (panzerotti-1, panzerotti-3: nalepka-okulary
# wprost na panzerotti; przekaski: plansza „01-03.05.24r").
$crops = @{
  'pizza-6.jpg' = @{ Top = 380 }
}

function Get-Source {
  param([string]$Name)
  # Jeśli oryginał jest już zarchiwizowany, to on jest źródłem prawdy.
  $archived = Join-Path $src $Name
  $live     = Join-Path $assets $Name
  if (Test-Path $archived) { return $archived }
  if (-not (Test-Path $live)) { return $null }
  Copy-Item $live $archived
  return $archived
}

function Resize-Image {
  param([string]$Name, [int]$MaxHeight = 0, [int]$MaxWidth = 0, [switch]$Png)

  $source = Get-Source -Name $Name
  if (-not $source) { Write-Host "POMINIĘTO (brak): $Name"; return $null }

  $target = Join-Path $assets $Name
  # nowy plik galerii jeszcze nie leży w assets/ — wtedy nie ma z czym porównać
  $before = if (Test-Path $target) { (Get-Item $target).Length } else { 0 }

  $crop = $crops[$Name]

  $img = [System.Drawing.Image]::FromFile($source)
  try {
    # obszar źródłowy: całe zdjęcie minus kadr z $crops
    $cx = 0; $cy = 0; $cw = $img.Width; $ch = $img.Height
    if ($crop) {
      if ($crop.Left) { $cx = [int]$crop.Left }
      if ($crop.Top)  { $cy = [int]$crop.Top }
      $cw = $img.Width  - $cx - $(if ($crop.Right)  { [int]$crop.Right }  else { 0 })
      $ch = $img.Height - $cy - $(if ($crop.Bottom) { [int]$crop.Bottom } else { 0 })
    }
    $srcRect = New-Object System.Drawing.Rectangle($cx, $cy, $cw, $ch)

    # skalujemy to, co zostało po kadrze, a nie oryginał
    $w = $cw; $h = $ch
    $scale = 1.0
    if ($MaxHeight -gt 0 -and $h -gt $MaxHeight) { $scale = $MaxHeight / $h }
    if ($MaxWidth  -gt 0 -and ($w * $scale) -gt $MaxWidth) { $scale = $MaxWidth / $w }
    $nw = [int][math]::Round($w * $scale)
    $nh = [int][math]::Round($h * $scale)

    $bmp = New-Object System.Drawing.Bitmap($nw, $nh,
             [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.CompositingMode    = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $nw, $nh)),
                 $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()

    $tmp = "$target.tmp"
    if ($Png) {
      # logo ma kanał alfa — PNG, inaczej stracimy przezroczystość
      $bmp.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
    } else {
      $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
      $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
        [System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
      $bmp.Save($tmp, $jpegCodec, $ep)
      $ep.Dispose()
    }
    $bmp.Dispose()
  } finally {
    $img.Dispose()
  }

  # Rekompresja małego pliku potrafi go powiększyć (pizza-3.jpg rosła
  # ze 132 na 155 KB). Jeśli wynik nie jest lżejszy od oryginału,
  # zostawiamy oryginał — mniejsze wymiary nie są warte większego pliku.
  #
  # UWAGA: przy kadrowaniu ta furtka MUSI być zamknięta. Kopiowanie
  # oryginału z powrotem przywróciłoby zdjęcie z naklejką, czyli dokładnie
  # to, co kadr miał usunąć. Kilka kilobajtów jest tu bez znaczenia.
  $srcLen = (Get-Item $source).Length
  $note   = ''
  if (-not $crop -and (Get-Item $tmp).Length -ge $srcLen) {
    Remove-Item $tmp -Force
    Copy-Item $source $target -Force
    $note = '  (zachowano oryginał)'
    $probe = [System.Drawing.Image]::FromFile($target)
    $nw = $probe.Width; $nh = $probe.Height
    $probe.Dispose()
  } else {
    Move-Item $tmp $target -Force
  }

  $after = (Get-Item $target).Length
  "{0,-18} {1,5}x{2,-5} {3,6} KB -> {4,5} KB{5}" -f `
    $Name, $nw, $nh, [math]::Round($before/1KB), [math]::Round($after/1KB), $note | Write-Host
  return [pscustomobject]@{ Name = $Name; Width = $nw; Height = $nh }
}

# panzerotti-3.jpg wypadło z galerii (nalepka-okulary wprost na jedzeniu,
# nie do wykadrowania) — w jego miejsce wchodzi pizza-box-2.jpg, czyste
# zdjęcie leżące wcześniej nieużywane w _src/nieuzywane/.
$gallery = @(
  'pizza-1.jpg','pizza-2.jpg','panzerotti-2.jpg','pizza-3.jpg','zapiekanki.jpg',
  'pizza-4.jpg','stripsy.jpg','pizza-5.jpg','pizza-box-2.jpg','pizza-6.jpg',
  'pizza-box.jpg','hotdog.jpg'
)

Write-Host "`n--- GALERIA (max ${GalleryHeight}px wys., q$Quality) ---"
$dims = foreach ($n in $gallery) { Resize-Image -Name $n -MaxHeight $GalleryHeight }

Write-Host "`n--- LOGO ---"
Resize-Image -Name 'logo.png' -MaxWidth $LogoWidth -Png | Out-Null

Write-Host "`n--- OG:IMAGE (1200x630 to standard OG) ---"
Resize-Image -Name 'pizza-hero.jpg' -MaxWidth 1200 | Out-Null

Write-Host "`n--- WYMIARY DO script.js ---"
foreach ($d in $dims) {
  "  ['{0}', {1}, {2}]," -f ($d.Name -replace '\.jpg$',''), $d.Width, $d.Height | Write-Host
}

Write-Host "`n--- FAVICON ---"
# logo.png to BIAŁA grafika na CZARNYM tle. Na stronie CSS robi z tego
# czarny znak na żółtym przez filter:invert(1) + mix-blend-mode:multiply.
# Favicon nie ma blend-mode, więc oba kroki wchodzą do macierzy kolorów:
#   out = (1 - in) * zolc
# czyli czerń logo -> żółć tła, biel logo -> czerń znaku. Bez mnożenia
# przez żółć dostawaliśmy biały kwadrat dookoła godła.
$logoSrc = Get-Source -Name 'logo.png'
$fav = New-Object System.Drawing.Bitmap(180, 180,
         [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$fg = [System.Drawing.Graphics]::FromImage($fav)
$fg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$fg.Clear([System.Drawing.ColorTranslator]::FromHtml('#FAC112'))

$yR = 250/255; $yG = 193/255; $yB = 18/255
$matrix = New-Object System.Drawing.Imaging.ColorMatrix(
  ,[float[][]]@(
    [float[]]@(-$yR,   0,    0,  0, 0),
    [float[]]@(   0,-$yG,    0,  0, 0),
    [float[]]@(   0,   0, -$yB,  0, 0),
    [float[]]@(   0,   0,    0,  1, 0),
    [float[]]@( $yR, $yG,  $yB,  0, 1)))
$attr = New-Object System.Drawing.Imaging.ImageAttributes
$attr.SetColorMatrix($matrix)

$logoImg = [System.Drawing.Image]::FromFile($logoSrc)
$pad = 14
$fg.DrawImage($logoImg,
  (New-Object System.Drawing.Rectangle($pad, $pad, (180 - 2*$pad), (180 - 2*$pad))),
  0, 0, $logoImg.Width, $logoImg.Height,
  [System.Drawing.GraphicsUnit]::Pixel, $attr)
$logoImg.Dispose(); $fg.Dispose()

$fav.Save((Join-Path $assets 'favicon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$fav.Dispose()
"favicon.png        180x180   {0,5} KB" -f `
  [math]::Round((Get-Item (Join-Path $assets 'favicon.png')).Length/1KB) | Write-Host

Write-Host "`n--- IKONY W KORZENIU ---"
# Przeglądarki i crawlery pytają o /favicon.ico oraz /apple-touch-icon.png
# w korzeniu serwisu NIEZALEŻNIE od tagów <link> w <head>. Bez tych plików
# każde wejście generuje dwa błędy 404 w logach.
$favSrc = Join-Path $assets 'favicon.png'

# apple-touch-icon: 180x180 to dokładnie to, co generujemy wyżej
Copy-Item $favSrc (Join-Path $root 'apple-touch-icon.png') -Force
"apple-touch-icon.png  180x180  {0,5} KB" -f `
  [math]::Round((Get-Item (Join-Path $root 'apple-touch-icon.png')).Length/1KB) | Write-Host

# favicon.ico — kontener ICO z ładunkiem PNG (obsługiwane od Visty).
# Budujemy go ręcznie, bo GDI+ nie ma enkodera ICO wielorozmiarowego.
$sizes = 16, 32, 48
$pngs = @()
$srcImg = [System.Drawing.Image]::FromFile($favSrc)
foreach ($s in $sizes) {
  $bmp = New-Object System.Drawing.Bitmap($s, $s,
           [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($srcImg, (New-Object System.Drawing.Rectangle(0, 0, $s, $s)))
  $g.Dispose()
  $ms = New-Object System.IO.MemoryStream
  $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  $pngs += ,$ms.ToArray()
  $ms.Dispose()
}
$srcImg.Dispose()

$ico = New-Object System.IO.MemoryStream
$bw  = New-Object System.IO.BinaryWriter($ico)
$bw.Write([uint16]0)                 # reserved
$bw.Write([uint16]1)                 # typ: 1 = ikona
$bw.Write([uint16]$sizes.Count)
$offset = 6 + 16 * $sizes.Count
for ($i = 0; $i -lt $sizes.Count; $i++) {
  $bw.Write([byte]$sizes[$i])        # szerokość
  $bw.Write([byte]$sizes[$i])        # wysokość
  $bw.Write([byte]0)                 # paleta: 0 = truecolor
  $bw.Write([byte]0)                 # reserved
  $bw.Write([uint16]1)               # planes
  $bw.Write([uint16]32)              # bitów na piksel
  $bw.Write([uint32]$pngs[$i].Length)
  $bw.Write([uint32]$offset)
  $offset += $pngs[$i].Length
}
foreach ($p in $pngs) { $bw.Write($p) }
$bw.Flush()
[System.IO.File]::WriteAllBytes((Join-Path $root 'favicon.ico'), $ico.ToArray())
$bw.Dispose(); $ico.Dispose()
"favicon.ico           16/32/48 {0,5} KB" -f `
  [math]::Round((Get-Item (Join-Path $root 'favicon.ico')).Length/1KB) | Write-Host

$total = ($gallery | ForEach-Object { (Get-Item (Join-Path $assets $_)).Length } | Measure-Object -Sum).Sum
Write-Host "`nGaleria razem: $([math]::Round($total/1MB,2)) MB"
