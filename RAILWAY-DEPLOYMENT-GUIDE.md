# 🚀 Railway.app Deployment Guide
## Rose Chemicals WhatsApp Bot

This guide will help you deploy the WhatsApp bot on Railway.app, which integrates seamlessly with your Meta WhatsApp Business API.

---

## ✅ Prerequisites

- ✅ GitHub repository: https://github.com/A-Generative-Slice/Chatbot
- ✅ Railway.app account: https://railway.app
- ✅ Meta WhatsApp Business API credentials:
  - `WHATSAPP_TOKEN`
  - `PHONE_NUMBER_ID`
  - `VERIFY_TOKEN`
  - `AI_API_KEY` (Sarvam AI - optional)

---

## 📋 Step 1: Create Railway Project

1. Go to https://railway.app and sign up (use GitHub login for easier setup)
2. Click **+ New Project**
3. Select **Deploy from GitHub repo**
4. Authorize Railway to access your GitHub account
5. Select repository: `A-Generative-Slice/Chatbot`
6. Click **Deploy**

---

## 🔧 Step 2: Configure Environment Variables

Once the project is created in Railway:

1. Go to your Railway project dashboard
2. Click on the **rose-whatsapp-bot** service
3. Go to **Variables** tab
4. Add these environment variables:

```env
WHATSAPP_TOKEN=your_meta_whatsapp_token_here
PHONE_NUMBER_ID=your_phone_number_id_here
VERIFY_TOKEN=RoseChemicals_Secure_Token_2024
AI_API_KEY=your_sarvam_ai_key_here
NODE_ENV=production
PORT=3000
```

**Where to get these values:**
- **WHATSAPP_TOKEN**: Meta Business Manager → WhatsApp → API Setup → Access Token
- **PHONE_NUMBER_ID**: Meta Business Manager → WhatsApp → API Setup → Phone Number ID
- **VERIFY_TOKEN**: Create any secure random string (must match your webhook config)
- **AI_API_KEY**: https://www.sarvam.ai/ (optional, for AI responses)

---

## 📦 Step 3: Deploy

Railway automatically deploys when you:

1. Push code to GitHub main branch
2. Or manually trigger deployment in Railway dashboard

Your app will be deployed with a public URL like:
```
https://chatbot-production-xxxx.railway.app
```

You can find this URL in Railway dashboard under **Deployments** → **View Logs**

---

## 🌐 Step 4: Configure Meta Webhook

Now update your WhatsApp Business API webhook:

1. Go to https://business.facebook.com/
2. Navigate to **WhatsApp** → **Configuration** → **Webhook**
3. Click **Edit**
4. Update:
   - **Callback URL**: `https://chatbot-production-xxxx.railway.app/webhook`
   - **Verify Token**: `RoseChemicals_Secure_Token_2024` (same as in Railway env vars)
5. Click **Verify and Save**

---

## ✅ Step 5: Test Your Bot

Send "Hi" to your WhatsApp Business number. The bot should respond with a language selection menu.

---

## 📊 Monitoring

### View Logs in Railway

1. Go to Railway project dashboard
2. Click on your service
3. Click **Logs** tab
4. View real-time logs

### Check Health Endpoint

```bash
curl https://chatbot-production-xxxx.railway.app/health
```

Expected response:
```json
{"status":"healthy","ai":"configured (Sarvam AI)","whatsapp":"configured"}
```

---

## 🔄 Continuous Deployment

Every time you push to GitHub main branch, Railway automatically:
1. Pulls the latest code
2. Installs dependencies
3. Restarts the bot
4. Maintains the same public URL

---

## 🐛 Troubleshooting

### Bot not responding
```bash
# Check health endpoint
curl https://your-railway-url.railway.app/health

# View logs in Railway dashboard
```

### Webhook verification fails
1. Ensure `VERIFY_TOKEN` in Railway matches Meta webhook config
2. Wait 5-10 minutes for Meta to detect changes
3. Check logs: `Meta webhook verification request...`

### Products not loading
- Verify `products.json` is in the repository
- Check logs for: `✅ Loaded X products`

---

## 📝 Production Checklist

- ✅ Environment variables configured in Railway
- ✅ Meta webhook URL updated
- ✅ Health endpoint responding
- ✅ Test message received and responded
- ✅ Logs being recorded
- ✅ .env file NOT committed to git
- ✅ Auto-deploy on GitHub push working

---

## 🎯 Your Railway Bot URL

Once deployed, your bot is accessible at:
```
https://chatbot-production-xxxx.railway.app
```

**Webhook URL for Meta:**
```
https://chatbot-production-xxxx.railway.app/webhook
```

---

## 💡 Tips

1. **Auto-redeploy on code push**: Already configured in Railway
2. **View real-time logs**: Go to Railway dashboard → Logs tab
3. **Restart bot**: Click "Redeploy" in Railway dashboard
4. **Scale resources**: Railway dashboard → Settings → Resources (if needed)

---

## 🚀 Summary

Your WhatsApp bot is now:
- ✅ Deployed on Railway.app
- ✅ Connected to Meta WhatsApp Business API
- ✅ Running 24/7 with auto-restart
- ✅ Auto-deploying from GitHub
- ✅ Supporting 6 Indian languages
- ✅ Searching 500+ products in real-time

**Send "Hi" to test!** 📱

---

**Questions?** Check Railway logs or contact support at https://railway.app/support
