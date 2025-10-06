const fetch = require('node-fetch');

async function testWhatsAppBot() {
    console.log('🧪 Testing WhatsApp Bot Setup...\n');
    
    // Test 1: Local server health
    try {
        console.log('📍 Testing local server...');
        const localResponse = await fetch('http://localhost:3000/health');
        if (localResponse.ok) {
            const data = await localResponse.json();
            console.log('✅ Local server is healthy:', data.status);
        } else {
            console.log('❌ Local server error:', localResponse.status);
        }
    } catch (error) {
        console.log('❌ Local server connection failed:', error.message);
    }
    
    // Test 2: Ngrok tunnel
    try {
        console.log('\n🌐 Testing ngrok tunnel...');
        const ngrokResponse = await fetch('https://3826edf5cead.ngrok-free.app/test');
        if (ngrokResponse.ok) {
            const data = await ngrokResponse.json();
            console.log('✅ Ngrok tunnel is working');
            console.log('📊 Response:', data);
        } else {
            console.log('❌ Ngrok tunnel error:', ngrokResponse.status);
        }
    } catch (error) {
        console.log('❌ Ngrok tunnel connection failed:', error.message);
    }
    
    // Test 3: WhatsApp webhook simulation
    try {
        console.log('\n📱 Testing WhatsApp webhook...');
        const webhookData = new URLSearchParams({
            Body: 'broom',
            From: 'whatsapp:+1234567890',
            To: 'whatsapp:+0987654321',
            MessageSid: 'test123',
            ProfileName: 'Test User'
        });
        
        const webhookResponse = await fetch('http://localhost:3000/whatsapp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: webhookData
        });
        
        if (webhookResponse.ok) {
            const result = await webhookResponse.text();
            console.log('✅ Webhook test successful');
            console.log('📤 Bot responded with TwiML');
        } else {
            console.log('❌ Webhook test failed:', webhookResponse.status);
        }
    } catch (error) {
        console.log('❌ Webhook test error:', error.message);
    }
    
    console.log('\n📋 Summary:');
    console.log('🔗 Local Server: http://localhost:3000');
    console.log('🌐 Ngrok URL: https://3826edf5cead.ngrok-free.app');
    console.log('📱 Webhook URL for Twilio: https://3826edf5cead.ngrok-free.app/whatsapp');
    console.log('\n💡 Configure this webhook URL in your Twilio WhatsApp sandbox settings.');
}

testWhatsAppBot();