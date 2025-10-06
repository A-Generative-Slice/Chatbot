const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const twilioLib = require('twilio');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Load product data
let productsData = {};
let knowledgeData = {};

try {
  productsData = JSON.parse(fs.readFileSync('products.json', 'utf8'));
  console.log('✅ Loaded products.json');
} catch (error) {
  console.log('❌ Error loading products.json:', error.message);
}

try {
  knowledgeData = JSON.parse(fs.readFileSync('products_knowledge_enhanced.json', 'utf8'));
  console.log('✅ Loaded products_knowledge_enhanced.json');
} catch (error) {
  console.log('❌ Error loading products_knowledge_enhanced.json:', error.message);
}

// Simple search function
function searchProducts(query, maxResults = 5) {
  const queryLower = query.toLowerCase();
  const results = [];
  
  const categories = productsData.categories || {};
  
  for (const [categoryKey, categoryData] of Object.entries(categories)) {
    const categoryName = categoryData.name || categoryKey;
    
    for (const product of categoryData.products || []) {
      let score = 0;
      const productName = (product.name || '').toLowerCase();
      
      // Simple keyword matching
      for (const keyword of queryLower.split()) {
        if (productName.includes(keyword)) {
          score += 1;
        }
      }
      
      // Boost for exact matches
      if (productName.includes(queryLower)) {
        score += 2;
      }
      
      // Special boosts for common terms
      if (queryLower.includes('broom') && productName.includes('broom')) {
        score += 3;
      }
      if (queryLower.includes('brush') && productName.includes('brush')) {
        score += 3;
      }
      if (queryLower.includes('clean') && (productName.includes('clean') || categoryName.toLowerCase().includes('clean'))) {
        score += 2;
      }
      if (queryLower.includes('fabric') && productName.includes('fabric')) {
        score += 3;
      }
      if (queryLower.includes('floor') && (productName.includes('floor') || productName.includes('mop'))) {
        score += 3;
      }
      if (queryLower.includes('detergent') && productName.includes('detergent')) {
        score += 3;
      }
      if (queryLower.includes('dish') && productName.includes('dish')) {
        score += 3;
      }
      if (queryLower.includes('phenyl') && productName.includes('phenyl')) {
        score += 3;
      }
      
      if (score > 0) {
        const enhancedProduct = { ...product, category: categoryName };
        results.push({ product: enhancedProduct, score });
      }
    }
  }
  
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults);
}

function formatProductResponse(results) {
  if (!results || results.length === 0) {
    return `❌ No products found.

🛍️ **Try searching for:**
• broom or brush
• cleaner  
• fabric conditioner
• floor cleaner
• detergent
• phenyl

📞 Contact us for more products!`;
  }
  
  let response = `🛍️ **Found ${results.length} product${results.length > 1 ? 's' : ''}:**\n\n`;
  
  for (let i = 0; i < results.length; i++) {
    const product = results[i].product;
    response += `**${i + 1}. ${product.name || 'Unknown'}**\n`;
    response += `💰 ₹${product.mrp || product.price || 'N/A'}\n`;
    response += `📦 ${product.category || 'N/A'}\n`;
    if (product.id) response += `🆔 ID: ${product.id}\n`;
    response += '\n';
  }
  
  return response;
}

// Process query locally
async function processQuery(userQuery) {
  try {
    console.log(`🧠 Processing query: "${userQuery}"`);
    
    // Search products
    const productResults = searchProducts(userQuery);
    console.log(`🔍 Found ${productResults.length} product matches`);
    
    // Format response
    const response = formatProductResponse(productResults);
    
    console.log(`✅ Generated response: ${response.length} characters`);
    return response;
    
  } catch (error) {
    console.error('❌ Query processing error:', error);
    return 'Sorry, I encountered an error processing your request. Please try again.';
  }
}

// User session storage
const userSessions = new Map();

// Language translations for basic responses
const translations = {
  en: {
    greeting: "Hello! 👋 Welcome to Rose Chemicals!\n\n🛍️ I'm your AI assistant. I can help you with:\n\n✨ **Product Information**\n• Find products and prices\n• DIY kit recipes and instructions\n• Product recommendations\n\n💬 Just ask me anything about our products!",
    languageMenu: "🌐 *Choose Language:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ తెలుగు (Telugu)\n4️⃣ ಕನ್ನಡ (Kannada)\n5️⃣ മലയാളം (Malayalam)\n6️⃣ हिंदी (Hindi)\n\nReply with number (1-6)",
    welcome: "🛍️ *Welcome to Rose Chemicals!*\n\nPlease select your preferred language:",
    errorMessage: "Sorry, I encountered an error. Please try again or contact our support team."
  }
};

function getUserSession(phoneNumber) {
  if (!userSessions.has(phoneNumber)) {
    userSessions.set(phoneNumber, {
      language: null,
      isFirstMessage: true,
      lastActivity: new Date()
    });
  }
  return userSessions.get(phoneNumber);
}

function updateUserSession(phoneNumber, updates) {
  const session = getUserSession(phoneNumber);
  Object.assign(session, updates, { lastActivity: new Date() });
  userSessions.set(phoneNumber, session);
}

function detectLanguageFromNumber(input) {
  const num = parseInt(input.trim());
  const languageMap = {
    1: 'en',    // English
    2: 'ta',    // Tamil  
    3: 'te',    // Telugu
    4: 'kn',    // Kannada
    5: 'ml',    // Malayalam
    6: 'hi'     // Hindi
  };
  return languageMap[num] || null;
}

