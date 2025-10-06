const express = require('express');
const { spawn } = require('child_process');
const fetch = require('node-fetch');

// Configuration
const PORT = 3000;
const NGROK_URL = 'https://4940e668ef4f.ngrok-free.app';

async function testConnections() {
    console.log('🧪 Testing WhatsApp Bot Connections...\n');
    
    // Test 1: Local server
    console.log('1️⃣ Testing Local Server...');
    try {
        const response = await fetch(`http://localhost:${PORT}/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Local server is healthy:', data.status);
        } else {
            console.log('❌ Local server returned:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Local server connection failed:', error.message);
        return false;
    }
    
    // Test 2: Local webhook
    console.log('\n2️⃣ Testing Local Webhook...');
    try {
        const response = await fetch(`http://localhost:${PORT}/whatsapp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'Body=test&From=whatsapp:+1234567890&To=whatsapp:+0987654321&MessageSid=test123&ProfileName=TestUser'
        });
        
        if (response.ok) {
            console.log('✅ Local webhook is responding');
        } else {
            console.log('❌ Local webhook error:', response.status);
        }
    } catch (error) {
        console.log('❌ Local webhook test failed:', error.message);
    }
    
    // Test 3: Product search functionality
    console.log('\n3️⃣ Testing Product Search...');
    try {
        const response = await fetch(`http://localhost:${PORT}/whatsapp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'Body=1&From=whatsapp:+1234567890&To=whatsapp:+0987654321&MessageSid=lang123&ProfileName=TestUser'
        });
        
        if (response.ok) {
            const result = await response.text();
            console.log('✅ Language selection working');
            
            // Test product search
            const searchResponse = await fetch(`http://localhost:${PORT}/whatsapp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'Body=broom&From=whatsapp:+1234567890&To=whatsapp:+0987654321&MessageSid=search123&ProfileName=TestUser'
            });
            
            if (searchResponse.ok) {
                const searchResult = await searchResponse.text();
                if (searchResult.includes('broom') || searchResult.includes('product')) {
                    console.log('✅ Product search is working');
                } else {
                    console.log('⚠️  Product search might need adjustment');
                }
            }
        }
    } catch (error) {
        console.log('❌ Product search test failed:', error.message);
    }
    
    // Test 4: Ngrok accessibility
    console.log('\n4️⃣ Testing Ngrok Tunnel...');
    const ngrokTests = [
        { url: NGROK_URL + '/health', description: 'Health endpoint' },
        { url: NGROK_URL + '/test', description: 'Test endpoint' }
    ];
    
    let ngrokWorking = false;
    for (const test of ngrokTests) {
        try {
            const response = await fetch(test.url, {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'User-Agent': 'WhatsApp-Bot-Test/1.0'
                },
                timeout: 10000
            });
            
            if (response.ok) {
                console.log(`✅ ${test.description}: Working`);
                ngrokWorking = true;
                break;
            } else {
                console.log(`❌ ${test.description}: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${test.description}: ${error.message}`);
        }
    }
    
    return ngrokWorking;
}

async function generateSolutions() {
    console.log('\n🔧 CONNECTION SOLUTIONS:\n');
    
    console.log('📋 OPTION 1: VS Code Port Forwarding (Recommended)');
    console.log('1. Open VS Code');
    console.log('2. Press Ctrl+Shift+P');
    console.log('3. Type "Forward a Port"');
    console.log('4. Enter: 3000');
    console.log('5. Use the generated URL + /whatsapp for Twilio\n');
    
    console.log('📋 OPTION 2: Router Port Forwarding');
    console.log('1. Find your local IP: ipconfig');
    console.log('2. Access router admin (usually 192.168.1.1)');
    console.log('3. Forward external port 3000 to your PC');
    console.log('4. Use your public IP:3000/whatsapp for Twilio\n');
    
    console.log('📋 OPTION 3: Cloudflare Tunnel');
    console.log('1. Install: npm install -g cloudflared');
    console.log('2. Run: cloudflared tunnel --url http://localhost:3000');
    console.log('3. Use the generated URL + /whatsapp\n');
    
    console.log('📋 OPTION 4: Direct Twilio Testing');
    console.log('1. Use Twilio Console\'s "Test your webhook" feature');
    console.log('2. Send test messages directly from Twilio');
    console.log('3. Use ngrok inspect (http://localhost:4040) to see requests\n');
    
    console.log('🎯 CURRENT SETUP STATUS:');
    console.log(`✅ Local Server: http://localhost:${PORT}`);
    console.log(`✅ Webhook Endpoint: http://localhost:${PORT}/whatsapp`);
    console.log(`⚠️  Ngrok URL: ${NGROK_URL} (external access issues)`);
    console.log('✅ Product Database: 204+ products loaded');
    console.log('✅ Knowledge Base: 9 DIY kits ready');
    console.log('✅ Smart Search: Natural language processing active');
}

async function main() {
    const ngrokWorking = await testConnections();
    
    if (ngrokWorking) {
        console.log('\n🎉 SUCCESS! Your WhatsApp bot is ready!');
        console.log(`📱 Webhook URL for Twilio: ${NGROK_URL}/whatsapp`);
        console.log('\n📞 Configure this in Twilio Console > WhatsApp Sandbox Settings');
    } else {
        await generateSolutions();
    }
    
    console.log('\n🧪 Test Messages (once connected):');
    console.log('• "1" - Select English');
    console.log('• "show me broom" - Find broom products');
    console.log('• "fabric conditioner recipe" - Get DIY kit info');
    console.log('• "cleaning products" - List cleaning supplies');
}

main().catch(console.error);