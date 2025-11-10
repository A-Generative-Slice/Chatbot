# 🚀 VPS Deployment Guide - Hostinger KVM 2
## Deploy Rose Chemicals WhatsApp Bot alongside E-commerce Site

This guide walks you through deploying the WhatsApp bot on your Hostinger VPS running alongside your existing e-commerce website.

---

## 📋 Prerequisites

- ✅ Hostinger KVM 2 VPS with SSH access
- ✅ Existing e-commerce site running (PHP/Node/etc.)
- ✅ Domain name with DNS access
- ✅ Meta WhatsApp Business API verified and approved
- ✅ Node.js 18+ and npm installed on VPS
- ✅ Nginx web server (already running for e-commerce)

---

## 🎯 Deployment Strategy

The bot will run as a separate Node.js service on port 3000 (or custom port), proxied through Nginx alongside your e-commerce site. You have two routing options:

1. **Subdomain** (Recommended): `bot.yourdomain.com` → Cleaner, isolated
2. **Path-based**: `yourdomain.com/whatsapp-bot` → Single domain

---

## 📦 Step 1: Server Preparation

### 1.1 SSH into your VPS
```bash
ssh root@your-vps-ip
# Or if you use a specific user:
ssh username@your-vps-ip
```

### 1.2 Install Required Software
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x or higher
npm --version

# Install PM2 for process management (recommended)
sudo npm install -g pm2

# Install Git (if not already installed)
sudo apt install -y git

# Ensure Nginx is installed (should already be for e-commerce)
sudo apt install -y nginx

# Install Certbot for SSL (if not already installed)
sudo apt install -y certbot python3-certbot-nginx
```

### 1.3 Configure Firewall
```bash
# Check firewall status
sudo ufw status

# Allow required ports
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS

# Enable firewall if not already enabled
sudo ufw enable
```

---

## 📂 Step 2: Deploy Bot Application

### 2.1 Create Application Directory
```bash
# Create directory for the bot
sudo mkdir -p /var/www/rose-whatsapp-bot
sudo chown -R $USER:$USER /var/www/rose-whatsapp-bot
cd /var/www/rose-whatsapp-bot
```

### 2.2 Upload Bot Files

**Option A: Using Git (Recommended)**
```bash
# Clone your repository
git clone https://github.com/yourusername/Chatbot-main.git .

# Or if private repo:
git clone https://<token>@github.com/yourusername/Chatbot-main.git .
```

**Option B: Using SCP from your local machine**
```bash
# From your local machine (macOS terminal):
cd /Users/smdhussain/Desktop/projects/Chatbot-main
scp -r * username@your-vps-ip:/var/www/rose-whatsapp-bot/
```

**Option C: Using SFTP/FTP Client**
- Use FileZilla, Cyberduck, or similar
- Upload all files to `/var/www/rose-whatsapp-bot/`

### 2.3 Install Dependencies
```bash
cd /var/www/rose-whatsapp-bot
npm install --production
```

### 2.4 Configure Environment Variables
```bash
# Create .env file from example
cp .env.example .env

# Edit with your credentials
nano .env
# Or use: vim .env
```

**Edit the `.env` file with your actual values:**
```env
# WhatsApp Business Cloud API Configuration
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PHONE_NUMBER_ID=123456789012345
VERIFY_TOKEN=your_secure_random_token_123

# Sarvam AI API Key (for Indian language support)
AI_API_KEY=your_sarvam_ai_key_here

# Server Configuration
PORT=3000
NODE_ENV=production
```

**Important:** 
- Get `WHATSAPP_TOKEN` and `PHONE_NUMBER_ID` from Meta Business Manager → WhatsApp → API Setup
- `VERIFY_TOKEN` can be any secure random string you choose
- Get `AI_API_KEY` from https://www.sarvam.ai/

### 2.5 Create Logs Directory
```bash
mkdir -p /var/www/rose-whatsapp-bot/logs
```

---

## 🔧 Step 3: Process Management

Choose **ONE** of these methods:

### Option A: PM2 (Recommended - Easier)

```bash
# Start the bot using PM2 with ecosystem config
cd /var/www/rose-whatsapp-bot
pm2 start ecosystem.config.js --env production

# Check status
pm2 status

# View logs
pm2 logs rose-whatsapp-bot

# Setup auto-start on server reboot
pm2 startup
pm2 save

# Useful PM2 commands:
pm2 restart rose-whatsapp-bot  # Restart after code changes
pm2 stop rose-whatsapp-bot     # Stop the bot
pm2 delete rose-whatsapp-bot   # Remove from PM2
```

### Option B: Systemd Service (Alternative)

```bash
# Copy service file
sudo cp /var/www/rose-whatsapp-bot/rose-whatsapp-bot.service /etc/systemd/system/

