@echo off
set "ROOT=%~dp0"
cd /d "%ROOT%"

where php >nul 2>nul
if errorlevel 1 (
    echo PHP not found in PATH. Install PHP or add it to PATH.
    pause
    exit /b 1
)

echo.
echo  =========================================================
echo   http://localhost:8080/
echo   Ctrl+C -- stop server
echo  =========================================================
echo.
echo  Site is static, no router needed -- PHP just serves files
echo  as-is. A server is required because the shared header/footer
echo  (partials/header.html, partials/footer.html) are loaded via
echo  fetch() -- opening index.html directly (file://) won't work
echo  due to CORS.
echo.

php -S localhost:8080
pause
