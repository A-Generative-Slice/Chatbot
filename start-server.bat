@echo off
REM Quick Start Script for Twilio WhatsApp Bot
REM This script starts the server and helps with setup

echo.
echo ========================================================
echo    TWILIO WHATSAPP BOT - QUICK START
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

REM Check if node_modules exists
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
echo    STARTING CHATBOT SERVER
echo ========================================================
echo.
echo Server will start on: http://localhost:3000
echo Webhook endpoint: http://localhost:3000/whatsapp
echo.
echo Press Ctrl+C to stop the server
echo.
echo --------------------------------------------------------
echo.

REM Start the server
call npm run start:debug
