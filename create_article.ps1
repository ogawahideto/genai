param(
    [string]$ProjectName,
    [string]$CurrentDate
)

$content = @"
# $ProjectName - Web Application Development Record

## Project Overview

$ProjectName is a web application developed using HTML5 and JavaScript.

**Development Date**: $CurrentDate
**Technology Stack**: HTML5, CSS3, JavaScript
**Features**:
- Single file architecture
- No external dependencies
- Responsive design

## Technical Implementation

### Key Features
[Describe specific features here]

### Code Structure
[Describe code structure here]

## Lessons Learned

[Describe insights gained during development]

## Future Improvements

[Describe future feature enhancements and improvements]

## Summary

Through the development of $ProjectName, [describe learnings and thoughts here].

**Demo Site**: https://ogawahideto.github.io/genai/$ProjectName/
**Source Code**: https://github.com/ogawahideto/genai/tree/main/$ProjectName
"@

$articlePath = "articles\$ProjectName" + "_article.md"
$content | Out-File -FilePath $articlePath -Encoding UTF8
Write-Output "Article created: $articlePath"