# 🚀 Render.com Deployment - Step by Step Instructions

## ⚡ QUICK SUMMARY
You're deploying your WhatsApp bot to **Render.com** (completely FREE, no credit card).
Your bot will be live at: `https://rose-whatsapp-bot-xxxx.onrender.com`

---

## 📋 STEP 1: Create Render Account (2 minutes)

### 1.1 - Open Render Website
```
👉 Go to: https://render.com
```

### 1.2 - Click Sign Up
- Look for **"Sign Up"** button (top right)
- Click it

### 1.3 - Choose GitHub Sign Up
- Click **"Sign up with GitHub"** (easiest option)
- **DO NOT** use email/password

### 1.4 - Authorize Render
- GitHub login page appears
- Enter your GitHub credentials: `smdhussain06` / password
- Click **"Sign in"**

### 1.5 - Authorize Access
- Page says: "Render wants to access your GitHub account"
- Click **"Authorize render-oss"** (green button)
- ✅ **You're now logged into Render!**

---

## 🎯 STEP 2: Create New Web Service (1 minute)

### 2.1 - Click "+ New" Button
- In Render dashboard (top right)
- Click **"+ New"**
- Select **"Web Service"**

### 2.2 - Connect GitHub Repository
- Page asks: "Connect a repository"
- Click **"Connect account"** (GitHub)
- GitHub asks permission again → Click **"Authorize"**
- ✅ Render can now see your GitHub repos

### 2.3 - Select Your Chatbot Repository
- You see list of repositories
- Find and click: **`A-Generative-Slice/Chatbot`**
- Click **"Connect"** button

---

## ⚙️ STEP 3: Configure Deployment Settings (2 minutes)

### 3.1 - Fill in Service Details
After connecting repo, you see a form:

**Field 1: Name**
```
rose-whatsapp-bot
```
(Copy-paste exactly as shown)

**Field 2: Region**
```
Keep default selected (closest to your location)
```

**Field 3: Branch**
```
main
```
(Should be auto-selected)

**Field 4: Runtime**
```
Node
```
(Should be auto-selected from render.yaml)

**Field 5: Build Command**
```
npm install
```
(Should be pre-filled)

**Field 6: Start Command**
```
node whatsapp_business_bot.js
```
(Should be pre-filled)

### 3.2 - Select FREE Plan
- Scroll down to **"Plan"** section
- Select **"Free"** (radio button)
- ✅ **This costs $0**

---

## 🌍 STEP 4: Add Environment Variables (3 minutes)

### 4.1 - Scroll to "Advanced" Section
- Look for **"Advanced"** section on same page
- Click to expand it

### 4.2 - Add First Variable: WHATSAPP_TOKEN
Click **"+ Add Environment Variable"**

