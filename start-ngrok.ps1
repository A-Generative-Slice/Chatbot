# Simple Ngrok Starter for Twilio WhatsApp Bot
# This script starts ngrok and shows you the webhook URL

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   TWILIO WHATSAPP BOT - NGROK TUNNEL SETUP" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "[1/3] Checking if server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 3 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Server is running on http://localhost:3000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Server is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the server first:" -ForegroundColor Yellow
    Write-Host "   npm run start:debug" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if ngrok is installed
Write-Host "[2/3] Checking ngrok installation..." -ForegroundColor Yellow
$ngrokInstalled = $false
try {
    $ngrokVersion = & ngrok version 2>&1
    if ($ngrokVersion -match "ngrok version") {
        Write-Host "✅ Ngrok is installed: $ngrokVersion" -ForegroundColor Green
        $ngrokInstalled = $true
    }
} catch {
    Write-Host "❌ Ngrok is not installed or not in PATH" -ForegroundColor Red
}

if (-not $ngrokInstalled) {
    Write-Host ""
    Write-Host "Install ngrok with:" -ForegroundColor Yellow
    Write-Host "   npm install -g ngrok" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Start ngrok
Write-Host "[3/3] Starting ngrok tunnel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting ngrok on port 3000..." -ForegroundColor Gray
Write-Host "This will open in a new window. Please wait..." -ForegroundColor Gray
Write-Host ""

# Start ngrok in a new window
Start-Process -FilePath "ngrok" -ArgumentList "http", "3000" -WindowStyle Normal

# Wait for ngrok to start
Write-Host "Waiting for ngrok to start (5 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Try to get the tunnel URL from ngrok API
Write-Host "Fetching tunnel URL..." -ForegroundColor Gray
$webhookUrl = $null
$maxRetries = 10
$retryCount = 0

while ($retryCount -lt $maxRetries -and $null -eq $webhookUrl) {
    try {
        $tunnels = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -UseBasicParsing
        if ($tunnels.tunnels -and $tunnels.tunnels.Count -gt 0) {
            $httpsTunnel = $tunnels.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
            if ($httpsTunnel) {
                $webhookUrl = $httpsTunnel.public_url
            }
        }
    } catch {
        # Ngrok API not ready yet, wait and retry
        Start-Sleep -Seconds 1
    }
    $retryCount++
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "   🎉 NGROK TUNNEL IS READY!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""

if ($webhookUrl) {
    Write-Host "✅ Your public webhook URL is:" -ForegroundColor Green
    Write-Host ""
    Write-Host "   $webhookUrl/whatsapp" -ForegroundColor Yellow -BackgroundColor Black
    Write-Host ""
} else {
    Write-Host "⚠️  Couldn't automatically detect ngrok URL" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please check the ngrok window or visit:" -ForegroundColor Yellow
    Write-Host "   http://localhost:4040" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Look for the 'https://...' URL and add /whatsapp to the end" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   TWILIO CONFIGURATION STEPS" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Open Twilio Console:" -ForegroundColor White
Write-Host "   https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣  Find 'Sandbox Configuration' section" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Set 'When a message comes in' to:" -ForegroundColor White
if ($webhookUrl) {
    Write-Host "   $webhookUrl/whatsapp" -ForegroundColor Yellow
} else {
    Write-Host "   https://YOUR-NGROK-URL.ngrok.io/whatsapp" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "4️⃣  Method: POST" -ForegroundColor White
Write-Host ""
Write-Host "5️⃣  Click Save" -ForegroundColor White
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   JOIN SANDBOX & TEST" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. In Twilio Console, find the join code (e.g., 'join happy-dog')" -ForegroundColor White
Write-Host "2. Send that message from WhatsApp to the sandbox number" -ForegroundColor White
Write-Host "3. Once joined, test with these messages:" -ForegroundColor White
Write-Host ""
Write-Host "   'hi'       → Language selection" -ForegroundColor Cyan
Write-Host "   '1'        → Select English" -ForegroundColor Cyan
Write-Host "   'broom'    → Search products" -ForegroundColor Cyan
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "   MONITORING" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Ngrok Inspector:     http://localhost:4040" -ForegroundColor White
Write-Host "🏥 Server Health:       http://localhost:3000/health" -ForegroundColor White
Write-Host "📞 Twilio Logs:         https://console.twilio.com/us1/monitor/logs/debugger" -ForegroundColor White
Write-Host ""
Write-Host "================================================================" -ForegroundColor Yellow
Write-Host "⚠️  Keep this window and the ngrok window open while testing!" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Yellow
Write-Host ""

# Save config
if ($webhookUrl) {
    $config = @{
        webhookUrl = "$webhookUrl/whatsapp"
        localUrl = "http://localhost:3000"
        ngrokInspector = "http://localhost:4040"
        timestamp = Get-Date -Format "o"
    } | ConvertTo-Json

    $config | Out-File -FilePath "twilio_webhook_config.json" -Encoding UTF8
    Write-Host "💾 Configuration saved to: twilio_webhook_config.json" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Press Ctrl+C to stop ngrok when you're done testing" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to close this window (ngrok will keep running)"
