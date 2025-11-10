# 🚂 Railway.app Deployment Guide
## Rose Chemicals WhatsApp Bot

---

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Railway.app account (free tier available)
- ✅ Meta WhatsApp Business API credentials (already verified)
- ✅ Sarvam AI API key (optional, for enhanced AI responses)

---

## 🚀 Step-by-Step Deployment

### Step 1: Push to GitHub

Your code is already committed locally. Now create a GitHub repository:

1. Go to: https://github.com/new
2. Repository name: `rose-whatsapp-bot` (or any name you prefer)
3. Set as **Private** (recommended for business applications)
4. **DO NOT** initialize with README, .gitignore, or license (we already have them)
5. Click **Create repository**

Then push your code:

```bash
cd /Users/smdhussain/Desktop/projects/Chatbot-main

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/rose-whatsapp-bot.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy to Railway.app

1. **Go to Railway**: https://railway.app/
2. Click **Login** → Sign in with GitHub
3. Click **New Project**
4. Select **Deploy from GitHub repo**
5. Choose **rose-whatsapp-bot** (or your repository name)
6. Railway will automatically detect Node.js and use your `railway.json` configuration

Railway will start building immediately!

---

### Step 3: Configure Environment Variables

While the deployment is building:

1. In Railway dashboard, click on your deployed service
2. Go to **Variables** tab
3. Add these environment variables:

```env
WHATSAPP_TOKEN=your_meta_whatsapp_access_token
PHONE_NUMBER_ID=your_meta_phone_number_id
VERIFY_TOKEN=RoseChemicals_Secure_Token_2024
AI_API_KEY=your_sarvam_ai_key_optional
NODE_ENV=production
PORT=3000
```

**Where to get these values:**

- **WHATSAPP_TOKEN** & **PHONE_NUMBER_ID**: 
  - Go to: https://developers.facebook.com/apps
  - Select your WhatsApp app
  - Navigate to: **WhatsApp** → **API Setup**
  - Copy **Temporary access token** and **Phone number ID**
  
- **VERIFY_TOKEN**: 
  - Create a secure random string (e.g., `RoseChemicals_Secure_Token_2024`)
  - Save this - you'll need it for Meta webhook configuration

- **AI_API_KEY**:
  - Go to: https://www.sarvam.ai/
  - Sign up and get your API key
  - This is optional - bot will work without it using fallback responses

4. Click **Add** for each variable
5. Railway will automatically redeploy with new variables

---

### Step 4: Get Your Railway Deployment URL

1. In Railway dashboard, go to **Settings** tab
2. Scroll to **Domains** section
3. Click **Generate Domain**
4. Railway will give you a URL like: `rose-whatsapp-bot-production.up.railway.app`

**Test your deployment:**

Open in browser: `https://your-railway-url.up.railway.app/health`

You should see:
```json
{
  "status": "healthy",
  "ai": "configured (Sarvam AI)",
  "whatsapp": "configured"
}
```

---

### Step 5: Configure Meta WhatsApp Webhook

1. Go to: https://business.facebook.com/
2. Navigate to: **WhatsApp** → **Configuration** → **Webhook**
3. Click **Edit**
4. Enter:
   - **Callback URL**: `https://your-railway-url.up.railway.app/webhook`
   - **Verify Token**: Same value as `VERIFY_TOKEN` you set in Railway
5. Click **Verify and Save**

Meta will send a verification request to your Railway deployment.

6. **Subscribe to webhook fields:**
   - ✅ `messages`
   - ✅ `message_status` (optional)

---

### Step 6: Test Your Bot! 🎉

1. Send a WhatsApp message to your business number: `Hi`
2. Bot should respond with language selection menu
3. Choose a language (1-6)
4. Ask about products (e.g., "floor cleaner", "soap")
5. Bot will respond with product recommendations and prices

---

## 🔧 Railway.app Management

### View Logs
```
Railway Dashboard → Your Service → Logs tab
```

### Restart Deployment
```
Railway Dashboard → Your Service → Settings → Restart
```

### Update Environment Variables
```
Railway Dashboard → Your Service → Variables → Edit
```

### Custom Domain (Optional)
```
Railway Dashboard → Your Service → Settings → Domains → Add Custom Domain
```

---

## 🔄 Update Your Bot Code

When you make changes to the code:

```bash
cd /Users/smdhussain/Desktop/projects/Chatbot-main

# Make your changes to the files
# Then commit and push:

git add .
git commit -m "Description of your changes"
git push origin main
```

Railway will **automatically redeploy** when you push to GitHub!

---

## 📊 Monitor Your Bot

### Railway Dashboard
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: History of all deployments

