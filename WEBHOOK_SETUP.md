# 🔗 WhatsApp Bot Webhook Setup

## ✅ Current Status (Updated: Now)

**Ngrok Tunnel:** ✅ Running  
**AI Bot Server:** ✅ Running  
**AI Enabled:** ✅ Yes  

---

## 🔗 Your Current Webhook URL

```
https://6cd6ad4e240b.ngrok-free.app/whatsapp
```

---

## 📋 Update Twilio Webhook (Do This Now!)

### Step 1: Open Twilio Console
Go to: https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox

### Step 2: Update Webhook URL
Find the field: **"When a message comes in"**

**Paste this URL:**
```
https://6cd6ad4e240b.ngrok-free.app/whatsapp
```

### Step 3: Save
Click the **SAVE** button

### Step 4: Test
Open WhatsApp and send:
```
show me floor cleaners
```

---

## 🔍 What Was Wrong?

**Problem:** Ngrok tunnel was stopped  
**Result:** Twilio couldn't reach your bot  
**Solution:** Restarted ngrok - new URL generated  

---

## ⚠️ Important: Ngrok URLs Change!

### When Ngrok Restarts:
- ❌ Old URL: `https://a43e7893cf93.ngrok-free.app`
- ✅ New URL: `https://6cd6ad4e240b.ngrok-free.app`

**You MUST update Twilio every time ngrok restarts!**

---

## 🎯 To Keep Bot Running:

### Option 1: Keep Everything Open (Free)
1. **Ngrok Window** - Must stay open
2. **AI Bot Window** - Must stay open
3. Both windows must remain running for bot to work

### Option 2: Get Ngrok Fixed URL ($8/month)
- URL never changes
- No need to update Twilio
- More reliable
- Link: https://ngrok.com/pricing

### Option 3: Deploy to Cloud (Recommended for Production)
**Free Options:**
- Railway.app (500 hours/month free)
- Render.com (750 hours/month free)
- Fly.io (Free tier available)

**Benefits:**
- Permanent URL
- No ngrok needed
- Always online
- Professional setup

---

## 🧪 Quick Test Commands

### Check if bot is running:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health"
```

### Check if ngrok is running:
```powershell
Get-Process -Name ngrok
```

### Get current ngrok URL:
```powershell
Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels"
```

---

## 🔄 Restart Everything (If Needed)

### If Bot Not Responding:

**Step 1: Stop Everything**
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Step 2: Start Ngrok**
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\projects\Chatbot-main'; ngrok http 3000"
```

**Step 3: Start AI Bot**
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$env:HUGGINGFACE_TOKEN='your_token_here'; cd 'd:\projects\Chatbot-main'; npm run start:ai"
```

**Step 4: Get New URL**
Wait 5 seconds, then:
```powershell
$ngrokApi = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels"
$ngrokApi.tunnels[0].public_url + "/whatsapp"
```

**Step 5: Update Twilio**
Use the URL from Step 4

---

## 💡 Pro Tips

### Keep Windows Open
- Don't close ngrok or bot windows
- Minimize them instead of closing
- They must run continuously

### Check Status Regularly
Run health check:
```powershell
Invoke-RestMethod http://localhost:3000/health | ConvertTo-Json
```

### Save Webhook URL
Every time you restart ngrok, save the new URL:
1. Check ngrok window for URL
2. Update Twilio immediately
3. Test with WhatsApp message

---

## 🆘 Troubleshooting

### Bot Not Responding?
**Check:**
1. Is ngrok running? ✅
2. Is AI bot running? ✅
3. Did you update Twilio webhook? ⚠️
4. Is the URL correct? ⚠️

**Fix:**
- Update webhook URL in Twilio
- Make sure URL ends with `/whatsapp`
- Click SAVE in Twilio
- Wait 30 seconds
- Test again

### "Connection Refused" Error?
**Cause:** Bot server stopped  
**Fix:** Restart AI bot (see commands above)

### Ngrok "Tunnel Not Found"?
**Cause:** Ngrok closed  
**Fix:** Restart ngrok (see commands above)

### WhatsApp No Reply?
**Most Common:** Wrong webhook URL in Twilio  
**Fix:** 
1. Get current ngrok URL from ngrok window
2. Update in Twilio
3. Click SAVE
4. Try again

---

## 📊 Windows to Keep Open

You should have 3 PowerShell windows:

1. **Ngrok Window** 
   - Shows: "Forwarding https://xxxxx.ngrok-free.app -> http://localhost:3000"
   - Must stay open!

2. **AI Bot Window**
   - Shows: "🤖 AI Status: ✅ ENABLED"
   - Must stay open!

3. **Your Command Window**
   - For running commands
   - Can close this one

---

## 🎯 Current Setup Summary

| Component | Status | URL/Port |
|-----------|--------|----------|
| AI Bot Server | ✅ Running | http://localhost:3000 |
| Ngrok Tunnel | ✅ Running | https://6cd6ad4e240b.ngrok-free.app |
| Webhook Endpoint | ⚠️ Update Needed | /whatsapp |
| AI Enabled | ✅ Yes | Gemma-2-2B-IT |
| Products Indexed | ✅ 204 | Enhanced with AI |

---

## ✅ Next Steps

1. [ ] Update Twilio webhook with new URL
2. [ ] Click SAVE in Twilio
3. [ ] Test with WhatsApp message
4. [ ] Keep ngrok and bot windows open
5. [ ] Consider deploying to cloud for permanent solution

---

**Updated:** October 6, 2025  
**Webhook URL:** https://6cd6ad4e240b.ngrok-free.app/whatsapp  
**Status:** Ready to test after Twilio update!
