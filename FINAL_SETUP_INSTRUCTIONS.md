# ✅ YOUR BOT IS READY! - FINAL SETUP STEPS

## 🎉 What's Done

✅ Server is running on `http://localhost:3000`  
✅ Webhook endpoint ready at `/whatsapp`  
✅ Tests passed (5/5)  
✅ Dependencies installed  
✅ Ngrok installed  

## 📱 COMPLETE THESE 3 STEPS TO TEST

### Step 1: Start Ngrok (if not already running)

Open a **NEW PowerShell terminal** and run:

```powershell
ngrok http 3000
```

You'll see output like this:
```
Session Status                online
Account                       ...
Version                       ...
Region                        ...
Forwarding                    https://abcd-1234.ngrok.io -> http://localhost:3000
```

**Copy the `https://...ngrok.io` URL** - this is your public URL!

---

### Step 2: Configure Twilio WhatsApp Sandbox

1. **Open Twilio Console:**  
   👉 https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

2. **Scroll to "Sandbox Configuration"**

3. **Find the field "When a message comes in"**

4. **Paste your ngrok URL + `/whatsapp`:**
   ```
   https://YOUR-NGROK-URL.ngrok.io/whatsapp
   ```
   Example: `https://abcd-1234.ngrok.io/whatsapp`

5. **Select Method:** `POST`

6. **Click "Save"**

---

### Step 3: Join Sandbox & Test

1. **In Twilio Console, you'll see:**
   - A join code like: `join happy-dog`
   - A phone number like: `+1 415 523 8886`

2. **On your phone:**
   - Open WhatsApp
   - Send the join code to that number
   - Wait for confirmation

3. **Test the bot with these messages:**
   ```
   hi              → Bot shows language menu
   1               → Select English
   broom           → Search for brooms
   cleaning        → Browse cleaning products
   ```

---

## 🔍 Monitoring & Debugging

### Check if messages are being received:

1. **Server Logs** (terminal where you ran `npm run start:debug`)
   - Shows incoming messages and responses
   - Look for: `📱 From: whatsapp:+...`

2. **Ngrok Inspector** 
   - Open: http://localhost:4040
   - See all HTTP requests in real-time
   - Shows what Twilio sends and what your bot responds

3. **Twilio Console Logs**
   - Open: https://console.twilio.com/us1/monitor/logs/debugger
   - Shows webhook delivery status
   - Displays any errors from Twilio's side

---

## 🐛 Troubleshooting

### Problem: Twilio shows 404 error

**Solution:**
- ✅ Make sure ngrok URL ends with `/whatsapp`
- ✅ Check ngrok is still running (window open)
- ✅ Verify server is running on port 3000

### Problem: Bot doesn't respond

**Solution:**
- ✅ Check server terminal for errors
- ✅ Make sure you joined the sandbox first
- ✅ Look at ngrok inspector (localhost:4040)
- ✅ Check Twilio debugger logs

### Problem: Ngrok URL changed

**Solution:**
- Ngrok gives you a new URL each restart (free tier)
- Update the webhook URL in Twilio Console
- Or get a static URL with ngrok paid plan

---

## 📊 Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| **Local Server** | http://localhost:3000 | Your bot |
| **Health Check** | http://localhost:3000/health | Server status |
| **Ngrok Inspector** | http://localhost:4040 | HTTP traffic |
| **Twilio Sandbox** | [Link](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn) | Configuration |
| **Twilio Logs** | [Link](https://console.twilio.com/us1/monitor/logs/debugger) | Webhook logs |

---

## 🎯 Checklist

- [ ] Server running (`npm run start:debug`)
- [ ] Ngrok running (`ngrok http 3000`)
- [ ] Copied ngrok https URL
- [ ] Updated Twilio webhook to: `https://YOUR-URL.ngrok.io/whatsapp`
- [ ] Method set to POST
- [ ] Clicked Save in Twilio
- [ ] Joined sandbox from phone
- [ ] Sent test message "hi"
- [ ] Received language selection menu

---

## 📤 Send Outbound Messages (Optional)

To send messages FROM the bot (not just replies):

```powershell
# Set these environment variables first
$env:TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
$env:TWILIO_AUTH_TOKEN="your_auth_token_here"
$env:TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"

# Then send a message
node send_message.js "+919999999999" "Hello from bot!"
```

---

## 🔒 Enable Security (Recommended for Production)

Before starting server:

```powershell
$env:TWILIO_AUTH_TOKEN="your_twilio_auth_token"
$env:PUBLIC_URL="https://your-ngrok-url.ngrok.io"
npm run start:debug
```

This validates incoming webhook signatures.

---

## 💡 Tips

- **Keep both terminals open** (server + ngrok) while testing
- **Use ngrok inspector** to see exactly what's being sent/received
- **Check all three logs** (server, ngrok, Twilio) when debugging
- **Test locally first** with `node test_twilio_webhook.js`
- **Ngrok URL changes** every restart (free tier) - update Twilio each time

---

## 🚀 What's Next?

Once your bot is working:

1. **Customize responses** - Edit `debug_server.js`
2. **Add more products** - Update `products.json`
3. **Deploy to cloud** - Use Heroku, Railway, or DigitalOcean
4. **Get production number** - Move from sandbox to real Twilio WhatsApp number
5. **Add payments** - Integrate checkout and payment processing

---

## 📞 Need Help?

Run these diagnostic commands:

```powershell
# Test webhook locally
node test_twilio_webhook.js

# Check if server is running
Invoke-WebRequest http://localhost:3000/health

# Check if ngrok is running
Invoke-WebRequest http://localhost:4040
```

---

**🎉 You're all set! Start ngrok, configure Twilio, and test your bot!**

For detailed documentation, see: `README_TWILIO_SETUP.md`
