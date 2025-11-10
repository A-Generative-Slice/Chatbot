# 🚀 FREE Railway.app Deployment Guide
## Rose Chemicals WhatsApp Bot - No Credit Card Required!

Railway offers a **FREE tier** with generous limits. Here's how to deploy your bot completely FREE:

---

## ✅ Railway FREE Tier Benefits

- ✅ **$5 USD/month free credits** (more than enough!)
- ✅ **No credit card required initially** 
- ✅ **Automatic SSL/HTTPS**
- ✅ **Custom domains support**
- ✅ **GitHub auto-deployment**
- ✅ **Environment variables**
- ✅ **Logs & monitoring**

**Your bot costs: ~$2-3/month** (well within free tier!)

---

## 🎯 Step-by-Step FREE Deployment

### Step 1: Create FREE Railway Account
1. Go to: https://railway.app
2. Click **Sign Up**
3. Choose **Sign up with GitHub** (easiest)
4. Authorize Railway
5. **No credit card needed!** ✓

### Step 2: Create New Project
1. In Railway dashboard, click **+ New Project**
2. Select **Deploy from GitHub repo**
3. Connect your GitHub account
4. Select: `A-Generative-Slice/Chatbot`
5. Click **Deploy**

Railway will automatically:
- Clone your code from GitHub
- Install dependencies
- Start the bot
- Assign a FREE public URL

### Step 3: Get Your Free URL
After ~2-3 minutes, Railway shows:
```
Your app is live at:
https://chatbot-production-xxxx.railway.app
```

**This is your permanent FREE URL!** ✓

### Step 4: Add Environment Variables
In Railway Dashboard → Your Service → **Variables tab**:

Click **+ Add Variable** and add:

```env
WHATSAPP_TOKEN=your_meta_token
PHONE_NUMBER_ID=your_phone_id
VERIFY_TOKEN=RoseChemicals_Secure_Token_2024
AI_API_KEY=your_sarvam_ai_key
NODE_ENV=production
```

**How to get these values:**
1. **WHATSAPP_TOKEN** & **PHONE_NUMBER_ID**: 
   - Go to: https://business.facebook.com/
   - Apps → Your App → WhatsApp
   - Click "API Setup"
   - Copy the tokens

2. **VERIFY_TOKEN**: 
   - Make up any secure string, e.g., `RoseChemicals_Secure_Token_2024`

3. **AI_API_KEY** (Optional):
   - Sign up at: https://www.sarvam.ai/
   - Copy API key

### Step 5: Update Variables
1. Paste each value
2. Click **Save**
3. Railway automatically redeploys

### Step 6: Update Meta Webhook
1. Go to: https://business.facebook.com/
2. Your App → WhatsApp → Configuration → Webhook
3. Click **Edit**
4. Enter:
   - **Callback URL**: `https://chatbot-production-xxxx.railway.app/webhook`
   - **Verify Token**: `RoseChemicals_Secure_Token_2024`
5. Click **Verify and Save**

### Step 7: Test Your Bot! 🎉
Send "Hi" to your WhatsApp Business number

→ Bot responds with language menu  
→ Success! ✅

---

## 💰 Costs (FREE!)

| Service | Cost | Notes |
|---------|------|-------|
| **Railway Hosting** | FREE $5/mo credit | Enough for your bot |
| **Bot uptime** | FREE 24/7 | No extra charges |
| **SSL/HTTPS** | FREE | Automatic |
| **Logs** | FREE | Unlimited |
| **GitHub Integration** | FREE | Auto-deploy on push |
| **Domain** | Optional | Paid separately |

**Total cost: $0-5/month (FREE!)** ✓

---

## 🎮 After Deployment Commands

```bash
# View logs
railway logs

# Redeploy
railway deploy

# Check status
railway status
```

---

## ✨ What You Get FREE

✅ Bot running 24/7  
✅ Automatic SSL (HTTPS)  
✅ Auto-restart if crashes  
✅ Environment variables secure  
✅ Logs and monitoring  
✅ Auto-redeploy on GitHub push  
✅ Custom domain support  
✅ No credit card needed!

---

## 🚀 Ready? Let's Go!

1. **Right now**: Visit https://railway.app → Sign up with GitHub
2. **Deploy your repo**: Select `A-Generative-Slice/Chatbot`
3. **Add env vars**: Your credentials
4. **Update Meta**: Webhook URL
5. **Test**: Send "Hi" to WhatsApp

That's it! 🎉 Your bot is live and FREE!

---

## 💡 Pro Tips

1. **Always commit changes to GitHub** - Railway auto-deploys on push
2. **Never commit .env** - Use Railway's Variables instead
3. **Monitor logs** - Check Railway dashboard if issues
4. **Keep products.json updated** - Commit changes to GitHub
5. **Upgrade if needed** - Pay plan available but not needed for this bot

---

## 🆘 Troubleshooting (FREE Deployment)

### Bot not deploying?
- Check: GitHub repo connection
- Verify: railway.json exists
- See: Railway logs

### Webhook fails?
- Confirm: VERIFY_TOKEN matches
- Wait: 5-10 minutes for Meta update
- Check: Railway logs

### Products not loading?
- Verify: products.json in GitHub
- Check: logs show "✅ Loaded X products"

---

## 🎯 Summary

Your bot costs **absolutely NOTHING** to run on Railway!

✅ Sign up FREE  
✅ Deploy from GitHub  
✅ Add environment variables  
✅ Update Meta webhook  
✅ Send "Hi" to test  
✅ Done! 🚀

**All for FREE with $5 monthly credit!**

---

**Ready to deploy?**  
→ https://railway.app  
→ Sign up with GitHub  
→ Deploy `A-Generative-Slice/Chatbot`  
→ Add env vars  
→ Send "Hi" to test  

**That's it! Your bot is now live and FREE!** 🎉
