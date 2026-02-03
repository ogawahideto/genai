param(
    [string]$FileName,
    [int]$MaxLines = 300
)

$dataDir = "C:\Users\hidet\git\genai\genai\santoka\data"
$outDir = "C:\Users\hidet\git\genai\genai\santoka\extracted"

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$sjis = [System.Text.Encoding]::GetEncoding("Shift_JIS")

if ($FileName) {
    $files = Get-ChildItem -Path $dataDir -Filter $FileName
} else {
    $files = Get-ChildItem -Path $dataDir -Filter "*.html"
}

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)"

    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $content = $sjis.GetString($bytes)

    # Remove HTML tags but preserve line breaks
    $content = $content -replace '<br\s*/?>', "`n"
    $content = $content -replace '<BR\s*/?>', "`n"
    $content = $content -replace '</p>', "`n"
    $content = $content -replace '</div>', "`n"
    $content = $content -replace '</h[1-6]>', "`n"
    $content = $content -replace '<[^>]+>', ''

    # Decode HTML entities
    $content = $content -replace '&nbsp;', ' '
    $content = $content -replace '&amp;', '&'
    $content = $content -replace '&lt;', '<'
    $content = $content -replace '&gt;', '>'
    $content = $content -replace '&quot;', '"'
    $content = $content -replace '&#[0-9]+;', ''

    # Clean up excessive blank lines
    $content = $content -replace '(\r?\n){3,}', "`n`n"

    # Trim whitespace from each line
    $lines = $content -split "`n" | ForEach-Object { $_.Trim() }

    # Remove empty lines at start
    $startIdx = 0
    while ($startIdx -lt $lines.Length -and $lines[$startIdx] -eq '') {
        $startIdx++
    }
    $lines = $lines[$startIdx..($lines.Length - 1)]

    # Output file
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $outFile = Join-Path $outDir "$baseName.txt"

    # Write with UTF-8 encoding
    $utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllLines($outFile, $lines, $utf8NoBOM)

    Write-Host "  Output: $outFile"
    Write-Host "  Total lines: $($lines.Length)"
    Write-Host ""

    # Show sample
    Write-Host "  --- First $MaxLines lines ---"
    $showLines = [Math]::Min($MaxLines, $lines.Length)
    for ($i = 0; $i -lt $showLines; $i++) {
        Write-Host $lines[$i]
    }
    Write-Host "  --- End sample ---"
    Write-Host ""
}
