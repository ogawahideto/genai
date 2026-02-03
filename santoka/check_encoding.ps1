$dataDir = "C:\Users\hidet\git\genai\genai\santoka\data"
$files = Get-ChildItem -Path $dataDir -Filter "*.html"

foreach ($file in $files) {
    Write-Host "=== $($file.Name) ==="
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    # Get first 500 bytes as ASCII to find encoding declaration
    $header = [System.Text.Encoding]::ASCII.GetString($bytes, 0, [Math]::Min(500, $bytes.Length))

    # Look for charset declaration
    if ($header -match 'charset[=:]\s*"?([^";\s>]+)') {
        Write-Host "Found charset: $($Matches[1])"
    }
    if ($header -match 'encoding[=:]\s*"?([^";\s>]+)') {
        Write-Host "Found encoding: $($Matches[1])"
    }

    Write-Host "File size: $($bytes.Length) bytes"
    Write-Host ""
}
