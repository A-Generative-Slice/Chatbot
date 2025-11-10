# Rose Chemicals — WhatsApp Support Bot

This repository contains a customer-facing WhatsApp bot that helps customers of Rose Chemicals quickly find products, check prices, and get assistance in their preferred language.

## ✨ Features

### Customer-Facing Capabilities:
- 🛍️ Browse a catalog of 500+ cleaning products across multiple categories
- 💰 Get fast product recommendations and pricing
- 🌍 Support in **6 Indian languages**: English, Tamil, Hindi, Telugu, Kannada, Malayalam
- 🤖 AI-powered responses using Sarvam AI (specialized for Indian languages)
- 💬 Natural language understanding with Tanglish, Hinglish support
- 📱 WhatsApp Cloud API integration (no Twilio dependency)

### How Customers Use It:
1. Send "Hi" to the WhatsApp business number
2. The bot prompts for language selection (6 languages)
3. Ask for a product or category (e.g., "soap", "floor cleaner")
4. The bot replies with product options, prices, and details

### Technical Features:
- Multi-language product search with fuzzy matching
- Session management for conversation context
- Product catalog with 500+ items in `products.json`
- Meta WhatsApp Business Cloud API webhook integration
- Express.js server with health monitoring
- Production-ready with PM2/Systemd support

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ and npm
- Meta WhatsApp Business API account (verified)
- Sarvam AI API key (optional, for AI responses)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Chatbot-main.git
cd Chatbot-main

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
WHATSAPP_TOKEN=your_whatsapp_access_token
PHONE_NUMBER_ID=your_phone_number_id
VERIFY_TOKEN=your_custom_verify_token
AI_API_KEY=your_sarvam_ai_api_key
PORT=3000
NODE_ENV=development
```

Get these from:
- **WhatsApp credentials**: Meta Business Manager → WhatsApp → API Setup
- **Sarvam AI key**: https://www.sarvam.ai/

### Test Locally

```bash
# Start the bot
npm start

# In another terminal, test health endpoint
curl http://localhost:3000/health

# Expected response:
# {"status":"healthy","ai":"configured (Sarvam AI)","whatsapp":"configured"}
```

---

## 🌐 Production Deployment (Hostinger VPS)

### For complete deployment instructions, see: [**DEPLOYMENT.md**](./DEPLOYMENT.md)

The bot is designed to run alongside your existing e-commerce website on the same VPS. You can deploy using:

- **Subdomain routing**: `bot.yourdomain.com` (Recommended)
- **Path-based routing**: `yourdomain.com/whatsapp-bot`

### Quick Deploy Script

```bash
# On your VPS, upload files and run:
cd /var/www/rose-whatsapp-bot
chmod +x deploy.sh
./deploy.sh
```

### Key Configuration Files Included:

| File | Purpose |
|------|---------|
| `DEPLOYMENT.md` | Complete VPS deployment guide |
| `ecosystem.config.js` | PM2 process configuration |
| `rose-whatsapp-bot.service` | Systemd service file |
| `nginx-subdomain.conf` | Nginx config for subdomain |
| `nginx-path-based.conf` | Nginx config for path-based routing |
| `deploy.sh` | Automated deployment script |

---

## 📂 Project Structure

```
Chatbot-main/
├── whatsapp_business_bot.js    # Main bot application
├── products.json                # Product catalog (500+ products)
├── package.json                 # Dependencies and scripts
├── .env.example                 # Environment template
├── DEPLOYMENT.md               # Complete deployment guide
├── ecosystem.config.js         # PM2 configuration
├── rose-whatsapp-bot.service   # Systemd service file
├── nginx-subdomain.conf        # Nginx subdomain config
├── nginx-path-based.conf       # Nginx path config
├── deploy.sh                   # Quick deploy script
├── Procfile                    # Process definition
├── railway.json                # Railway.app config
└── README.md                   # This file
```

---

## 🔧 Usage

### Available Scripts

```bash
npm start              # Start production server
npm run dev           # Start with auto-reload (nodemon)
npm run start:whatsapp # Alternative start command
npm test              # Run tests
```

### PM2 Commands (Production)

```bash
pm2 start ecosystem.config.js --env production  # Start
pm2 status                                      # Check status
pm2 logs rose-whatsapp-bot                      # View logs
pm2 restart rose-whatsapp-bot                   # Restart
pm2 stop rose-whatsapp-bot                      # Stop
```

---

## 📱 WhatsApp Configuration

### Set Up Webhook in Meta Business Manager

1. Go to: https://business.facebook.com/
2. Navigate to: **WhatsApp** → **Configuration** → **Webhook**
3. Enter:
   - **Callback URL**: `https://bot.yourdomain.com/webhook`
   - **Verify Token**: Same as in your `.env` file
