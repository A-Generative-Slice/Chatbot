// Automated Twilio Setup Helper
// This script helps you get your ngrok URL and provides exact Twilio configuration

const { spawn } = require('child_process');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function logSuccess(message) {
  log('✅', message, colors.green);
}

function logError(message) {
  log('❌', message, colors.red);
}

function logInfo(message) {
  log('ℹ️', message, colors.cyan);
}

function logWarning(message) {
  log('⚠️', message, colors.yellow);
}

function printBanner() {
  console.log('\n' + colors.bright + colors.magenta);
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║        🤖  TWILIO WHATSAPP BOT SETUP ASSISTANT  🤖           ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log(colors.reset + '\n');
}

async function checkServerStatus() {
  logInfo('Step 1: Checking if local server is running...');
  
  try {
    const response = await fetch('http://localhost:3000/health', { timeout: 3000 });
    if (response.ok) {
      logSuccess('Local server is running on http://localhost:3000');
      return true;
    } else {
      logError('Server is running but returned non-200 status');
      return false;
    }
  } catch (error) {
    logError('Local server is NOT running');
    logWarning('Please start the server first:');
    console.log(colors.cyan + '   npm run start:debug' + colors.reset);
    console.log('\n   Or in a new terminal:');
    console.log(colors.cyan + '   node debug_server.js' + colors.reset + '\n');
    return false;
  }
}

async function checkNgrokInstalled() {
  logInfo('Step 2: Checking if ngrok is installed...');
  
  return new Promise((resolve) => {
    const ngrok = spawn('ngrok', ['version'], { shell: true });
    let output = '';
    
    ngrok.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ngrok.on('close', (code) => {
      if (code === 0 && output.includes('ngrok')) {
        logSuccess(`ngrok is installed: ${output.trim()}`);
        resolve(true);
      } else {
        logWarning('ngrok is not installed or not in PATH');
        resolve(false);
      }
    });
    
    ngrok.on('error', () => {
      logWarning('ngrok is not installed');
      resolve(false);
    });
  });
}

function provideNgrokInstructions() {
  console.log('\n' + colors.yellow + '─'.repeat(70) + colors.reset);
  log('📥', 'HOW TO INSTALL NGROK:', colors.bright + colors.cyan);
  console.log(colors.yellow + '─'.repeat(70) + colors.reset + '\n');
  
  console.log('Option 1: Using Chocolatey (recommended)');
  console.log(colors.cyan + '   choco install ngrok' + colors.reset + '\n');
  
  console.log('Option 2: Using npm');
  console.log(colors.cyan + '   npm install -g ngrok' + colors.reset + '\n');
  
  console.log('Option 3: Manual download');
  console.log('   1. Visit: https://ngrok.com/download');
  console.log('   2. Download the Windows version');
  console.log('   3. Extract ngrok.exe to a folder');
  console.log('   4. Add that folder to your PATH\n');
  
  console.log('Option 4: Use Cloudflare Tunnel instead');
  console.log(colors.cyan + '   npm install -g cloudflared' + colors.reset);
  console.log(colors.cyan + '   cloudflared tunnel --url http://localhost:3000' + colors.reset + '\n');
}

