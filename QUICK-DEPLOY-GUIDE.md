# 🚀 Rose Chemicals WhatsApp Bot - Deployment Guide
## Your Hostinger VPS: srv1065935.hstgr.cloud (72.60.218.57)

---

## 📋 STEP 1: Connect to Your VPS

Open Terminal on your Mac and connect:

```bash
ssh root@72.60.218.57
```

Enter your root password when prompted.

---

## 🔧 STEP 2: Install Required Software

Copy and paste this entire block into your VPS terminal:

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v18.x
npm --version

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (if not already installed)
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Install other utilities
apt install -y git curl wget unzip
```

---

## 📂 STEP 3: Upload Your Bot Files

### Option A: Using SCP (From Your Mac Terminal)

Open a **NEW terminal window** on your Mac (keep SSH session open):

```bash
cd /Users/smdhussain/Desktop/projects/Chatbot-main
scp -r * root@72.60.218.57:/var/www/rose-whatsapp-bot/
```

### Option B: Using Git (Recommended if you have GitHub)

In your VPS SSH session:

```bash
mkdir -p /var/www/rose-whatsapp-bot
cd /var/www/rose-whatsapp-bot

# If you have a GitHub repo:
git clone https://github.com/yourusername/Chatbot-main.git .

# Otherwise, we'll use SCP (Option A above)
```

---

## 🛠️ STEP 4: Setup the Bot

In your VPS terminal:

```bash
cd /var/www/rose-whatsapp-bot

# Install dependencies
npm install --production

# Create .env file
nano .env
```

**Paste this into the .env file** (use your actual values):

```env
# WhatsApp Business Cloud API
WHATSAPP_TOKEN=your_actual_whatsapp_token_from_meta
PHONE_NUMBER_ID=your_actual_phone_number_id_from_meta
VERIFY_TOKEN=RoseChemicals_Secure_Token_2024

# Sarvam AI (for Indian language support)
AI_API_KEY=your_sarvam_ai_key_if_you_have_one

# Server
PORT=3000
NODE_ENV=production
```

**To save in nano:**
1. Press `Ctrl + O` (save)
2. Press `Enter` (confirm)
3. Press `Ctrl + X` (exit)

---

## 🚀 STEP 5: Start the Bot with PM2

```bash
cd /var/www/rose-whatsapp-bot

# Start with PM2
pm2 start ecosystem.config.js --env production

# Check status
pm2 status

# View logs to verify it's working
pm2 logs rose-whatsapp-bot --lines 20

# Save PM2 config
pm2 save

# Setup auto-start on reboot
pm2 startup
# Copy and run the command PM2 outputs
```

**Test locally:**

```bash
curl http://localhost:3000/health
```

You should see: `{"status":"healthy",...}`

---

## 🌐 STEP 6: Configure Domain & Nginx

### Do you have a domain name for your e-commerce site?

#### **Option A: If you have a domain (e.g., rosechemicals.com)**

**For subdomain (Recommended): bot.rosechemicals.com**

1. **Add DNS Record** (in your domain registrar):
   - Type: `A Record`
   - Name: `bot`
   - Value: `72.60.218.57`
   - TTL: `3600`

2. **Configure Nginx:**

```bash
# Create Nginx config
nano /etc/nginx/sites-available/whatsapp-bot
```

Paste this (replace `bot.rosechemicals.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name bot.rosechemicals.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

Save (`Ctrl+O`, `Enter`, `Ctrl+X`)

3. **Enable and test:**

```bash
# Enable site
ln -s /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/

# Test config
nginx -t

# Reload Nginx
systemctl reload nginx

# Get SSL certificate
certbot --nginx -d bot.rosechemicals.com
```

4. **Your webhook URL will be:** `https://bot.rosechemicals.com/webhook`

---

#### **Option B: If you DON'T have a domain yet**

You can use the IP temporarily for testing:

```bash
# Edit Nginx default config
nano /etc/nginx/sites-available/default
```

Add this location block inside the existing `server` block:

