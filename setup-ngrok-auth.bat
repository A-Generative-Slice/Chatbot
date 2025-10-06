@echo off
echo.
echo ================================================================
echo    NGROK SETUP HELPER
echo ================================================================
echo.
echo Ngrok requires authentication for the free tier.
echo.
echo STEP 1: Get Your Auth Token
echo ----------------------------------------
echo 1. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
echo 2. Sign up / Log in (free)
echo 3. Copy your authtoken
echo.
echo STEP 2: Configure Ngrok
echo ----------------------------------------
echo Run this command with your token:
echo.
echo    ngrok config add-authtoken YOUR_TOKEN_HERE
echo.
echo STEP 3: Start Ngrok
echo ----------------------------------------
echo    ngrok http 3000
echo.
echo The window will stay open and show your https URL!
echo.
echo ================================================================
echo.
echo Press any key to open ngrok dashboard in browser...
pause >nul
start https://dashboard.ngrok.com/get-started/your-authtoken
echo.
echo After getting your token, run:
echo    ngrok config add-authtoken YOUR_TOKEN
echo.
pause