async function startNgrokAndGetUrl() {
  logInfo('Step 3: Starting ngrok tunnel...');
  
  return new Promise((resolve) => {
    const ngrok = spawn('ngrok', ['http', '3000', '--log=stdout'], { shell: true });
    let output = '';
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        logWarning('Ngrok is taking longer than expected...');
        logInfo('You can manually check ngrok status at: http://localhost:4040');
      }
    }, 5000);
    
    ngrok.stdout.on('data', async (data) => {
      output += data.toString();
      
      // Try to extract the public URL from ngrok output
      if (!resolved && output.includes('started tunnel')) {
        clearTimeout(timeout);
        
        // Wait a bit for ngrok API to be available
        await new Promise(r => setTimeout(r, 2000));
        
        try {
          const apiResponse = await fetch('http://localhost:4040/api/tunnels');
          const tunnels = await apiResponse.json();
          
          if (tunnels.tunnels && tunnels.tunnels.length > 0) {
            const httpsUrl = tunnels.tunnels.find(t => t.proto === 'https');
            if (httpsUrl) {
              resolved = true;
              resolve({
                success: true,
                url: httpsUrl.public_url,
                process: ngrok
              });
            }
          }
        } catch (error) {
          // Fallback: try to extract from output
          const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.ngrok[^.\s]*/i);
          if (urlMatch) {
            resolved = true;
            resolve({
              success: true,
              url: urlMatch[0],
              process: ngrok
            });
          }
        }
      }
    });
    
    ngrok.on('error', (error) => {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        resolve({ success: false, error: error.message });
      }
    });
    
    // Fallback timeout
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve({ 
          success: false, 
          error: 'Timeout waiting for ngrok. Check http://localhost:4040 manually.' 
        });
      }
    }, 15000);
  });
}

function provideTwilioConfiguration(webhookUrl) {
  console.log('\n' + colors.green + '═'.repeat(70) + colors.reset);
  log('🎉', 'YOUR WEBHOOK IS READY!', colors.bright + colors.green);
  console.log(colors.green + '═'.repeat(70) + colors.reset + '\n');
  
  logSuccess('Webhook URL: ' + colors.bright + webhookUrl + '/whatsapp' + colors.reset);
  
  console.log('\n' + colors.cyan + '─'.repeat(70) + colors.reset);
  log('📱', 'TWILIO CONFIGURATION STEPS:', colors.bright + colors.cyan);
  console.log(colors.cyan + '─'.repeat(70) + colors.reset + '\n');
  
  console.log('1️⃣  ' + colors.bright + 'Open Twilio Console' + colors.reset);
  console.log('   👉 https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn\n');
  
  console.log('2️⃣  ' + colors.bright + 'Configure Sandbox Webhook' + colors.reset);
  console.log('   • Look for "Sandbox Configuration" section');
  console.log('   • Find "When a message comes in" field');
  console.log('   • Paste this URL:');
  console.log(colors.yellow + '     ' + webhookUrl + '/whatsapp' + colors.reset);
  console.log('   • Select method: ' + colors.bright + 'POST' + colors.reset);
  console.log('   • Click ' + colors.bright + 'Save' + colors.reset + '\n');
  
  console.log('3️⃣  ' + colors.bright + 'Join the Sandbox from WhatsApp' + colors.reset);
  console.log('   • Twilio shows a join code like: "join <word>-<word>"');
  console.log('   • Also shows the sandbox number (e.g., +1 415 523 8886)');
  console.log('   • Open WhatsApp on your phone');
  console.log('   • Send the join message to that number\n');
  
  console.log('4️⃣  ' + colors.bright + 'Test Your Bot!' + colors.reset);
  console.log('   Try these messages:');
  console.log(colors.cyan + '   • "hi" ' + colors.reset + '→ Language selection');
  console.log(colors.cyan + '   • "1" ' + colors.reset + '→ Select English');
  console.log(colors.cyan + '   • "broom" ' + colors.reset + '→ Search products');
  console.log(colors.cyan + '   • "cleaning products" ' + colors.reset + '→ Browse category\n');
  
  console.log(colors.cyan + '─'.repeat(70) + colors.reset + '\n');
  
  // Save config to file
  const config = {
    webhookUrl: webhookUrl + '/whatsapp',
    localUrl: 'http://localhost:3000',
    timestamp: new Date().toISOString(),
    status: 'active'
  };
  
  try {
    fs.writeFileSync(
      path.join(__dirname, 'twilio_webhook_config.json'),
      JSON.stringify(config, null, 2)
    );
    logInfo('Configuration saved to: twilio_webhook_config.json');
  } catch (error) {
    // Ignore write errors
  }
}

