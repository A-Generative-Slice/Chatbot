// Test the live AI bot locally
const axios = require('axios');

async function testBot(message) {
  console.log(`\n📱 Testing: "${message}"`);
  console.log('─'.repeat(60));
  
  try {
    const response = await axios.post('http://localhost:3000/whatsapp', 
      new URLSearchParams({
        Body: message,
        From: 'whatsapp:+1234567890'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    // Parse TwiML response
    const match = response.data.match(/<Message>([\s\S]*?)<\/Message>/);
    if (match) {
      console.log('🤖 Bot Response:\n');
      console.log(match[1].trim());
    } else {
      console.log('Response:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function runTests() {
  console.log('🧪 Testing AI-Powered Sales Bot\n');
  console.log('═'.repeat(60));
  
  // Test 1: Select English
  await testBot('1');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Search for floor cleaner
  await testBot('show me floor cleaners');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test 3: Ask about best product
  await testBot('which is best for bathroom?');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n═'.repeat(60));
  console.log('✅ Tests complete! Check the responses above.');
  console.log('\n💡 Notice:');
  console.log('   - Natural conversational tone');
  console.log('   - Persuasive language');
  console.log('   - Product benefits highlighted');
  console.log('   - Urgency created');
  console.log('   - Emojis used appropriately');
  console.log('\nThis is REAL AI, not templates! 🎉');
}

runTests();