```nginx
location /whatsapp-bot/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Test and reload:

```bash
nginx -t
systemctl reload nginx
```

**Your webhook URL will be:** `http://72.60.218.57/whatsapp-bot/webhook`

**⚠️ Note:** Meta requires HTTPS for production webhooks, so you'll need a domain eventually.

---

## 📱 STEP 7: Configure Meta WhatsApp Webhook

1. Go to: https://business.facebook.com/
2. Click **WhatsApp** → **Configuration** → **Webhook**
3. Click **Edit**
4. Enter:
   - **Callback URL**: `https://bot.rosechemicals.com/webhook` (or your URL)
   - **Verify Token**: `RoseChemicals_Secure_Token_2024` (must match .env)
5. Click **Verify and Save**

### Watch verification in real-time:

In your VPS terminal:

```bash
pm2 logs rose-whatsapp-bot --lines 50
```

You should see: `✅ Webhook verified! Sending challenge: xxxxx`

6. **Subscribe to webhook fields:**
   - ✅ `messages`
   - ✅ `message_status` (optional)

---

## ✅ STEP 8: Test Your Bot!

Send a WhatsApp message to your business number:

```
Hi
```

The bot should respond with:

```
🙏 Welcome to Rose Chemicals!

We're your trusted partner for premium cleaning solutions.

🌐 Please select your preferred language:

1️⃣ English
2️⃣ தமிழ் (Tamil)
3️⃣ हिंदी (Hindi)
4️⃣ తెలుగు (Telugu)
5️⃣ ಕನ್ನಡ (Kannada)
6️⃣ മലയാളം (Malayalam)

Just reply with the number (1-6) or start chatting in your language! 😊
```

---

## 🔍 Monitoring & Troubleshooting

### View Logs
```bash
pm2 logs rose-whatsapp-bot
```

### Check Status
```bash
pm2 status
```

### Restart Bot
```bash
pm2 restart rose-whatsapp-bot
```

### Test Health
```bash
curl http://localhost:3000/health
```

### Check Nginx
```bash
systemctl status nginx
nginx -t
```

### View Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔐 Security Checklist

```bash
# 1. Secure .env file
chmod 600 /var/www/rose-whatsapp-bot/.env

# 2. Setup firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# 3. Check firewall status
ufw status
```

---

## 🎯 Quick Reference Commands

```bash
# Start bot
pm2 start rose-whatsapp-bot

# Stop bot
pm2 stop rose-whatsapp-bot

# Restart bot
pm2 restart rose-whatsapp-bot

# View logs
pm2 logs rose-whatsapp-bot

# View status
pm2 status

# Reload Nginx
systemctl reload nginx

# Test Nginx config
nginx -t

# Check bot health
curl http://localhost:3000/health
```

---

## 📊 Your Server Info

- **VPS IP**: 72.60.218.57
- **Hostname**: srv1065935.hstgr.cloud
- **Location**: Mumbai, India
- **OS**: Ubuntu 22.04 LTS
- **Resources**: 2 CPU cores, 8 GB RAM, 100 GB disk

---

## 🆘 Common Issues

### Bot won't start
```bash
# Check Node version
node --version  # Must be 18+

# Check if port 3000 is in use
lsof -i :3000

# Check logs
pm2 logs rose-whatsapp-bot --err
```

### Webhook verification fails
```bash
# Ensure bot is running
pm2 status

# Test health endpoint
curl http://localhost:3000/health

# Check VERIFY_TOKEN matches in:
# 1. /var/www/rose-whatsapp-bot/.env
# 2. Meta webhook configuration
```

### Can't access via domain
```bash
# Check DNS propagation
nslookup bot.rosechemicals.com

# Check Nginx is running
systemctl status nginx

# Check SSL certificate
certbot certificates
```

---

## 🎉 You're Done!

Your WhatsApp bot is now live at:
- **Server**: 72.60.218.57 (Mumbai, India)
- **Bot**: Running on PM2
- **Webhook**: Configured with Meta
- **Status**: Check with `pm2 status`

**Test it by sending "Hi" to your WhatsApp Business number!** 📱

---

**Need help?** Check logs: `pm2 logs rose-whatsapp-bot`