function provideMonitoringInfo() {
  console.log(colors.cyan + '─'.repeat(70) + colors.reset);
  log('🔍', 'MONITORING & DEBUGGING:', colors.bright + colors.cyan);
  console.log(colors.cyan + '─'.repeat(70) + colors.reset + '\n');
  
  console.log('• Ngrok Inspector: ' + colors.bright + 'http://localhost:4040' + colors.reset);
  console.log('  View all HTTP requests/responses in real-time\n');
  
  console.log('• Twilio Console Logs:');
  console.log('  👉 https://console.twilio.com/us1/monitor/logs/debugger');
  console.log('  See webhook delivery status and errors\n');
  
  console.log('• Local Server Logs:');
  console.log('  Check the terminal where you ran: npm run start:debug\n');
}

function provideOptionalEnhancements() {
  console.log(colors.cyan + '─'.repeat(70) + colors.reset);
  log('⚙️', 'OPTIONAL ENHANCEMENTS:', colors.bright + colors.yellow);
  console.log(colors.cyan + '─'.repeat(70) + colors.reset + '\n');
  
  console.log('🔐 Enable Twilio Request Validation:');
  console.log('   Set environment variable before starting server:');
  console.log(colors.cyan + '   $env:TWILIO_AUTH_TOKEN="your_twilio_auth_token"' + colors.reset);
  console.log('   This validates incoming webhook signatures\n');
  
  console.log('📤 Send Outbound Messages:');
  console.log('   Use the send_message.js script:');
  console.log(colors.cyan + '   $env:TWILIO_ACCOUNT_SID="ACxxx"' + colors.reset);
  console.log(colors.cyan + '   $env:TWILIO_AUTH_TOKEN="your_token"' + colors.reset);
  console.log(colors.cyan + '   $env:TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"' + colors.reset);
  console.log(colors.cyan + '   node send_message.js "+919999999999" "Test message"' + colors.reset + '\n');
}

async function main() {
  printBanner();
  
  // Step 1: Check server
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    process.exit(1);
  }
  
  console.log();
  
  // Step 2: Check ngrok
  const ngrokInstalled = await checkNgrokInstalled();
  
  if (!ngrokInstalled) {
    provideNgrokInstructions();
    
    console.log('\n' + colors.yellow + '⏸️  Setup paused. Please install ngrok and run this script again.' + colors.reset);
    console.log(colors.cyan + '   node setup_twilio.js' + colors.reset + '\n');
    process.exit(0);
  }
  
  console.log();
  
  // Step 3: Start ngrok
  const ngrokResult = await startNgrokAndGetUrl();
  
  if (!ngrokResult.success) {
    logError('Failed to start ngrok: ' + ngrokResult.error);
    console.log('\n' + colors.yellow + 'Manual ngrok start:' + colors.reset);
    console.log(colors.cyan + '   ngrok http 3000' + colors.reset);
    console.log('\nThen use the https URL shown + /whatsapp for Twilio\n');
    process.exit(1);
  }
  
  logSuccess('Ngrok tunnel started successfully!');
  logInfo('Public URL: ' + colors.bright + ngrokResult.url + colors.reset);
  
  console.log();
  
  // Step 4: Provide Twilio configuration
  provideTwilioConfiguration(ngrokResult.url);
  
  // Step 5: Monitoring info
  provideMonitoringInfo();
  
  // Step 6: Optional enhancements
  provideOptionalEnhancements();
  
  // Final message
  console.log(colors.green + '═'.repeat(70) + colors.reset);
  log('✨', 'SETUP COMPLETE! Your bot is ready to receive messages.', colors.bright + colors.green);
  console.log(colors.green + '═'.repeat(70) + colors.reset + '\n');
  
  logWarning('Keep this terminal open - ngrok must stay running!');
  logInfo('Press Ctrl+C to stop ngrok when done testing\n');
  
  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n\n' + colors.yellow + '🛑 Shutting down ngrok...' + colors.reset);
    if (ngrokResult.process) {
      ngrokResult.process.kill();
    }
    process.exit(0);
  });
}

main().catch(error => {
  logError('Setup failed: ' + error.message);
  console.error(error);
  process.exit(1);
});
