const fetch = require('node-fetch');

async function testBot() {
    console.log('🧪 Testing WhatsApp Bot with Built-in Search...\n');
    
    const testCases = [
        {
            Body: "2", // Select English
            From: "whatsapp:+1234567890",
            To: "whatsapp:+0987654321",
            MessageSid: "test1",
            ProfileName: "Test User"
        },
        {
            Body: "1", // Select English  
            From: "whatsapp:+1234567890",
            To: "whatsapp:+0987654321",
            MessageSid: "test2",
            ProfileName: "Test User"
        },
        {
            Body: "show me broom",
            From: "whatsapp:+1234567890", 
            To: "whatsapp:+0987654321",
            MessageSid: "test3",
            ProfileName: "Test User"
        }
    ];
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`📱 Test ${i + 1}: "${testCase.Body}"`);
        
        try {
            const response = await fetch('http://localhost:3000/whatsapp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(testCase)
            });
            
            if (response.ok) {
                const result = await response.text();
                console.log('✅ Success');
                console.log('Response preview:', result.substring(0, 150) + '...\n');
            } else {
                console.log(`❌ Error: ${response.status}\n`);
            }
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}\n`);
        }
        
        // Wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

testBot();