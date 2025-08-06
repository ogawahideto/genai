@echo off
setlocal enabledelayedexpansion

echo ================================================
echo 🚀 Project Completion Workflow
echo ================================================

REM Check if project directory is provided
if "%1"=="" (
    echo ❌ Error: Please provide project directory name
    echo Usage: complete-project.bat [project-directory]
    echo Example: complete-project.bat uchimizu-game
    exit /b 1
)

set PROJECT_DIR=%1
set PROJECT_NAME=%1

REM Check if project directory exists
if not exist "%PROJECT_DIR%" (
    echo ❌ Error: Project directory '%PROJECT_DIR%' does not exist
    exit /b 1
)

REM Check if project has index.html
if not exist "%PROJECT_DIR%\index.html" (
    echo ❌ Error: No index.html found in '%PROJECT_DIR%'
    exit /b 1
)

echo 📝 Step 1: Creating article for %PROJECT_NAME%...
echo.

REM Get current date
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set CURRENT_DATE=%YYYY%-%MM%-%DD%

REM Create article template - use PowerShell for proper UTF-8 encoding
set ARTICLE_PATH=articles\%PROJECT_NAME%_article.md

powershell -Command "& { $projectName = '%PROJECT_NAME%'; $currentDate = '%CURRENT_DATE%'; $content = '# ' + $projectName + ' - Web Application Development Record`n`n## Project Overview`n`n' + $projectName + ' is a web application developed using HTML5 and JavaScript.`n`n**Development Date**: ' + $currentDate + '`n**Technology Stack**: HTML5, CSS3, JavaScript`n**Features**:`n- Single file architecture`n- No external dependencies`n- Responsive design`n`n## Technical Implementation`n`n### Key Features`n[Describe specific features here]`n`n### Code Structure`n[Describe code structure here]`n`n## Lessons Learned`n`n[Describe insights gained during development]`n`n## Future Improvements`n`n[Describe future feature enhancements and improvements]`n`n## Summary`n`nThrough the development of ' + $projectName + ', [describe learnings and thoughts here].`n`n**🎮 Demo Site**: https://ogawahideto.github.io/genai/' + $projectName + '/`n**💻 Source Code**: https://github.com/ogawahideto/genai/tree/main/' + $projectName; $content | Out-File -FilePath '%ARTICLE_PATH%' -Encoding UTF8 }"

echo ✅ Article created: %ARTICLE_PATH%
echo.

echo 📝 Step 2: Git operations...
echo.

REM Check git status
echo Current git status:
git status --porcelain

echo.
echo 📤 Adding files to git...
git add "%PROJECT_DIR%/"
git add .gitignore
git add CLAUDE.md
git add scripts/

echo.
echo 📝 Creating commit...
git commit -m "Add %PROJECT_NAME% project with automation scripts

- New project: %PROJECT_NAME%
- Updated project completion workflow
- Enhanced documentation and tooling

Generated with Claude Code (https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

if errorlevel 1 (
    echo ❌ Commit failed. Please check the git status and try again.
    exit /b 1  
)

echo ✅ Commit created successfully
echo.

echo 📤 Step 3: Pushing to GitHub...
git push

if errorlevel 1 (
    echo ❌ Push failed. Please check your connection and try again.
    exit /b 1
)

echo ✅ Successfully pushed to GitHub
echo.

echo 🌐 Step 4: Opening GitHub Pages...
set GITHUB_PAGES_URL=https://ogawahideto.github.io/genai/%PROJECT_NAME%/

echo Opening: %GITHUB_PAGES_URL%
start "" "%GITHUB_PAGES_URL%"

echo.
echo ================================================
echo ✅ Project completion workflow finished!
echo ================================================
echo.
echo 📁 Project: %PROJECT_NAME%
echo 📝 Article: %ARTICLE_PATH%
echo 🌐 GitHub Pages: %GITHUB_PAGES_URL%
echo 💻 Repository: https://github.com/ogawahideto/genai/tree/main/%PROJECT_NAME%
echo.
echo Next steps:
echo 1. Edit the article in %ARTICLE_PATH% with specific details
echo 2. Test the GitHub Pages URL (may take a few minutes to deploy)
echo 3. Publish the article to note.com or other platforms if desired
echo.

pause