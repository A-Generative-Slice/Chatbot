const express = require('express');
const { exec } = require('child_process');
const fetch = require('node-fetch');

async function setupWhatsAppBot() {
    console.log('🚀 Setting up WhatsApp Bot with Tunnel...\n');
    
    // Test if local server is responsive
    console.log('📍 Testing local server...');
    try {
        const response = await fetch('http://localhost:3000/health');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Local server is running:', data.status);
        } else {
            console.log('❌ Local server is not responding properly');
            return;
        }
    } catch (error) {
        console.log('❌ Local server is not running. Please start it first.');
        console.log('💡 Run: node simple_rag_server.js');
        return;
    }
    
    console.log('\n🌐 Testing external access methods...\n');
    
    // Test different tunnel methods
    const tunnelMethods = [
        {
            name: 'Ngrok',
            url: 'https://a53e7cd457ae.ngrok-free.app',
            description: 'Professional tunneling service'
        },
        {
            name: 'LocalTunnel',
            url: 'https://stupid-kings-sip.loca.lt',
            description: 'Free open-source tunnel'
        }
    ];
    
    for (const method of tunnelMethods) {
        console.log(`🔍 Testing ${method.name}...`);
        try {
            const response = await fetch(`${method.url}/health`, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'WhatsApp-Bot-Test/1.0'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${method.name} is working!`);
                console.log(`🔗 URL: ${method.url}`);
                console.log(`📱 Webhook: ${method.url}/whatsapp`);
                
                // Test webhook
                console.log(`📱 Testing ${method.name} webhook...`);
                const webhookTest = await fetch(`${method.url}/whatsapp`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'Body=test&From=whatsapp:+1234567890&To=whatsapp:+0987654321&MessageSid=test123&ProfileName=TestUser'
                });
                
                if (webhookTest.ok) {
                    console.log(`✅ ${method.name} webhook is working!`);
                    console.log(`\n🎉 SUCCESS! Use this URL for Twilio:`);
                    console.log(`📲 ${method.url}/whatsapp\n`);
                    return method.url;
                } else {
                    console.log(`❌ ${method.name} webhook failed: ${webhookTest.status}`);
                }
            } else {
                console.log(`❌ ${method.name} returned: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${method.name} connection failed: ${error.message}`);
        }
        console.log();
    }
    
    console.log('❌ No working tunnel found. Here are your options:\n');
    console.log('1️⃣ Restart ngrok: ngrok http 3000');
    console.log('2️⃣ Try LocalTunnel: npx lt --port 3000');
    console.log('3️⃣ Use VS Code port forwarding');
    console.log('4️⃣ Configure your router for port forwarding');
    
    return null;
}

// Test webhook functionality
async function testWhatsAppWebhook(baseUrl) {
    console.log('\n🧪 Testing WhatsApp Bot Functionality...\n');
    
    const testCases = [
        {
            name: 'Language Selection',
            body: '1',
            expected: 'language'
        },
        {
            name: 'Product Search - Broom',
            body: 'show me broom',
            expected: 'product'
        },
        {
            name: 'Product Search - Fabric',
            body: 'fabric conditioner',
            expected: 'product'
        },
        {
            name: 'Natural Language',
            body: 'I need cleaning products',
            expected: 'product'
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`🔍 Testing: ${testCase.name}`);
        try {
            const response = await fetch(`${baseUrl}/whatsapp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `Body=${encodeURIComponent(testCase.body)}&From=whatsapp:+1234567890&To=whatsapp:+0987654321&MessageSid=test${Date.now()}&ProfileName=TestUser`
            });
            
            if (response.ok) {
                const result = await response.text();
                console.log(`✅ Bot responded (${result.length} chars)`);
                
                // Basic response validation
                if (result.includes('<Message>')) {
                    console.log('✅ Valid TwiML response');
                } else {
                    console.log('⚠️  Response might not be valid TwiML');
                }
            } else {
                console.log(`❌ Test failed: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ Test error: ${error.message}`);
        }
        console.log();
    }
}

// Main execution
async function main() {
    const workingUrl = await setupWhatsAppBot();
    
    if (workingUrl) {
        await testWhatsAppWebhook(workingUrl);
        
        console.log('\n🎯 SETUP COMPLETE!\n');
        console.log('📋 Next Steps:');
        console.log('1. Copy the webhook URL above');
        console.log('2. Go to Twilio Console > WhatsApp Sandbox');
        console.log('3. Paste the URL in the webhook field');
        console.log('4. Save the configuration');
        console.log('5. Test by sending a message to your WhatsApp bot!');
        
        console.log('\n✨ Your bot can now understand:');
        console.log('• "show me broom" - finds broom products');
        console.log('• "fabric conditioner recipe" - shows DIY recipes');
        console.log('• "cleaning products" - lists cleaning supplies');
        console.log('• Natural language queries!');
    }
}

main().catch(console.error);