### Health Check Endpoint
```
https://your-railway-url.up.railway.app/health
```

### Webhook Endpoint
```
https://your-railway-url.up.railway.app/webhook
```

---

## 🆘 Troubleshooting

### Deployment Failed
1. Check **Build Logs** in Railway
2. Verify `package.json` has all dependencies
3. Ensure `railway.json` and `Procfile` are correct

### Webhook Verification Failed
1. Ensure `VERIFY_TOKEN` in Railway matches Meta configuration
2. Check deployment logs for verification request
3. Verify Railway deployment is running (check `/health` endpoint)

### Bot Not Responding to Messages
1. Check Railway logs for incoming webhook requests
2. Verify `WHATSAPP_TOKEN` and `PHONE_NUMBER_ID` are correct
3. Ensure Meta webhook is subscribed to `messages` field
4. Check that your WhatsApp Business API is in live mode (not test mode)

### Products Not Loading
1. Verify `products.json` is included in GitHub repository
2. Check Railway logs for product loading messages
3. Should see: `✅ Loaded 204 products from 9 categories`

### AI Responses Not Working
1. Check if `AI_API_KEY` is set correctly
2. Bot will still work without Sarvam AI (uses fallback responses)
3. Verify Sarvam AI quota/credits

---

## 💰 Railway.app Pricing

**Free Tier (Starter Plan):**
- ✅ $5 worth of usage per month (free)
- ✅ Unlimited projects
- ✅ Automatic deployments
- ✅ HTTPS included
- ✅ 500 hours of runtime per month

**For Production:**
- Railway charges based on actual resource usage
- Typical WhatsApp bot costs: $5-10/month
- Monitor usage in Railway dashboard

**Cost Optimization:**
- Use Railway's built-in sleep (stops after inactivity)
- Or upgrade to keep bot running 24/7

---

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` file to GitHub
- ✅ Always use Railway Variables for sensitive data
- ✅ Rotate access tokens periodically

### GitHub Repository
- ✅ Keep repository **Private** if possible
- ✅ Review `.gitignore` to exclude sensitive files
- ✅ Enable branch protection on `main`

### WhatsApp API
- ✅ Monitor webhook requests in Railway logs
- ✅ Validate incoming webhook signatures (already implemented)
- ✅ Use strong `VERIFY_TOKEN`

---

## 📈 Scaling Your Bot

### If You Get High Traffic:

1. **Upgrade Railway Plan**
   - More CPU and memory
   - Dedicated resources

2. **Optimize Code**
   - Review `products.json` size
   - Implement caching
   - Optimize database queries (if you add a database later)

3. **Add Database**
   - Railway supports PostgreSQL, MySQL, Redis
   - Store user sessions persistently
   - Track conversation history

---

## 🎯 Next Steps After Deployment

1. **Monitor for 24 hours**: Check Railway logs and test with real customers
2. **Update Meta to Production**: Move from test to live mode in Meta Business Manager
3. **Add Analytics**: Track popular product searches
4. **Add Features**:
   - Order placement
   - Payment integration
   - Customer support escalation
   - Multi-agent support

---

## 📞 Support & Resources

### Railway.app
- Documentation: https://docs.railway.app/
- Discord: https://discord.gg/railway
- Status: https://status.railway.app/

### Meta WhatsApp Business API
- Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api
- Support: https://business.facebook.com/help

### Sarvam AI
- Documentation: https://docs.sarvam.ai/
- Support: https://sarvam.ai/contact

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub (private repository)
- [ ] Railway project created and connected to GitHub
- [ ] All environment variables configured in Railway
- [ ] Deployment successful (check `/health` endpoint)
- [ ] Meta webhook URL updated to Railway domain
- [ ] Webhook verification successful
- [ ] Webhook fields subscribed (messages)
- [ ] Test message sent and bot responded
- [ ] Language selection working
- [ ] Product search working
- [ ] AI responses working (or fallback responses)
- [ ] Railway logs monitored for errors
- [ ] Meta API in production mode

---

## 🎉 You're Live!

Your WhatsApp bot is now running on Railway.app with:
- ✅ Automatic deployments from GitHub
- ✅ HTTPS enabled
- ✅ Scalable infrastructure
- ✅ 24/7 uptime
- ✅ Real-time logs and monitoring
- ✅ No VPS management needed!

**Railway URL**: `https://your-railway-url.up.railway.app`  
**Webhook**: `https://your-railway-url.up.railway.app/webhook`  
**Health Check**: `https://your-railway-url.up.railway.app/health`

---

**Deployed on**: November 10, 2025  
**Platform**: Railway.app  
**GitHub**: Connected for automatic deployments  
**Meta WhatsApp**: Live and verified ✅
