# Обновить галерею: запустить после добавления фото в assets/gallery/photos/
# Использование: правой кнопкой → "Выполнить с помощью PowerShell"

$photosDir    = Join-Path $PSScriptRoot "..\assets\gallery\photos"
$manifestPath = Join-Path $PSScriptRoot "..\assets\gallery\manifest.json"
$extensions   = @(".jpg", ".jpeg", ".png", ".webp", ".gif")

# Сохраняем существующие подписи
$captionMap = @{}
if (Test-Path $manifestPath) {
    $existing = Get-Content $manifestPath -Raw | ConvertFrom-Json
    foreach ($p in $existing.photos) { $captionMap[$p.file] = $p.caption }
}

$photos = Get-ChildItem -Path $photosDir -File |
    Where-Object { $extensions -contains $_.Extension.ToLower() } |
    Sort-Object Name |
    ForEach-Object {
        [ordered]@{
            file    = $_.Name
            caption = if ($captionMap[$_.Name]) { $captionMap[$_.Name] } else { "" }
        }
    }

$manifest = [ordered]@{
    updated = (Get-Date -Format "yyyy-MM-dd")
    photos  = @($photos)
} | ConvertTo-Json -Depth 3

Set-Content -Path $manifestPath -Value $manifest -Encoding UTF8
Write-Host "Готово: найдено $($photos.Count) фото → manifest.json обновлён."