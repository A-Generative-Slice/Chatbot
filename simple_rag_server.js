const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()// Health check
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

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`\n📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📄 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Main WhatsApp webhook
app.post('/whatsapp', async (req, res) => {
  try {
    const {
      Body: messageBody,
      From: senderNumber,
      To: recipientNumber,
      MessageSid: messageId,
      ProfileName: senderName
    } = req.body;

    console.log('\n🔵 INCOMING WHATSAPP MESSAGE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 From: ${senderNumber} (${senderName || 'Unknown'})`);
    console.log(`📱 Message: "${messageBody}"`);
    console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');= process.env.PORT || 3000;

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

function searchKnowledge(query) {
  const queryLower = query.toLowerCase();
  const matches = [];
  
  for (const [kitName, kitData] of Object.entries(knowledgeData)) {
    if (typeof kitData === 'object' && kitData !== null) {
      let score = 0;
      
      // Check kit name
      if (kitName.toLowerCase().includes(queryLower)) {
        score += 2;
      }
      
      // Check for recipe-related terms
      if (queryLower.includes('recipe') || queryLower.includes('make') || queryLower.includes('how')) {
        score += 1;
      }
      
      if (score > 0) {
        matches.push({ kit: kitName, data: kitData, score });
      }
    }
  }
  
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 2);
}

function formatKnowledgeResponse(matches) {
  if (!matches || matches.length === 0) {
    return '';
  }
  
  let response = '\n🧪 **DIY Kit Information:**\n\n';
  
  for (const match of matches) {
    const kitData = match.data;
    const kitName = match.kit;
    
    response += `**📋 ${kitName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}**\n`;
    
    if (kitData.price) {
      response += `💰 Price: ${kitData.price}\n`;
    }
    
    if (kitData.ingredients && Array.isArray(kitData.ingredients)) {
      response += `🧪 Ingredients: ${kitData.ingredients.slice(0, 3).join(', ')}${kitData.ingredients.length > 3 ? '...' : ''}\n`;
    }
    
    if (kitData.steps && Array.isArray(kitData.steps)) {
      response += `📝 ${kitData.steps.length} step process\n`;
    }
    
    if (kitData.business_info && kitData.business_info.profit_margin) {
      response += `💼 Profit: ${kitData.business_info.profit_margin}\n`;
    }
    
    response += '\n';
  }
  
  return response;
}

// User session storage
const userSessions = new Map();

// Language translations for basic responses
const translations = {
  en: {
    greeting: "Hello! 👋 Welcome to Rose Chemicals!\n\n🛍️ I'm your AI assistant powered by Sarvam-M LLM. I can help you with:\n\n✨ **Product Information**\n• Find products and prices\n• DIY kit recipes and instructions\n• Product recommendations\n\n💬 Just ask me anything about our products!",
    languageMenu: "🌐 *Choose Language:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ తెలుగు (Telugu)\n4️⃣ ಕನ್ನಡ (Kannada)\n5️⃣ മലയാളം (Malayalam)\n6️⃣ हिंदी (Hindi)\n\nReply with number (1-6)",
    welcome: "🛍️ *Welcome to Rose Chemicals!*\n\nPlease select your preferred language:",
    errorMessage: "Sorry, I encountered an error. Please try again or contact our support team.",
    ragOffline: "🤖 AI assistant is currently unavailable. Please try again in a moment.\n\n💡 **You can still ask about:**\n• Product categories\n• Basic product information\n• Contact details"
  }
};

// Session management
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
  
  // Everything else goes to RAG
  return { intent: 'rag_query', entity: msg };
}

// RAG query function (now uses local search instead of external service)
async function processQuery(userQuery) {
  try {
    console.log(`� Processing query: "${userQuery}"`);
    
    // Search products
    const productResults = searchProducts(userQuery);
    
    // Search knowledge base  
    const knowledgeResults = searchKnowledge(userQuery);
    
    // Format response
    let response = '';
    
    if (productResults && productResults.length > 0) {
      response += formatProductResponse(productResults);
    }
    
    if (knowledgeResults && knowledgeResults.length > 0) {
      response += formatKnowledgeResponse(knowledgeResults);
    }
    
    if (!response || response.trim() === '') {
      response = formatProductResponse([]); // This will show the "try searching for" message
    }
    
    console.log(`✅ Generated response: ${response.length} characters`);
    return response;
    
  } catch (error) {
    console.error('❌ Query processing error:', error);
    return 'Sorry, I encountered an error processing your request. Please try again.';
  }
}

