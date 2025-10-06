# 🚀 TWILIO WHATSAPP BOT - QUICK REFERENCE

## ⚡ ONE-COMMAND START

### For First Time Setup:
```powershell
.\complete-setup.bat
```
This will:
- Install dependencies
- Run tests
- Start server
- Set up ngrok
- Give you the webhook URL

### Just Start the Server:
```powershell
.\start-server.bat
```
Or:
```powershell
npm run start:debug
```

---

## 📋 MANUAL SETUP (Step by Step)

### 1️⃣ Install & Test
```powershell
npm install
node test_twilio_webhook.js
```

### 2️⃣ Start Server (Terminal 1)
```powershell
npm run start:debug
```
Server runs on: `http://localhost:3000`

### 3️⃣ Start Ngrok (Terminal 2)
```powershell
ngrok http 3000
```
Copy the `https://....ngrok.io` URL

### 4️⃣ Configure Twilio
1. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. Find "Sandbox Configuration"
3. Set "When a message comes in" to: `https://YOUR-URL.ngrok.io/whatsapp`
4. Method: **POST**
5. **Save**

### 5️⃣ Join Sandbox
1. See join code in Twilio (e.g., "join happy-dog")
2. Send from WhatsApp to sandbox number
3. Test by sending: `hi`

---

## 🧪 TESTING

### Local Webhook Test
```powershell
node test_twilio_webhook.js
```

### Send Outbound Message
```powershell
$env:TWILIO_ACCOUNT_SID="ACxxx"
$env:TWILIO_AUTH_TOKEN="your_token"
$env:TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
node send_message.js "+919999999999" "Test"
```

### Test Messages to Send
- `hi` → Language selection
- `1` → English
- `broom` → Product search
- `cleaning products` → Browse category

---

## 🔧 TROUBLESHOOTING

### Server not starting?
```powershell
# Check port 3000
netstat -ano | findstr :3000
# Kill if needed
taskkill /PID <PID> /F
```

### Ngrok not found?
```powershell
# Install via npm
npm install -g ngrok

# Or Chocolatey
choco install ngrok

# Or download from: https://ngrok.com/download
```

### Webhook returns 404?
- ✅ Check URL ends with `/whatsapp`
- ✅ Ensure ngrok is running
- ✅ Verify server is on port 3000

### Messages not working?
- ✅ Join the sandbox first
- ✅ Check Twilio logs: https://console.twilio.com/us1/monitor/logs/debugger
- ✅ Check ngrok inspector: http://localhost:4040
- ✅ Check server terminal for errors

---

## 📊 MONITORING URLS

| Service | URL | Purpose |
|---------|-----|---------|
| Local Server | http://localhost:3000 | Bot server |
| Health Check | http://localhost:3000/health | Server status |
| Ngrok Inspector | http://localhost:4040 | HTTP requests |
| Twilio Console | https://console.twilio.com/us1/monitor/logs/debugger | Webhook logs |
| Twilio Sandbox | https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn | Config |

---

## 🔐 ENABLE SECURITY

Before starting server:
```powershell
$env:TWILIO_AUTH_TOKEN="your_auth_token"
$env:PUBLIC_URL="https://your-url.ngrok.io"
npm run start:debug
```

---

## 📁 KEY FILES

| File | Purpose |
|------|---------|
| `start-server.bat` | Start server only |
| `complete-setup.bat` | Full automated setup |
| `debug_server.js` | Main webhook server |
| `setup_twilio.js` | Setup assistant |
| `test_twilio_webhook.js` | Run tests |
| `send_message.js` | Send outbound messages |

---

## 🎯 CHECKLIST

- [ ] Node.js installed
- [ ] `npm install` completed
- [ ] Tests passing (`node test_twilio_webhook.js`)
- [ ] Server running on port 3000
- [ ] Ngrok running and showing https URL
- [ ] Twilio webhook configured with ngrok URL + `/whatsapp`
- [ ] Joined sandbox from phone
- [ ] Test message sent and replied

---

## 💡 TIPS

✨ Use `complete-setup.bat` for easiest setup
✨ Keep both terminals open (server + ngrok)
✨ Use ngrok inspector to debug
✨ Test locally before connecting to Twilio
✨ Check Twilio console logs for errors

---

**Need more help? See README_TWILIO_SETUP.md for detailed guide**