# Edit service file if needed (adjust paths/user)
sudo nano /etc/systemd/system/rose-whatsapp-bot.service

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable rose-whatsapp-bot
sudo systemctl start rose-whatsapp-bot

# Check status
sudo systemctl status rose-whatsapp-bot

# View logs
sudo journalctl -u rose-whatsapp-bot -f

# Useful systemd commands:
sudo systemctl restart rose-whatsapp-bot
sudo systemctl stop rose-whatsapp-bot
```

### 2.6 Test Local Connection
```bash
# Test if bot is running
curl http://127.0.0.1:3000/health

# Expected response:
# {"status":"healthy","ai":"configured (Sarvam AI)","whatsapp":"configured"}
```

---

## 🌐 Step 4: Nginx Configuration

### Choose Your Routing Strategy:

### Option A: Subdomain (Recommended)

**4A.1 Create DNS Record**
- Go to your domain registrar/DNS manager
- Add A record: `bot.yourdomain.com` → `your-vps-ip`
- Wait 5-10 minutes for DNS propagation

**4A.2 Create Nginx Configuration**
```bash
# Copy the subdomain config
sudo cp /var/www/rose-whatsapp-bot/nginx-subdomain.conf /etc/nginx/sites-available/whatsapp-bot

# Edit with your actual domain
sudo nano /etc/nginx/sites-available/whatsapp-bot
# Change: bot.yourdomain.com → bot.yourrealdomain.com
```

**4A.3 Enable Site**
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

**4A.4 Setup SSL with Certbot**
```bash
# Get SSL certificate (Certbot will auto-configure Nginx)
sudo certbot --nginx -d bot.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Option B: Path-based (Same Domain)

**4B.1 Edit Existing E-commerce Nginx Config**
```bash
# Find your e-commerce site config
ls /etc/nginx/sites-available/

# Edit it (replace 'your-site' with actual filename)
sudo nano /etc/nginx/sites-available/your-site
```

**4B.2 Add Bot Location Block**

Add this **inside** your existing `server` block:
```nginx
# WhatsApp Bot
location /whatsapp-bot/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
}
```

**4B.3 Test and Reload**
```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 📱 Step 5: Meta WhatsApp Configuration

### 5.1 Set Webhook URL

**For Subdomain:**
- Webhook URL: `https://bot.yourdomain.com/webhook`

**For Path-based:**
- Webhook URL: `https://yourdomain.com/whatsapp-bot/webhook`

### 5.2 Configure in Meta Business Manager

1. Go to: https://business.facebook.com/
2. Navigate to: **WhatsApp** → **Configuration** → **Webhook**
3. Click **Edit**
4. Enter:
   - **Callback URL**: Your webhook URL (from above)
   - **Verify Token**: Same value as in your `.env` file
5. Click **Verify and Save**
6. Subscribe to webhook fields:
   - ✅ `messages`
   - ✅ `message_status` (optional)

### 5.3 Test Webhook

```bash
# Monitor logs while Meta sends verification
pm2 logs rose-whatsapp-bot --lines 50

# Or if using systemd:
sudo journalctl -u rose-whatsapp-bot -f
```

You should see:
```
✅ Webhook verified! Sending challenge: xxxxx
```

---

## ✅ Step 6: Final Testing

### 6.1 Test Health Endpoint

**Subdomain:**
```bash
curl https://bot.yourdomain.com/health
```

**Path-based:**
```bash
curl https://yourdomain.com/whatsapp-bot/health
```

### 6.2 Test WhatsApp Message

1. Send "Hi" to your WhatsApp Business number
2. Bot should respond with language selection menu
3. Select a language and ask about products

### 6.3 Monitor Logs

**PM2:**
```bash
pm2 logs rose-whatsapp-bot --lines 100
```

**Systemd:**
```bash
sudo journalctl -u rose-whatsapp-bot -n 100 -f
```

---

## 🔒 Security Best Practices

### 1. Restrict `.env` File Permissions
```bash
chmod 600 /var/www/rose-whatsapp-bot/.env
```

### 2. Setup Nginx Rate Limiting (Optional)
Add to your Nginx server block:
```nginx
limit_req_zone $binary_remote_addr zone=whatsapp:10m rate=10r/s;

location /webhook {
    limit_req zone=whatsapp burst=20 nodelay;
    proxy_pass http://127.0.0.1:3000/webhook;
}
```

### 3. Enable Nginx Security Headers
Already included in the provided config files.

### 4. Regular Updates
```bash
# Update bot code
cd /var/www/rose-whatsapp-bot
git pull

# Reinstall dependencies if package.json changed
npm install --production

# Restart bot
pm2 restart rose-whatsapp-bot
# Or: sudo systemctl restart rose-whatsapp-bot
```

---

## 🐛 Troubleshooting

