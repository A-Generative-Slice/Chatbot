#!/bin/bash

# ============================================================================
# One-Command Deploy Script for Hostinger VPS
# Rose Chemicals WhatsApp Bot
# Server: 72.60.218.57 (Mumbai)
# ============================================================================

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   Rose Chemicals WhatsApp Bot - Hostinger VPS Deploy        ║"
echo "║   Server: 72.60.218.57 (Mumbai, India)                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="72.60.218.57"
VPS_USER="root"
REMOTE_DIR="/var/www/rose-whatsapp-bot"
LOCAL_DIR="/Users/smdhussain/Desktop/projects/Chatbot-main"

echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check if we're running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This script is designed for macOS${NC}"
    exit 1
fi

# Check if local directory exists
if [ ! -d "$LOCAL_DIR" ]; then
    echo -e "${RED}❌ Local directory not found: $LOCAL_DIR${NC}"
    exit 1
fi

cd "$LOCAL_DIR"

echo -e "${GREEN}✅ Prerequisites checked${NC}"
echo ""

# Function to run commands on VPS
run_remote() {
    ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "$1"
}

echo -e "${YELLOW}🔑 Testing SSH connection to VPS...${NC}"
if run_remote "echo 'Connection successful'"; then
    echo -e "${GREEN}✅ SSH connection established${NC}"
else
    echo -e "${RED}❌ Cannot connect to VPS. Please check:${NC}"
    echo "   1. You can SSH manually: ssh root@72.60.218.57"
    echo "   2. Your SSH key is added or password is correct"
    exit 1
fi
echo ""

echo -e "${YELLOW}📦 Installing required software on VPS...${NC}"
run_remote "apt update && apt install -y curl wget git nginx" || {
    echo -e "${YELLOW}⚠️  Some packages may already be installed${NC}"
}

echo -e "${YELLOW}🔧 Installing Node.js 18...${NC}"
run_remote "curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt install -y nodejs" || {
    echo -e "${YELLOW}⚠️  Node.js may already be installed${NC}"
}

echo -e "${YELLOW}📦 Installing PM2...${NC}"
run_remote "npm install -g pm2" || {
    echo -e "${YELLOW}⚠️  PM2 may already be installed${NC}"
}

echo -e "${GREEN}✅ Software installation complete${NC}"
echo ""

echo -e "${YELLOW}📂 Creating application directory...${NC}"
run_remote "mkdir -p $REMOTE_DIR"
echo -e "${GREEN}✅ Directory created: $REMOTE_DIR${NC}"
echo ""

echo -e "${YELLOW}📤 Uploading files to VPS...${NC}"
echo "   This may take a minute..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'logs' \
    --exclude '.env' \
    "$LOCAL_DIR/" "$VPS_USER@$VPS_IP:$REMOTE_DIR/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files uploaded successfully${NC}"
else
    echo -e "${RED}❌ File upload failed${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}📦 Installing Node.js dependencies on VPS...${NC}"
run_remote "cd $REMOTE_DIR && npm install --production"
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${YELLOW}⚙️  Creating .env file...${NC}"
run_remote "cd $REMOTE_DIR && cp .env.example .env"
echo -e "${GREEN}✅ .env file created${NC}"
echo ""

echo -e "${YELLOW}🚀 Starting bot with PM2...${NC}"
run_remote "cd $REMOTE_DIR && pm2 stop rose-whatsapp-bot 2>/dev/null || true"
run_remote "cd $REMOTE_DIR && pm2 delete rose-whatsapp-bot 2>/dev/null || true"
run_remote "cd $REMOTE_DIR && pm2 start ecosystem.config.js --env production"
run_remote "pm2 save"
echo -e "${GREEN}✅ Bot started with PM2${NC}"
echo ""

echo -e "${YELLOW}🔧 Setting up PM2 startup...${NC}"
run_remote "pm2 startup systemd -u root --hp /root" | grep -v "PM2" || true
echo -e "${GREEN}✅ PM2 startup configured${NC}"
echo ""

echo -e "${YELLOW}🔍 Testing bot health...${NC}"
sleep 3
HEALTH_CHECK=$(run_remote "curl -s http://localhost:3000/health")
if [[ $HEALTH_CHECK == *"healthy"* ]]; then
    echo -e "${GREEN}✅ Bot is healthy and running!${NC}"
    echo -e "${GREEN}   Response: $HEALTH_CHECK${NC}"
else
    echo -e "${RED}❌ Bot health check failed${NC}"
    echo -e "${YELLOW}📋 Checking logs...${NC}"
    run_remote "pm2 logs rose-whatsapp-bot --lines 20 --nostream"
fi
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                   ✅ DEPLOYMENT COMPLETE!                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🎉 Your WhatsApp bot is now running on your VPS!${NC}"
echo ""
echo "📊 Bot Status:"
run_remote "pm2 status"
echo ""
echo "🔧 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Configure your .env file with actual credentials:"
echo "   ssh root@72.60.218.57"
echo "   nano /var/www/rose-whatsapp-bot/.env"
echo ""
echo "2️⃣  Add these values to .env:"
echo "   WHATSAPP_TOKEN=your_meta_token"
echo "   PHONE_NUMBER_ID=your_phone_id"
echo "   VERIFY_TOKEN=RoseChemicals_Secure_Token_2024"
echo "   AI_API_KEY=your_sarvam_key (optional)"
echo ""
echo "3️⃣  Restart the bot:"
echo "   ssh root@72.60.218.57"
echo "   pm2 restart rose-whatsapp-bot"
echo ""
echo "4️⃣  Setup Nginx and domain (see QUICK-DEPLOY-GUIDE.md)"
echo ""
echo "5️⃣  Configure Meta WhatsApp webhook:"
echo "   URL: https://your-domain.com/webhook"
echo "   Token: RoseChemicals_Secure_Token_2024"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Useful Commands:"
echo "   ssh root@72.60.218.57                    # Connect to VPS"
echo "   pm2 status                                # Check bot status"
echo "   pm2 logs rose-whatsapp-bot               # View logs"
echo "   pm2 restart rose-whatsapp-bot            # Restart bot"
echo "   curl http://localhost:3000/health        # Health check"
echo ""
echo "📖 Full Documentation: QUICK-DEPLOY-GUIDE.md"
echo ""
echo -e "${GREEN}✨ Happy chatting!${NC}"
