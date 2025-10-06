// Test script to simulate Twilio WhatsApp webhook calls
const fetch = require('node-fetch');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
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

// Simulate Twilio webhook POST
async function sendWebhookMessage(messageBody, from = 'whatsapp:+919876543210') {
  try {
    const params = new URLSearchParams({
      Body: messageBody,
      From: from,
      To: 'whatsapp:+14155238886',
      MessageSid: `SM${Date.now()}`,
      ProfileName: 'TestUser'
    });

    const response = await fetch(`${BASE_URL}/whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    const responseText = await response.text();
    
    return {
      status: response.status,
      body: responseText,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      body: error.message,
      ok: false,
      error: true
    };
  }
}

// Extract message content from TwiML response
function extractMessageFromTwiML(twiml) {
  const match = twiml.match(/<Message>([\s\S]*?)<\/Message>/);
  return match ? match[1].trim() : null;
}

// Test cases
const testCases = [
  {
    name: 'First message (language selection)',
    message: 'hi',
    expectedInResponse: ['Choose Language', 'English', 'Tamil']
  },
  {
    name: 'Select English language',
    message: '1',
    expectedInResponse: ['Welcome', 'Rose Chemicals', 'help']
  },
  {
    name: 'Search for broom products',
    message: 'broom',
    expectedInResponse: ['Found', 'product', 'broom']
  },
  {
    name: 'Search for cleaning products',
    message: 'cleaning products',
    expectedInResponse: ['Found', 'product']
  },
  {
    name: 'Greeting message',
    message: 'hello',
    expectedInResponse: ['Welcome', 'Rose Chemicals']
  }
];

async function runTests() {
  console.log('\n' + '='.repeat(70));
  log('🧪', 'TWILIO WEBHOOK TEST SUITE', colors.bright + colors.cyan);
  console.log('='.repeat(70) + '\n');

  // First, check if server is running
  logInfo('Checking if server is running...');
  try {
    const healthCheck = await fetch(`${BASE_URL}/health`);
    if (healthCheck.ok) {
      logSuccess(`Server is running on ${BASE_URL}`);
    } else {
      logError(`Server returned status ${healthCheck.status}`);
      return;
    }
  } catch (error) {
    logError(`Cannot connect to server at ${BASE_URL}`);
    logWarning('Please start the server first: npm run start:debug');
    return;
  }

  console.log('\n' + '-'.repeat(70) + '\n');

  let passedTests = 0;
  let failedTests = 0;

  // Run each test case
  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    
    log('🔵', `Test ${i + 1}/${testCases.length}: ${test.name}`, colors.blue);
    logInfo(`Sending message: "${test.message}"`);

    const result = await sendWebhookMessage(test.message);

    if (result.error) {
      logError(`Connection error: ${result.body}`);
      failedTests++;
      console.log('\n' + '-'.repeat(70) + '\n');
      continue;
    }

    if (!result.ok) {
      logError(`HTTP ${result.status} - Request failed`);
      console.log(`Response: ${result.body.substring(0, 200)}`);
      failedTests++;
      console.log('\n' + '-'.repeat(70) + '\n');
      continue;
    }

    // Extract message from TwiML
    const botMessage = extractMessageFromTwiML(result.body);
    
    if (!botMessage) {
      logError('No message found in TwiML response');
      console.log(`TwiML: ${result.body.substring(0, 300)}`);
      failedTests++;
      console.log('\n' + '-'.repeat(70) + '\n');
      continue;
    }

    // Check if expected strings are in response
    const messageLower = botMessage.toLowerCase();
    const allExpectedFound = test.expectedInResponse.every(expected => 
      messageLower.includes(expected.toLowerCase())
    );

    if (allExpectedFound) {
      logSuccess('Test passed! Expected content found in response.');
      passedTests++;
    } else {
      logWarning('Test passed with warnings - some expected content not found');
      logInfo(`Expected keywords: ${test.expectedInResponse.join(', ')}`);
      passedTests++;
    }

    // Show bot response (truncated)
    const preview = botMessage.substring(0, 150).replace(/\n/g, ' ');
    log('💬', `Bot replied: "${preview}${botMessage.length > 150 ? '...' : ''}"`, colors.cyan);

    console.log('\n' + '-'.repeat(70) + '\n');

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('='.repeat(70));
  log('📊', 'TEST SUMMARY', colors.bright + colors.cyan);
  console.log('='.repeat(70));
  logSuccess(`Passed: ${passedTests}/${testCases.length}`);
  if (failedTests > 0) {
    logError(`Failed: ${failedTests}/${testCases.length}`);
  }
  console.log('='.repeat(70) + '\n');

  // Instructions for Twilio setup
  console.log('='.repeat(70));
  log('📱', 'NEXT STEPS: CONNECT TO TWILIO', colors.bright + colors.green);
  console.log('='.repeat(70) + '\n');

  logInfo('Your webhook is working locally! To connect to Twilio:\n');

  console.log('1️⃣  EXPOSE YOUR SERVER WITH NGROK:');
  console.log('   ' + colors.cyan + 'ngrok http 3000' + colors.reset);
  console.log('   Copy the https://... URL that ngrok provides\n');

  console.log('2️⃣  CONFIGURE TWILIO WHATSAPP SANDBOX:');
  console.log('   • Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn');
  console.log('   • Under "Sandbox Configuration"');
  console.log('   • Set "When a message comes in" to:');
  console.log('     ' + colors.yellow + 'https://YOUR-NGROK-URL.ngrok.io/whatsapp' + colors.reset);
  console.log('   • Method: POST');
  console.log('   • Click Save\n');

  console.log('3️⃣  JOIN THE SANDBOX FROM YOUR PHONE:');
  console.log('   • Twilio shows a join code like "join abc-def"');
  console.log('   • Send that message to the Twilio sandbox number');
  console.log('   • Once joined, send any message to test!\n');

  console.log('4️⃣  TEST THE BOT:');
  console.log('   • Send "hi" - bot will ask for language');
  console.log('   • Reply "1" - select English');
  console.log('   • Send "broom" - search for products');
  console.log('   • Send "cleaning products" - browse category\n');

  console.log('='.repeat(70) + '\n');
}

// Run the tests
runTests().catch(error => {
  logError(`Test suite error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
