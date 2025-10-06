@echo off
echo Starting AI-Powered WhatsApp Bot...
echo.

REM Kill any existing processes
echo Stopping existing processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im ngrok.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1

REM Start Enhanced AI Search Service with Sarvam-1 (Python)
echo Starting Enhanced AI Search Service with Sarvam-1...
start "AI Search Service" cmd /k "cd /d %~dp0 && C:/Users/Aafrin/OneDrive/Desktop/whatsapp-bot/.venv/Scripts/python.exe enhanced_search_service.py"

REM Start Node.js server
echo Starting Node.js WhatsApp Bot...
start "WhatsApp Bot Server" cmd /k "cd /d %~dp0 && npm start"

REM Start ngrok tunnel
echo Starting ngrok tunnel...
start "ngrok tunnel" cmd /k "cd /d %~dp0 && ngrok http 3000"

echo.
echo ========================================
echo 🤖 AI-Powered WhatsApp Bot with Sarvam-1 is starting up...
echo.
echo Services running:
echo 1. Enhanced AI Search Service with Sarvam-1 (Python) - Port 5000
echo 2. WhatsApp Bot (Node.js) - Port 3000  
echo 3. ngrok tunnel - Check the third window
echo.
echo Features:
echo ✅ Semantic Product Search
echo ✅ Sarvam-1 Conversations (Indian Languages)
echo ✅ Natural Language Understanding
echo ✅ Product Questions (colors, usage, etc.)
echo.
echo After ngrok starts, copy the https URL and 
echo update your Twilio webhook configuration.
echo ========================================
echo.