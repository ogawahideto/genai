$files = Get-ChildItem -Recurse -Filter "index.html"
$results = @()

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
    } catch {
        continue
    }
    
    $relPath = $file.FullName.Substring($PWD.Path.Length + 1).Replace("\", "/")
    $dirName = $file.Directory.Name
    
    $title = ""
    $metaDesc = ""
    $h1 = ""
    $intent = ""
    $prompt = ""
    
    if ($content -match "<title>(.*?)</title>") {
        $title = $matches[1].Trim()
    }
    
    if ($content -match '<meta\s+name=["'']description["'']\s+content=["''](.*?)["'']') {
        $metaDesc = $matches[1].Trim()
    }
    
    if ($content -match "<h1>(.*?)</h1>") {
        $h1 = $matches[1].Trim() -replace "<[^>]+>", ""
    }

    if ($content -match "Implementation Intent\s*[:](.*)") {
        $intent = $matches[1].Trim()
    }
    
    if ($content -match "User Prompt\s*[:](.*)") {
        $prompt = $matches[1].Trim()
    }

    if (-not $intent) {
        # Simple check for first comment block
        if ($content -match "(?s)<!--(.*?)-->") {
            $comment = $matches[1].Trim()
            # Clean up comment
            $cleanComment = $comment -replace "\r\n", " " -replace "\n", " " -replace "\s+", " "
            if ($cleanComment.Length -gt 10 -and $cleanComment.Length -lt 300) {
                 $intent = $cleanComment
            }
        }
    }

    $obj = [PSCustomObject]@{
        Path = $relPath
        Dir = $dirName
        Title = $title
        MetaDesc = $metaDesc
        H1 = $h1
        Intent = $intent
        Prompt = $prompt
    }
    $results += $obj
}

$results | ConvertTo-Json -Depth 2 | Out-File -Encoding utf8 "app_details.json"
