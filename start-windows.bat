@echo off
echo ==========================================
echo Starting Persona Research Lab...
echo ==========================================

:: Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js ^(npm^) is not installed.
    echo Please read HOW_TO_RUN.txt and install Node.js first from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Step 1: Installing required files (this may take a minute)...
call npm install

echo.
echo Step 2: Launching the app in your browser...
echo (Keep this window open while using the app. Close it to stop the server.)
call npm run dev -- --open

pause
