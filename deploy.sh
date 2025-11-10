#!/bin/bash

# ============================================================================
# Quick Deployment Script for Hostinger VPS
# Rose Chemicals WhatsApp Bot
# ============================================================================

set -e  # Exit on error

echo "============================================"
echo "Rose Chemicals WhatsApp Bot - Quick Deploy"
echo "============================================"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "⚠️  Please do not run as root. Use a regular user with sudo access."
   exit 1
fi

# Variables
APP_DIR="/var/www/rose-whatsapp-bot"
APP_NAME="rose-whatsapp-bot"
NODE_VERSION="18"

echo "📋 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js installed: $(node --version)"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Installing..."
    sudo apt-get install -y npm
else
    echo "✅ npm installed: $(npm --version)"
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 not found. Installing..."
    sudo npm install -g pm2
else
    echo "✅ PM2 installed: $(pm2 --version)"
fi

echo ""
echo "📂 Setting up application directory..."

# Create app directory if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
    echo "Creating directory: $APP_DIR"
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
fi

cd $APP_DIR

echo ""
echo "📦 Installing dependencies..."
npm install --production

echo ""
echo "⚙️  Checking configuration..."

# Check if .env file exists
if [ ! -f "$APP_DIR/.env" ]; then
    echo "⚠️  .env file not found!"
    if [ -f "$APP_DIR/.env.example" ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
        echo "⚠️  IMPORTANT: Edit .env file with your actual credentials!"
        echo "   nano $APP_DIR/.env"
    else
        echo "❌ .env.example not found. Please create .env manually."
        exit 1
    fi
else
    echo "✅ .env file exists"
fi

# Create logs directory
mkdir -p $APP_DIR/logs

echo ""
echo "🚀 Starting application with PM2..."

# Stop existing process if running
if pm2 list | grep -q "$APP_NAME"; then
    echo "Stopping existing process..."
    pm2 stop $APP_NAME
    pm2 delete $APP_NAME
fi

# Start with PM2
if [ -f "$APP_DIR/ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js --env production
else
    pm2 start whatsapp_business_bot.js --name $APP_NAME
fi

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
echo ""
echo "⚡ Setting up PM2 startup..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "📝 Next Steps:"
echo "1. Edit .env file with your credentials:"
echo "   nano $APP_DIR/.env"
echo ""
echo "2. Restart the bot:"
echo "   pm2 restart $APP_NAME"
echo ""
echo "3. View logs:"
echo "   pm2 logs $APP_NAME"
echo ""
echo "4. Test health endpoint:"
echo "   curl http://127.0.0.1:3000/health"
echo ""
echo "5. Configure Nginx (see DEPLOYMENT.md)"
echo ""
echo "============================================"