**Key**: `WHATSAPP_TOKEN`
**Value**: Paste your token from Meta Business Manager
(Get from: https://business.facebook.com/ → Your App → WhatsApp → API Setup)

### 4.3 - Add Second Variable: PHONE_NUMBER_ID
Click **"+ Add Environment Variable"** again

**Key**: `PHONE_NUMBER_ID`
**Value**: Your WhatsApp Business phone number ID from Meta

### 4.4 - Add Third Variable: VERIFY_TOKEN
Click **"+ Add Environment Variable"** again

**Key**: `VERIFY_TOKEN`
**Value**: `RoseChemicals_Secure_Token_2024`
(This is any string you want - must match Meta webhook config later)

### 4.5 - Add Fourth Variable: AI_API_KEY (Optional)
Click **"+ Add Environment Variable"** again

**Key**: `AI_API_KEY`
**Value**: Your Sarvam AI API key (from: https://www.sarvam.ai/)
(If you don't have Sarvam AI key yet, leave blank for now)

### 4.6 - Add NODE_ENV Variable
Click **"+ Add Environment Variable"** one more time

**Key**: `NODE_ENV`
**Value**: `production`

---

## 🚀 STEP 5: Deploy! (30 seconds)

### 5.1 - Review Everything
Before clicking deploy, check:
- ✅ Service name: `rose-whatsapp-bot`
- ✅ Plan: `Free`
- ✅ Build command: `npm install`
- ✅ Start command: `node whatsapp_business_bot.js`
- ✅ All 5 environment variables added

### 5.2 - Click "Create Web Service"
- Big blue button at bottom
- Click it!

### 5.3 - Wait for Deployment
- Page shows: **"Building..."**
- Render is:
  - Cloning your GitHub code ✓
  - Installing dependencies ✓
  - Starting your bot ✓
- ⏳ **Wait 2-3 minutes...**

### 5.4 - Check Deployment Success
After 2-3 minutes, you see:
```
✅ Your service is live!
```

You see a URL like:
```
https://rose-whatsapp-bot-xxxx.onrender.com
```

📌 **SAVE THIS URL!** You'll need it for Meta webhook setup.

---

## 🔗 STEP 6: Get Your Permanent Bot URL

### 6.1 - Copy Your URL
In Render dashboard for your service:
- Look for the URL at top: `https://rose-whatsapp-bot-xxxx.onrender.com`
- Click the copy icon next to it
- ✅ You now have your bot's permanent public URL!

### 6.2 - Verify Bot is Running
Open this URL in your browser:
```
https://rose-whatsapp-bot-xxxx.onrender.com/health
```

You should see:
```json
{
  "status": "healthy",
  "ai": "configured",
  "whatsapp": "configured"
}
```

✅ **Your bot is running!**

---

## 🔐 STEP 7: Update Meta Webhook URL (2 minutes)

### 7.1 - Go to Meta Business Manager
```
👉 https://business.facebook.com/
```

### 7.2 - Navigate to WhatsApp Settings
1. Click **"Apps"** (left menu)
2. Find your app in the list
3. Click on it
4. Look for **"WhatsApp"** section
5. Click **"Configuration"** tab

### 7.3 - Edit Webhook
- Find section: **"Webhook"**
- Click **"Edit"** button

### 7.4 - Add Callback URL
In the form, fill:

**Callback URL:**
```
https://rose-whatsapp-bot-xxxx.onrender.com/webhook
```
(Replace `xxxx` with your actual Render URL)

**Verify Token:**
```
RoseChemicals_Secure_Token_2024
```
(Must match exactly what you entered in Render environment variables!)

### 7.5 - Save & Verify
- Click **"Verify and Save"**
- Meta tests your webhook
- If successful: ✅ Green checkmark appears

⚠️ **If it fails:**
1. Check Verify Token matches exactly
2. Check Render logs (click "Logs" in Render dashboard)
3. Wait 30 seconds and retry

---

## 📱 STEP 8: Test Your Bot! (1 minute)

### 8.1 - Send Test Message
Using your WhatsApp Business account, send:
```
Hi
```

### 8.2 - Wait for Response
- Your bot should respond with language options
- Languages available: English, Tamil, Hindi, Telugu, Kannada, Malayalam

### 8.3 - Verify It Works
✅ Bot responds → **Deployment successful!**
❌ No response → Check Render logs

---

## 🔧 TROUBLESHOOTING

### Bot Not Responding?
1. **Check Render Logs:**
   - Go to your Render service dashboard
   - Click **"Logs"** tab
   - Look for errors

2. **Check Meta Webhook:**
   - Go to Meta Business Manager → WhatsApp → Configuration
   - Verify Callback URL is correct
   - Verify Token matches

3. **Restart Service:**
   - In Render dashboard
   - Click **"Manual Deploy"** → **"Deploy latest commit"**

### Render Service Crashed?
- Click **"Manual Deploy"** → **"Deploy latest commit"**
- Service auto-restarts

### Environment Variables Not Working?
- Go to Render dashboard
- Click **"Environment"** tab
- Verify all 5 variables are there
- Click **"Manual Deploy"** to apply changes

---

## ✅ FINAL CHECKLIST

Before considering it done:

- [ ] Render account created with GitHub
- [ ] Web Service created: `rose-whatsapp-bot`
- [ ] All 5 environment variables added
- [ ] Service deployed and running (no errors in logs)
- [ ] Got Render URL: `https://rose-whatsapp-bot-xxxx.onrender.com`
- [ ] Health endpoint responds: `/health` → `{"status":"healthy"...}`
- [ ] Updated Meta webhook URL to Render URL
- [ ] Verify Token matches in Meta and Render
- [ ] Tested bot on WhatsApp: sent "Hi"
- [ ] Bot responded with language menu

---

## 🎉 CONGRATULATIONS!

Your WhatsApp bot is now **LIVE and FREE on Render!**

### What You Have:
✅ 24/7 uptime (FREE tier never sleeps)  
✅ Automatic HTTPS/SSL  
✅ Auto-restart if crashes  
✅ Easy scaling (upgrade if needed)  
✅ GitHub auto-deployment (push = auto-update)  
✅ No credit card required  
✅ Completely FREE forever  

### Your Bot URL:
```
https://rose-whatsapp-bot-xxxx.onrender.com
```

### Next Steps:
1. Monitor bot in Render dashboard
2. Check logs if issues arise
3. Later: Move to VPS if needed (code already prepared)

---

## 📞 Need Help?

If stuck on any step:
1. Check Render logs (Logs tab)
2. Verify Meta webhook configuration
3. Ensure environment variables match exactly
4. Click "Manual Deploy" to redeploy

**You're all set!** Your bot is now live and ready to serve customers! 🚀