4. Subscribe to: `messages` and `message_status`

### Test Webhook

Send "Hi" to your WhatsApp Business number. The bot should respond with a language selection menu.

---

## 🛠️ Troubleshooting

### Bot Not Starting
```bash
# Check logs
pm2 logs rose-whatsapp-bot --err

# Verify Node version
node --version  # Must be 18+

# Check if port is in use
sudo lsof -i :3000
```

### Webhook Verification Failed
```bash
# Test health endpoint
curl https://bot.yourdomain.com/health

# Check VERIFY_TOKEN matches in:
# - .env file
# - Meta webhook configuration

# View webhook logs
pm2 logs rose-whatsapp-bot | grep webhook
```

### Products Not Loading
```bash
# Validate JSON
cat products.json | jq .

# Check file exists
ls -la products.json
```

For more troubleshooting, see [DEPLOYMENT.md](./DEPLOYMENT.md#-troubleshooting)

---

## 📊 Monitoring

### Health Check Endpoint

```bash
curl https://bot.yourdomain.com/health
```

Response:
```json
{
  "status": "healthy",
  "ai": "configured (Sarvam AI)",
  "whatsapp": "configured"
}
```

### View Logs

```bash
# PM2
pm2 logs rose-whatsapp-bot --lines 100

# Systemd
sudo journalctl -u rose-whatsapp-bot -f
```

---

## 🔐 Security

- ✅ Environment variables stored in `.env` (not committed)
- ✅ Nginx reverse proxy with SSL (Let's Encrypt)
- ✅ Rate limiting on webhook endpoint
- ✅ Security headers configured
- ✅ Firewall configured (UFW)
- ✅ Process isolation with PM2/Systemd

---

## 🎯 Supported Languages

1. **English** - Full support
2. **தமிழ் (Tamil)** - Native + Tanglish (Tamil in English script)
3. **हिंदी (Hindi)** - Native + Hinglish (Hindi in English script)
4. **తెలుగు (Telugu)** - Native + Tenglish
5. **ಕನ್ನಡ (Kannada)** - Native script
6. **മലയാളം (Malayalam)** - Native script

The bot automatically detects language from user messages and responds accordingly.

---

## 📦 Product Catalog

The bot searches through 500+ products across categories:
- Chemical Raw Materials
- Perfumes & Fragrances
- Ready-to-Use Cleaning Solutions
- Nouful Products
- And many more...

Update products by editing `products.json`.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is proprietary software for Rose Chemicals.

---

## 📞 Support

For deployment assistance or issues:
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup
- Check logs: `pm2 logs rose-whatsapp-bot`
- Test webhook: Meta Business Manager → WhatsApp → Configuration
- Verify environment: `curl http://localhost:3000/health`

---

## 🎉 Credits

Built with:
- [Express.js](https://expressjs.com/) - Web framework
- [Meta WhatsApp Business Cloud API](https://developers.facebook.com/docs/whatsapp) - Messaging platform
- [Sarvam AI](https://www.sarvam.ai/) - Indian language AI
- [PM2](https://pm2.keymetrics.io/) - Process manager
- [Nginx](https://nginx.org/) - Web server

---

**© 2025 Rose Chemicals** | WhatsApp Support Bot
