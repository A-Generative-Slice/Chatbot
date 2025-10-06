# WhatsApp Bot Production Deployment Guide

## Problem: Constant Restarts and Instability

The current setup using ngrok is meant for **development/testing only**. For production use, you need a proper deployment. Here are your options:

## Option 1: Cloud Deployment (Recommended for Production)

### A. Deploy to Railway (Free Tier Available)
1. Create account at https://railway.app
2. Connect your GitHub repository
3. Railway will automatically deploy your bot
4. You get a permanent HTTPS URL (no more ngrok!)

### B. Deploy to Render (Free Tier Available)
1. Create account at https://render.com
2. Connect your GitHub repository  
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Get permanent HTTPS URL

### C. Deploy to Heroku (Paid but reliable)
1. Create Heroku account
2. Install Heroku CLI
3. Create new app: `heroku create your-bot-name`
4. Deploy: `git push heroku main`

## Option 2: VPS/Server Deployment

### A. Use PM2 for Process Management
```bash
# Install PM2 globally
npm install -g pm2

# Start your bot with PM2
pm2 start server.js --name "whatsapp-bot"

# Make it auto-restart on server reboot
pm2 startup
pm2 save
```

### B. Use a reverse proxy (nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Option 3: Quick Fix for Current Setup

### Make current setup more stable:

1. **Use the batch files I created:**
   - Double-click `start-bot.bat` to start both services
   - Double-click `stop-bot.bat` to stop everything

2. **Set up auto-restart:** Create this PowerShell script as `monitor-bot.ps1`:

```powershell
while ($true) {
    $nodeProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue
    $ngrokProcess = Get-Process -Name "ngrok" -ErrorAction SilentlyContinue
    
    if (-not $nodeProcess) {
        Write-Host "Node.js crashed, restarting..."
        Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "C:\Users\Aafrin\OneDrive\Desktop\whatsapp-bot"
    }
    
    if (-not $ngrokProcess) {
        Write-Host "ngrok crashed, restarting..."
        Start-Process -FilePath "ngrok" -ArgumentList "http", "3000" -WorkingDirectory "C:\Users\Aafrin\OneDrive\Desktop\whatsapp-bot"
    }
    
    Start-Sleep -Seconds 30
}
```

## Option 4: Use ngrok with Authentication (More Stable)

1. Create ngrok account at https://ngrok.com
2. Get your auth token
3. Run: `ngrok config add-authtoken YOUR_TOKEN`
4. This gives you more stability and reserved domains

## Recommended Next Steps:

1. **For immediate testing:** Use the batch files I created
2. **For production:** Deploy to Railway or Render (free tiers available)
3. **For business use:** Use Heroku or your own VPS with PM2

## Files Created:
- `start-bot.bat` - Starts both Node.js and ngrok
- `stop-bot.bat` - Stops both services cleanly
- This guide - `DEPLOYMENT.md`

Choose the option that best fits your needs and budget!