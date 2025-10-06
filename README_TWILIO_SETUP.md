# 🤖 Twilio WhatsApp Bot - Complete Setup Guide

This guide will help you connect your WhatsApp chatbot to Twilio and start testing it immediately.

## 📋 Prerequisites

- **Node.js** installed (v14 or higher)
- **Twilio Account** (free tier works fine)
- **ngrok** or **Cloudflare Tunnel** for exposing local server
- **WhatsApp** on your phone

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies & Start Server

```powershell
# Navigate to project directory
cd d:\projects\Chatbot-main

# Install dependencies
npm install

# Start the debug server
npm run start:debug
```

The server will start on `http://localhost:3000` with the webhook at `/whatsapp`.

### Step 2: Run Automated Setup

Open a **new terminal** (keep the server running) and run:

```powershell
node setup_twilio.js
```

This script will:
- ✅ Check if your server is running
- ✅ Check if ngrok is installed (and guide you if not)
- ✅ Start ngrok tunnel automatically
- ✅ Give you the exact webhook URL for Twilio
- ✅ Provide step-by-step Twilio configuration instructions

### Step 3: Configure Twilio

The setup script will give you an exact URL like:
```
https://abcd-1234.ngrok.io/whatsapp
```

Then:

1. **Open Twilio Console**: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. **Find "Sandbox Configuration"** section
3. **Set "When a message comes in"** to your ngrok URL + `/whatsapp`
4. **Method**: POST
5. **Click Save**

## 📱 Testing Your Bot

### Join the Sandbox

1. In Twilio Console, you'll see a join code like: `join happy-dog`
2. You'll also see the sandbox number (e.g., `+1 415 523 8886`)
3. Open WhatsApp on your phone
4. Send the join message to that number

### Test Messages

Once joined, try these messages:

| Message | Expected Response |
|---------|------------------|
| `hi` | Language selection menu |
| `1` | Welcome message in English |
| `broom` | List of broom products |
| `cleaning products` | List of cleaning supplies |
| `fabric conditioner` | Search results |

## 🧪 Running Tests

Test the webhook locally before connecting to Twilio:

```powershell
node test_twilio_webhook.js
```

This runs 5 automated tests simulating Twilio webhook calls.

## 🔐 Enable Security (Optional but Recommended)

To validate Twilio webhook signatures:

```powershell
# Set your Twilio Auth Token
$env:TWILIO_AUTH_TOKEN="your_twilio_auth_token_here"
$env:PUBLIC_URL="https://your-ngrok-url.ngrok.io"

# Then start the server
npm run start:debug
```

## 📤 Sending Outbound Messages

To send messages from the bot (not just replies):

```powershell
# Set environment variables
$env:TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
$env:TWILIO_AUTH_TOKEN="your_auth_token"
$env:TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"

# Send a message
node send_message.js "+919999999999" "Hello from the bot!"
```

## 🔍 Monitoring & Debugging

### Local Server Logs
- Check the terminal where `npm run start:debug` is running
- Shows incoming messages and responses

### Ngrok Inspector
- Open: http://localhost:4040
- See all HTTP requests/responses in real-time
- Great for debugging webhook issues

### Twilio Console Logs
- Open: https://console.twilio.com/us1/monitor/logs/debugger
- Shows webhook delivery status
- Displays any errors from Twilio's side

## 📁 Important Files

| File | Purpose |
|------|---------|
| `debug_server.js` | Main webhook server with logging |
| `server.js` | Alternative server implementation |
| `setup_twilio.js` | Automated setup assistant |
| `test_twilio_webhook.js` | Local webhook testing |
| `send_message.js` | Send outbound WhatsApp messages |
| `products.json` | Product database |
| `products_knowledge_enhanced.json` | Enhanced product info |

## 🛠️ Troubleshooting

### Server won't start
```powershell
# Check if port 3000 is already in use
netstat -ano | findstr :3000

# Kill the process if needed (replace PID)
taskkill /PID <process_id> /F
```

### Ngrok not found
Install ngrok using one of these methods:

**Option 1: Chocolatey**
```powershell
choco install ngrok
```

**Option 2: npm**
```powershell
npm install -g ngrok
```

**Option 3: Manual**
1. Download from https://ngrok.com/download
2. Extract ngrok.exe
3. Add to PATH or run from the extracted folder

### Twilio shows 404 errors
- ✅ Ensure ngrok is running
- ✅ Check webhook URL ends with `/whatsapp`
- ✅ Verify ngrok forwards to port 3000
- ✅ Test locally first: `node test_twilio_webhook.js`

### Messages not reaching bot
- ✅ Verify you joined the sandbox (send join code)
- ✅ Check Twilio console logs for errors
- ✅ Look at ngrok inspector (localhost:4040)
- ✅ Ensure server is still running

### Empty responses
- ✅ Check server logs for errors
- ✅ Verify products.json is loaded
- ✅ Try running tests: `node test_twilio_webhook.js`

## 🌐 Alternative to Ngrok: Cloudflare Tunnel

If you prefer Cloudflare Tunnel over ngrok:

```powershell
# Install cloudflared
npm install -g cloudflared

# Start tunnel
cloudflared tunnel --url http://localhost:3000
```

Use the provided URL + `/whatsapp` in Twilio settings.

## 📊 Project Structure

```
Chatbot-main/
├── debug_server.js              # Main webhook server ⭐
├── server.js                    # Alternative server
├── setup_twilio.js              # Setup assistant ⭐
├── test_twilio_webhook.js       # Testing script ⭐
├── send_message.js              # Outbound messaging ⭐
├── products.json                # Product catalog
├── products_knowledge_enhanced.json
├── package.json
└── README_TWILIO_SETUP.md       # This file
```

## 🎯 Next Steps After Setup

1. **Customize responses**: Edit `debug_server.js` to change bot behavior
2. **Add products**: Update `products.json` with your catalog
3. **Deploy to production**: Use a service like Heroku, Railway, or DigitalOcean
4. **Get a dedicated number**: Upgrade from sandbox to production Twilio number
5. **Add features**: Implement cart, checkout, payment integration

## 💡 Tips

- Keep the server terminal and ngrok terminal both open while testing
- Use ngrok inspector (localhost:4040) to see exactly what Twilio sends
- Test locally with `test_twilio_webhook.js` before connecting to Twilio
- Save your ngrok URL - it changes each restart (or get a static one with paid ngrok)
- Check Twilio logs if webhooks fail - they show helpful error messages

## 🆘 Need Help?

1. Run the test suite: `node test_twilio_webhook.js`
2. Check ngrok inspector: http://localhost:4040
3. Check Twilio logs: https://console.twilio.com/us1/monitor/logs/debugger
4. Look at server logs in the terminal

## 📞 Production Deployment

When ready for production:

1. **Get a Twilio phone number** with WhatsApp enabled
2. **Deploy to a cloud service** (Heroku, Railway, DigitalOcean, AWS)
3. **Configure webhook** to your production URL
4. **Enable signature validation** with TWILIO_AUTH_TOKEN
5. **Use a database** instead of in-memory sessions (Redis recommended)
6. **Set up monitoring** and alerts

---

**Made with ❤️ for Rose Chemicals WhatsApp Bot**

For more info about the bot features, see the main README.md