function getTranslation(language, key, replacements = {}) {
  const translation = translations[language]?.[key] || translations.en[key] || key;
  
  // Replace placeholders
  let result = translation;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{${placeholder}}`, 'g'), value);
  }
  
  return result;
}

// Enhanced intent detection
function detectIntent(message) {
  const msg = message.toLowerCase().trim();
  
  // Greeting keywords
  const greetingKeywords = ['hi', 'hello', 'hey', 'hii', 'namaste', 'vanakkam'];
  
  // Check for greetings
  if (greetingKeywords.some(keyword => msg.includes(keyword))) {
    return { intent: 'greeting', entity: null };
  }
  
  // Language selection
  if (/^[1-6]$/.test(msg)) {
    return { intent: 'language_selection', entity: msg };
  }
  
  // Everything else goes to product search
  return { intent: 'product_search', entity: msg };
}

// Logging middleware
app.use((req, res, next) => {
  console.log(`\n📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Optional Twilio request validation
// Enable by setting TWILIO_AUTH_TOKEN in your environment.
// This will verify incoming webhook requests using Twilio's signature header.
if (process.env.TWILIO_AUTH_TOKEN) {
  app.use((req, res, next) => {
    try {
      const signature = req.headers['x-twilio-signature'];
      // If there's no signature header, skip validation (useful for local tests)
      if (!signature) return next();

      // Build full URL used by Twilio when signing the request.
      // If you expose via ngrok or similar, set PUBLIC_URL to the external URL (https://...).
      const publicUrl = process.env.PUBLIC_URL || (`http://${req.headers.host}`);
      const url = publicUrl + req.originalUrl;

      const isValid = twilioLib.validateRequest(process.env.TWILIO_AUTH_TOKEN, signature, url, req.body || {});
      if (!isValid) {
        console.warn('⚠️ Invalid Twilio signature for incoming request:', url);
        return res.status(403).send('Forbidden');
      }
    } catch (err) {
      console.warn('⚠️ Twilio signature validation failed:', err && err.message);
      return res.status(403).send('Forbidden');
    }

    next();
  });
}

// Health check
app.get('/health', (req, res) => {
  console.log('🩺 Health check requested');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'WhatsApp Bot with Built-in Search'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  console.log('🧪 Test endpoint requested');
  res.json({
    message: 'WhatsApp Bot is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: '/whatsapp',
      health: '/health'
    }
  });
});

// Main WhatsApp webhook
app.post('/whatsapp', async (req, res) => {
  try {
    console.log('\n🔵 WEBHOOK CALLED!');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      Body: messageBody,
      From: senderNumber,
      To: recipientNumber,
      MessageSid: messageId,
      ProfileName: senderName
    } = req.body;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 From: ${senderNumber} (${senderName || 'Unknown'})`);
    console.log(`📱 Message: "${messageBody}"`);
    console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!messageBody || messageBody.trim() === '') {
      const twiml = new MessagingResponse();
      twiml.message('I received your message, but it appears to be empty. Please send a text message to get started! 😊');
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      return res.end(twiml.toString());
    }

    const session = getUserSession(senderNumber);
    const twiml = new MessagingResponse();
    const incomingMessage = messageBody.toLowerCase().trim();
    let responseMessage = '';

    console.log(`🔄 Processing message: "${incomingMessage}"`);
    console.log(`👤 User session: Language=${session.language}, First=${session.isFirstMessage}`);

    // First time user - show language selection
    if (session.isFirstMessage) {
      responseMessage = getTranslation('en', 'welcome') + '\n\n' + getTranslation('en', 'languageMenu');
      updateUserSession(senderNumber, { isFirstMessage: false });
    }
    // Language selection
    else if (!session.language) {
      const selectedLang = detectLanguageFromNumber(incomingMessage);
      if (selectedLang) {
        updateUserSession(senderNumber, { language: selectedLang });
        responseMessage = getTranslation(selectedLang, 'greeting');
      } else {
        responseMessage = getTranslation('en', 'languageMenu') + '\n\n⚠️ Please select a valid number (1-6)';
      }
    }
    // Handle regular queries
    else {
      const { intent, entity } = detectIntent(incomingMessage);
      console.log(`🧠 Detected intent: "${intent}", entity: "${entity}"`);
      
      switch (intent) {
        case 'greeting':
          responseMessage = getTranslation(session.language, 'greeting');
          break;
          
        case 'language_selection':
          const selectedLang = detectLanguageFromNumber(entity);
          if (selectedLang) {
            updateUserSession(senderNumber, { language: selectedLang });
            responseMessage = getTranslation(selectedLang, 'greeting');
          } else {
            responseMessage = getTranslation(session.language, 'languageMenu');
          }
          break;
          
        case 'product_search':
          // Process query with product search
          responseMessage = await processQuery(entity);
          break;
          
        default:
          responseMessage = getTranslation(session.language, 'greeting');
          break;
      }
    }

    // Always ensure we have a response
    if (!responseMessage || responseMessage.trim() === '') {
      responseMessage = getTranslation(session.language || 'en', 'errorMessage');
    }

    console.log(`📤 Sending response: ${responseMessage.substring(0, 100)}...`);
    
    twiml.message(responseMessage);
    
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());

  } catch (error) {
    console.error('❌ Webhook error:', error);
    const twiml = new MessagingResponse();
    twiml.message('Sorry, I encountered an error. Please try again.');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 WhatsApp Bot with Built-in Search Starting...');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`📱 Webhook endpoint: http://localhost:${PORT}/whatsapp`);
  console.log('🧠 Using built-in product search with enhanced logging');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎯 Ready to receive WhatsApp messages!');
  console.log('📞 Configure Twilio webhook URL: https://6663dee035a0.ngrok-free.app/whatsapp');
  console.log('═══════════════════════════════════════════════════════════════');
});