### Bot Not Starting
```bash
# Check Node.js version
node --version  # Must be 18+

# Check if port 3000 is in use
sudo lsof -i :3000

# Check logs for errors
pm2 logs rose-whatsapp-bot --err
```

### Webhook Verification Failed
```bash
# Ensure bot is running
curl http://127.0.0.1:3000/health

# Check Nginx proxy is working
curl https://bot.yourdomain.com/health

# Verify VERIFY_TOKEN matches in:
# - .env file
# - Meta webhook configuration

# Check firewall allows HTTPS
sudo ufw status | grep 443
```

### Messages Not Received
```bash
# Check webhook is subscribed in Meta
# Check logs for incoming requests
pm2 logs rose-whatsapp-bot

# Test webhook manually
curl -X POST https://bot.yourdomain.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"object":"whatsapp_business_account","entry":[{"changes":[{"value":{"messages":[{"from":"1234567890","id":"msg_id","text":{"body":"test"}}]}}]}]}'
```

### Products Not Loading
```bash
# Verify products.json exists and is valid JSON
cat /var/www/rose-whatsapp-bot/products.json | jq .
# If jq not installed: sudo apt install jq

# Check file permissions
ls -la /var/www/rose-whatsapp-bot/products.json
```

### High Memory Usage
```bash
# Check memory
free -h

# Restart bot
pm2 restart rose-whatsapp-bot

# Or add memory limit in ecosystem.config.js
# max_memory_restart: '500M'
```

---

## 📊 Monitoring & Maintenance

### View Bot Status
```bash
# PM2 dashboard
pm2 monit

# Resource usage
pm2 status
```

### Setup Log Rotation (PM2)
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Setup Log Rotation (Systemd)
```bash
sudo nano /etc/logrotate.d/rose-whatsapp-bot
```

Add:
```
/var/log/rose-whatsapp-bot*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload rose-whatsapp-bot > /dev/null 2>&1 || true
    endscript
}
```

### Backup Important Files
```bash
# Create backup script
sudo nano /usr/local/bin/backup-whatsapp-bot.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/whatsapp-bot"
mkdir -p $BACKUP_DIR

# Backup code and config
tar -czf $BACKUP_DIR/bot-backup-$DATE.tar.gz \
  /var/www/rose-whatsapp-bot \
  --exclude='node_modules' \
  --exclude='logs'

# Keep only last 7 backups
find $BACKUP_DIR -name "bot-backup-*.tar.gz" -mtime +7 -delete
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup-whatsapp-bot.sh
```

Add to crontab:
```bash
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-whatsapp-bot.sh
```

---

## 🚀 Performance Optimization

### 1. Enable Gzip in Nginx
Already included in provided configs.

### 2. Use PM2 Cluster Mode (for high traffic)
Edit `ecosystem.config.js`:
```javascript
instances: 'max',  // Use all CPU cores
exec_mode: 'cluster'
```

Restart:
```bash
pm2 reload ecosystem.config.js --env production
```

### 3. Add Redis for Session Storage (Optional)
For persistent sessions across bot restarts.

---

## 📞 Support & Maintenance

### Regular Tasks
- [ ] Monitor logs daily for errors
- [ ] Update Meta access tokens before expiry
- [ ] Keep Node.js and dependencies updated
- [ ] Review and optimize `products.json` regularly
- [ ] Test webhook after any DNS/SSL changes

### Update Checklist
1. Backup current deployment
2. Test changes locally first
3. Pull updates: `git pull`
4. Install dependencies: `npm install --production`
5. Restart: `pm2 restart rose-whatsapp-bot`
6. Monitor logs: `pm2 logs rose-whatsapp-bot`
7. Test with real WhatsApp message

---

## 🎉 You're All Set!

Your WhatsApp bot is now running on Hostinger VPS alongside your e-commerce site!

**Quick Reference:**

| Component | URL | Status Command |
|-----------|-----|----------------|
| Bot Health | `https://bot.yourdomain.com/health` | `pm2 status` |
| Bot Logs | - | `pm2 logs rose-whatsapp-bot` |
| Nginx Config | `/etc/nginx/sites-available/whatsapp-bot` | `sudo nginx -t` |
| Bot Code | `/var/www/rose-whatsapp-bot` | `cd /var/www/rose-whatsapp-bot` |

**Need Help?**
- Check logs first: `pm2 logs rose-whatsapp-bot`
- Verify webhook: Meta Business Manager → WhatsApp → Configuration
- Test locally: `curl http://127.0.0.1:3000/health`

---

**Last Updated:** November 6, 2025  
**Deployment Platform:** Hostinger KVM 2 VPS  
**Process Manager:** PM2 / Systemd  
**Web Server:** Nginx  
**SSL:** Let's Encrypt (Certbot)
