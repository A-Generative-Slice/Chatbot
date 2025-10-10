# 🤖 Rose Chemicals WhatsApp Business Bot

## 📁 Essential Files Only

### Core Files
- **`whatsapp_business_bot.js`** - Main bot application (Node.js + Express)
- **`.env`** - Configuration (API keys, tokens, phone IDs)
- **`products.json`** - Product catalog (204 cleaning products)
- **`package.json`** - npm dependencies
- **`ngrok.exe`** - Tunnel for public webhook access

### Features
✅ Multilingual AI (Tamil, Hindi, Telugu, Kannada, Malayalam, English)  
✅ Tanglish/Hinglish detection (responds in native scripts)  
✅ Greeting menu on "Hi" command  
✅ Product search & recommendations with prices  
✅ Sarvam AI integration (FREE model)  
✅ Session management  

## 🚀 Quick Start

### 1. Start Bot
```powershell
npm start
```

### 2. Start Ngrok (New Terminal)
```powershell
.\ngrok.exe http 3000
```

### 3. Configure Webhook
- Copy ngrok URL: `https://xxxx.ngrok-free.app`
- Go to Meta Developer Console → WhatsApp → Configuration
- Set Webhook URL: `https://xxxx.ngrok-free.app/webhook`
- Verify Token: `RoseChemicals_WhatsApp_Verify_2025_Secure_Token_9X7K`

## 🔧 Configuration (.env)

```env
WHATSAPP_TOKEN=<Your WhatsApp API Token>
PHONE_NUMBER_ID=857249474128046
AI_API_KEY=<Sarvam AI Key>
VERIFY_TOKEN=RoseChemicals_WhatsApp_Verify_2025_Secure_Token_9X7K
PORT=3000
```

## 📝 Important Notes

- **Token expires every 24h** (temporary token) - get permanent System User token
- **Ngrok URL changes** on restart - update webhook in Meta Console
- **Test phone number** must be added in WhatsApp Business API setup
- **204 products loaded** from 9 categories

## 🆘 Health Check

```
http://localhost:3000/health
```

## 🎯 Bot Behavior

1. Customer says **"Hi"** → Language menu (1-6)
2. Customer selects **"2"** → Tamil confirmed
3. Customer types **"soap venum"** (Tanglish) → Bot responds in Tamil script
4. All future messages → Same language maintained
5. Say **"Hi"** again → Reset & show menu

---
**Built with:** Node.js, Express, Sarvam AI, WhatsApp Cloud API  
**Company:** Rose Chemicals - Premium Cleaning Solutions
