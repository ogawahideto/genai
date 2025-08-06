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

REM Create article template
set ARTICLE_PATH=articles\%PROJECT_NAME%_article.md

echo # %PROJECT_NAME% - Webアプリケーション開発記録 > "%ARTICLE_PATH%"
echo. >> "%ARTICLE_PATH%"
echo ## プロジェクト概要 >> "%ARTICLE_PATH%"
echo. >> "%ARTICLE_PATH%"
echo %PROJECT_NAME% は、HTML5とJavaScriptを使用して開発されたWebアプリケーションです。 >> "%ARTICLE_PATH%"
echo. >> "%ARTICLE_PATH%"
echo **開発日**: %CURRENT_DATE% >> "%ARTICLE_PATH%"
echo **技術スタック**: HTML5, CSS3, JavaScript >> "%ARTICLE_PATH%"
echo **特徴**: >> "%ARTICLE_PATH%"
echo - シングルファイル構成 >> "%ARTICLE_PATH%"
echo - 外部依存関係なし >> "%ARTICLE_PATH%"
echo - レスポンシブデザイン >> "%ARTICLE_PATH%"
echo. >> "%ARTICLE_PATH%"
echo ## 技術的実装 >> "%ARTICLE_PATH%"
echo. >> "%ARTICLE_PATH%"
echo ### 主要機能 >> "%ARTICLE_PATH%"
echo [具体的な機能の説明をここに記述] >> "%ARTICLE_PATH%"
echo. >> "%ARTICLE_PATH%"
echo ### コード構造 >> "%ARTICLE_PATH%"
echo [コード構造の説明をここに記述] >> "%ARTICLE_PATH%"
echo. >> "%ARTICLE_PATH%"
echo ## 開発で学んだこと >> "%ARTICLE_PATH%"
echo. >> "%ARTICLE_PATH%"
echo [開発過程で得られた知見をここに記述] >> "%ARTICLE_PATH%"
echo. >> "%ARTICLE_PATH%"
echo ## 今後の改善点 >> "%ARTICLE_PATH%"
echo. >> "%ARTICLE_PATH%"
echo [将来の機能拡張や改善案をここに記述] >> "%ARTICLE_PATH%"
echo. >> "%ARTICLE_PATH%"
echo ## まとめ >> "%ARTICLE_PATH%"
echo. >> "%ARTICLE_PATH%"
echo %PROJECT_NAME% の開発を通じて、[学びや感想をここに記述]。 >> "%ARTICLE_PATH%"
echo. >> "%ARTICLE_PATH%"
echo **🎮 デモサイト**: https://ogawahideto.github.io/genai/%PROJECT_NAME%/ >> "%ARTICLE_PATH%"
echo **💻 ソースコード**: https://github.com/ogawahideto/genai/tree/main/%PROJECT_NAME% >> "%ARTICLE_PATH%"

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