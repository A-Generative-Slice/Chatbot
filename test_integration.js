const fetch = require('node-fetch');

async function testRAGIntegration() {
    console.log('🧪 Testing RAG Bot Integration...\n');
    
    const testQueries = [
        "show me broom",
        "fabric conditioner recipe", 
        "cleaning products",
        "DIY kits",
        "floor cleaner"
    ];
    
    for (const query of testQueries) {
        try {
            console.log(`🔍 Testing: "${query}"`);
            
            const response = await fetch('http://localhost:5001/rag-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Success: ${data.response.substring(0, 100)}...`);
            } else {
                console.log(`❌ Error: ${response.status}`);
            }
            
        } catch (error) {
            console.log(`❌ Connection error: ${error.message}`);
        }
        
        console.log('---\n');
    }
    
    // Test WhatsApp webhook simulation
    console.log('📱 Testing WhatsApp webhook simulation...\n');
    
    try {
        const webhookData = {
            Body: "show me broom",
            From: "whatsapp:+1234567890",
            To: "whatsapp:+0987654321",
            MessageSid: "test123",
            ProfileName: "Test User"
        };
        
        const response = await fetch('http://localhost:3000/whatsapp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(webhookData)
        });
        
        if (response.ok) {
            const result = await response.text();
            console.log('✅ Webhook test successful');
            console.log('📤 Response:', result.substring(0, 200) + '...');
        } else {
            console.log(`❌ Webhook test failed: ${response.status}`);
        }
        
    } catch (error) {
        console.log(`❌ Webhook test error: ${error.message}`);
    }
}

testRAGIntegration();