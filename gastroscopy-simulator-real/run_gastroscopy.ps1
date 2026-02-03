# このディレクトリでサーバーを起動するスクリプト
$port = 8000
$url = "http://localhost:$port"

Write-Host "=================================================="
Write-Host " Starting Gastroscopy Simulator Server"
Write-Host " URL: $url"
Write-Host "=================================================="
Write-Host "Press Ctrl+C to stop the server."

# ブラウザを起動
Start-Job -ScriptBlock { Start-Sleep -Seconds 2; Start-Process "http://localhost:8000" } | Out-Null

# サーバーを起動
python -m http.server $port