// Message logging
function logMessage(direction, from, to, body, messageId = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${direction.toUpperCase()}: ${from} -> ${to}`);
  console.log(`Message: "${body}"`);
  if (messageId) console.log(`MessageID: ${messageId}`);
  console.log('---');
}

// Main WhatsApp webhook
app.post('/whatsapp', async (req, res) => {
  try {
    const {
      Body: messageBody,
      From: senderNumber,
      To: recipientNumber,
      MessageSid: messageId,
      ProfileName: senderName
    } = req.body;

    console.log('\n🔵 INCOMING WHATSAPP MESSAGE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 From: ${senderNumber} (${senderName || 'Unknown'})`);
    console.log(`📱 Message: "${messageBody}"`);
    console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
    console.log('🔍 Raw Body:', JSON.stringify(req.body, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    logMessage('incoming', senderNumber, recipientNumber, messageBody, messageId);

    if (!messageBody || messageBody.trim() === '') {
      const twiml = new MessagingResponse();
      twiml.message('I received your message, but it appears to be empty. Please send a text message to get started! 😊');
      logMessage('outgoing', recipientNumber, senderNumber, 'Empty message response');
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
      console.log('🆕 First time user - showing language menu');
      responseMessage = getTranslation('en', 'welcome') + '\n\n' + getTranslation('en', 'languageMenu');
      updateUserSession(senderNumber, { isFirstMessage: false });
    }
    // Language selection
    else if (!session.language) {
      console.log('🌐 Processing language selection');
      const selectedLang = detectLanguageFromNumber(incomingMessage);
      if (selectedLang) {
        console.log(`✅ Language selected: ${selectedLang}`);
        updateUserSession(senderNumber, { language: selectedLang });
        responseMessage = getTranslation(selectedLang, 'greeting');
      } else {
        console.log('❌ Invalid language selection');
        responseMessage = getTranslation('en', 'languageMenu') + '\n\n⚠️ Please select a valid number (1-6)';
      }
    }
    // Handle regular queries with built-in search
    else {
      const { intent, entity } = detectIntent(incomingMessage);
      console.log(`🧠 Detected intent: "${intent}", entity: "${entity}"`);
      
      switch (intent) {
        case 'greeting':
          console.log('👋 Processing greeting');
          responseMessage = getTranslation(session.language, 'greeting');
          break;
          
        case 'language_selection':
          console.log('🔄 Processing language change');
          const selectedLang = detectLanguageFromNumber(entity);
          if (selectedLang) {
            updateUserSession(senderNumber, { language: selectedLang });
            responseMessage = getTranslation(selectedLang, 'greeting');
          } else {
            responseMessage = getTranslation(session.language, 'languageMenu');
          }
          break;
          
        case 'rag_query':
          console.log(`🔍 Processing product query: "${entity}"`);
          // Process query locally
          const response = await processQuery(entity);
          responseMessage = response;
          console.log(`📤 Generated response: ${response.length} characters`);
          break;
          
        default:
          console.log('❓ Unknown intent, showing greeting');
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
    logMessage('outgoing', recipientNumber, senderNumber, responseMessage);
    
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

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'WhatsApp Bot with Sarvam RAG'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'WhatsApp Bot with Sarvam RAG is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: '/whatsapp',
      health: '/health'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 WhatsApp Bot with Built-in Search Starting...');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`📱 Webhook endpoint: http://localhost:${PORT}/whatsapp`);
  console.log(`� Using built-in product search (no external dependencies)`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎯 Ready to receive WhatsApp messages!');
  console.log('📞 Configure Twilio webhook URL with your ngrok URL + /whatsapp');
  console.log('═══════════════════════════════════════════════════════════════');
});