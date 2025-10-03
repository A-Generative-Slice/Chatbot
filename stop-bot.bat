@echo off
echo Stopping AI-Powered WhatsApp Bot...
echo.

REM Kill all related processes
echo Stopping AI Search Service (Python)...
taskkill /f /im python.exe >nul 2>&1

echo Stopping Node.js server...
taskkill /f /im node.exe >nul 2>&1

echo Stopping ngrok tunnel...
taskkill /f /im ngrok.exe >nul 2>&1

echo.
echo AI-Powered WhatsApp Bot stopped successfully.
echo.
pause