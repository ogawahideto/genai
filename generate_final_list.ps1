$json = Get-Content "app_details.json" -Encoding UTF8 | ConvertFrom-Json
$readme = Get-Content "README.md" -Encoding UTF8

$apps = @{}
foreach ($app in $json) {
    $dir = $app.Dir
    $apps[$dir] = $app
}

$outputFile = "app_list_final.md"
"" | Out-File -Encoding utf8 $outputFile

$processedDirs = @()

foreach ($line in $readme) {
    if ($line -match "^### (.*)") {
        $currentCategory = $matches[1].Trim()
        "`n### $currentCategory" | Out-File -Append -Encoding utf8 $outputFile
    }
    elseif ($line -match "#### \[(.*?)\]\((.*?)\)") {
        $title = $matches[1].Trim()
        $dir = $matches[2].Trim().TrimEnd("/")
        
        if ($apps.ContainsKey($dir)) {
            $app = $apps[$dir]
            $desc = $app.Intent
            if (-not $desc) { $desc = $app.Prompt }
            if (-not $desc) { $desc = $app.MetaDesc }
            if (-not $desc) { 
                # Fallback to Title or H1 if no description
                if ($app.H1 -and $app.H1 -ne $app.Title) {
                     $desc = $app.H1
                } else {
                     $desc = $app.Title
                }
            }
            if (-not $desc) { $desc = "No description available" }
            
            $desc = $desc -replace '\s+', ' '
            if ($desc.Length > 200) { $desc = $desc.Substring(0, 197) + "..." }
            
            $formatted = '- [{0}]({1}/index.html): {2}' -f $title, $dir, $desc
            $formatted | Out-File -Append -Encoding utf8 $outputFile
            $processedDirs += $dir
        }
    }
}

"`n### Uncategorized" | Out-File -Append -Encoding utf8 $outputFile
foreach ($dir in $apps.Keys | Sort-Object) {
    if ($dir -notin $processedDirs) {
        $app = $apps[$dir]
        $desc = $app.Intent
        if (-not $desc) { $desc = $app.Prompt }
        if (-not $desc) { $desc = $app.MetaDesc }
        if (-not $desc) { 
             if ($app.H1 -and $app.H1 -ne $app.Title) {
                 $desc = $app.H1
            } else {
                 $desc = $app.Title
            }
        }
        if (-not $desc) { $desc = "No description available" }
        
        $desc = $desc -replace '\s+', ' '
        if ($desc.Length > 200) { $desc = $desc.Substring(0, 197) + "..." }
        
        $formatted = '- [{0}]({1}/index.html): {2}' -f $dir, $dir, $desc
        $formatted | Out-File -Append -Encoding utf8 $outputFile
    }
}
