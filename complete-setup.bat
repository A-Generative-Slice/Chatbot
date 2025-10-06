@echo off
REM Complete Setup Script - Runs both server and ngrok setup
REM Use this for first-time setup or when you need a new ngrok URL

echo.
echo ========================================================
echo    TWILIO WHATSAPP BOT - COMPLETE SETUP
echo ========================================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
echo.

REM Install dependencies if needed
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
    echo.
)

echo ========================================================
echo    STEP 1: Testing Webhook Locally
echo ========================================================
echo.

REM Run tests first
call node test_twilio_webhook.js
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Tests failed. Please fix errors before continuing.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo    STEP 2: Starting Server
echo ========================================================
echo.
echo Starting server in background...
echo.

REM Start server in background
start /B cmd /c "npm run start:debug"

REM Wait a few seconds for server to start
timeout /t 3 /nobreak >nul

echo [OK] Server started
echo.

echo ========================================================
echo    STEP 3: Setting Up Ngrok
echo ========================================================
echo.

REM Run setup script
call node setup_twilio.js

echo.
echo ========================================================
echo    SETUP COMPLETE
echo ========================================================
echo.
echo Keep this window open to keep ngrok running!
echo Press Ctrl+C to stop when you're done testing.
echo.
pause
