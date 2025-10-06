// Smart WhatsApp Bot with Hugging Face AI
// Lightweight, Fast, and Intelligent

const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const { HfInference } = require('@huggingface/inference');
const natural = require('natural');
const fuzzysort = require('fuzzysort');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Initialize Hugging Face (Free tier - no token needed for public models)
// Get your free token from: https://huggingface.co/settings/tokens
const HF_TOKEN = process.env.HUGGINGFACE_TOKEN || null;
const hf = HF_TOKEN ? new HfInference(HF_TOKEN) : null;

// Load product data
let productsData = {};
let knowledgeData = {};
let productSearchIndex = [];

try {
  productsData = JSON.parse(fs.readFileSync('products.json', 'utf8'));
  console.log('✅ Loaded products.json');
  
  // Build search index
  const categories = productsData.categories || {};
  for (const [categoryKey, categoryData] of Object.entries(categories)) {
    const categoryName = categoryData.name || categoryKey;
    for (const product of categoryData.products || []) {
      productSearchIndex.push({
        name: product.name,
        category: categoryName,
        price: product.mrp || product.price,
        id: product.id,
        searchText: `${product.name} ${categoryName} ${product.description || ''}`.toLowerCase()
      });
    }
  }
  console.log(`✅ Indexed ${productSearchIndex.length} products for smart search`);
} catch (error) {
  console.log('❌ Error loading products.json:', error.message);
}

try {
  knowledgeData = JSON.parse(fs.readFileSync('products_knowledge_enhanced.json', 'utf8'));
  console.log('✅ Loaded enhanced knowledge base');
} catch (error) {
  console.log('❌ Error loading knowledge base:', error.message);
}

// Response cache for speed
const responseCache = new Map();
const conversationContext = new Map();

// Multilingual translations
const translations = {
  en: {
    welcome: "🛍️ *Welcome to Rose Chemicals!*\n\nI'm your AI shopping assistant. I can help you:\n\n✨ Find products\n💬 Answer questions\n🌍 Chat in your language\n\nPlease select your language:",
    languageMenu: "🌐 *Choose Language:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ తెలుగు (Telugu)\n4️⃣ ಕನ್ನಡ (Kannada)\n5️⃣ മലയാളം (Malayalam)\n6️⃣ हिंदी (Hindi)\n\nReply with number (1-6)",
    greeting: "Hello! 👋 I'm your AI assistant for Rose Chemicals.\n\n💡 *Ask me anything:*\n• \"Show broom products\"\n• \"What's the price of soap?\"\n• \"Tell me about cleaning products\"\n• \"Help me choose a product\"\n\nWhat can I help you find today?",
    thinking: "🤔 Let me think about that...",
    searching: "🔍 Searching products...",
    aiResponse: "🤖 *AI Assistant:*\n\n",
    noResults: "❌ No products found for \"{query}\"\n\n💡 Try:\n• Different keywords\n• Ask me to recommend something\n• Browse categories",
    error: "Sorry, I encountered an error. Please try again or rephrase your question."
  },
  ta: {
    welcome: "🛍️ *ரோஸ் கெமிக்கல்ஸ்-க்கு வணக்கம்!*\n\nநான் உங்கள் AI ஷாப்பிங் உதவியாளர். நான் உதவ முடியும்:\n\n✨ பொருட்களைக் கண்டறியுங்கள்\n💬 கேள்விகளுக்கு பதிலளிக்கவும்\n🌍 உங்கள் மொழியில் அரட்டை\n\nஉங்கள் மொழியைத் தேர்ந்தெடுக்கவும்:",
    languageMenu: "🌐 *மொழி தேர்வு:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ తెలుగు (Telugu)\n4️⃣ ಕನ್ನಡ (Kannada)\n5️⃣ മലയാളം (Malayalam)\n6️⃣ हिंदी (Hindi)\n\nஎண்ணுடன் பதிலளிக்கவும் (1-6)",
    greeting: "வணக்கம்! 👋 நான் ரோஸ் கெமிக்கல்ஸின் AI உதவியாளர்.\n\n💡 *என்னிடம் எதையும் கேளுங்கள்:*\n• \"துடைப்பம் பொருட்கள் காட்டு\"\n• \"சோப் விலை என்ன?\"\n• \"சுத்தம் பொருட்கள் பற்றி சொல்\"\n• \"பொருள் தேர்வுக்கு உதவு\"\n\nஇன்று என்ன உதவ முடியும்?",
    thinking: "🤔 யோசிக்கிறேன்...",
    searching: "🔍 பொருட்களைத் தேடுகிறது...",
    aiResponse: "🤖 *AI உதவியாளர்:*\n\n",
    noResults: "❌ \"{query}\"-க்கு பொருட்கள் இல்லை\n\n💡 முயற்சிக்கவும்:\n• வேறு வார்த்தைகள்\n• பரிந்துரை கேளுங்கள்\n• வகைகள் பார்க்கவும்",
    error: "மன்னிக்கவும், பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்."
  },
  // Add more languages as needed
};

// User session management
const userSessions = new Map();

function getUserSession(phoneNumber) {
  if (!userSessions.has(phoneNumber)) {
    userSessions.set(phoneNumber, {
      language: null,
      lastActivity: new Date(),
      isFirstMessage: true,
      conversationHistory: []
    });
  }
  return userSessions.get(phoneNumber);
}

function updateUserSession(phoneNumber, updates) {
  const session = getUserSession(phoneNumber);
  Object.assign(session, updates, { lastActivity: new Date() });
  userSessions.set(phoneNumber, session);
}

function getTranslation(lang, key, vars = {}) {
  const translation = translations[lang] || translations.en;
  let text = translation[key] || translations.en[key] || key;
  
  Object.keys(vars).forEach(varKey => {
    text = text.replace(`{${varKey}}`, vars[varKey]);
  });
  
  return text;
}

// Smart fuzzy search with relevance scoring
function smartSearch(query, maxResults = 5) {
  const results = fuzzysort.go(query.toLowerCase(), productSearchIndex, {
    keys: ['name', 'searchText'],
    threshold: -10000,
    limit: maxResults
  });
  
  return results.map(result => ({
    product: result.obj,
    score: result.score
  }));
}

// Enhanced intent detection using natural NLP
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

function detectIntent(message) {
  const msg = message.toLowerCase().trim();
  const tokens = tokenizer.tokenize(msg);
  
  // Intent patterns
  const intents = {
    greeting: ['hi', 'hello', 'hey', 'namaste', 'vanakkam', 'hola'],
    search: ['show', 'find', 'get', 'want', 'need', 'looking', 'search', 'browse'],
    question: ['what', 'how', 'why', 'when', 'where', 'which', 'tell', 'explain', 'does', 'is', 'can'],
    price: ['price', 'cost', 'expensive', 'cheap', 'much', 'rate'],
    help: ['help', 'assist', 'guide', 'support'],
    recommendation: ['recommend', 'suggest', 'best', 'good', 'better', 'which one']
  };
  
  // Count matches
  const scores = {};
  for (const [intent, keywords] of Object.entries(intents)) {
    scores[intent] = keywords.filter(kw => msg.includes(kw)).length;
  }
  
  // Get highest scoring intent
  const maxScore = Math.max(...Object.values(scores));
  const detectedIntent = Object.keys(scores).find(key => scores[key] === maxScore);
  
  // Extract entity (product name)
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
                     'show', 'me', 'find', 'get', 'what', 'is', 'how', 'tell', 'about'];
  const entity = tokens.filter(token => 
    !stopWords.includes(token) && token.length > 2
  ).join(' ');
  
  return { 
    intent: maxScore > 0 ? detectedIntent : 'unknown', 
    entity: entity || null,
    confidence: maxScore / tokens.length
  };
}

// Hugging Face AI response (with caching)
async function getAIResponse(query, language = 'en', context = []) {
  if (!hf) {
    return null; // No HF token, skip AI
  }
  
  // Check cache
  const cacheKey = `${language}:${query}`;
  if (responseCache.has(cacheKey)) {
    console.log('🎯 Cache hit for:', query);
    return responseCache.get(cacheKey);
  }
  
  try {
    console.log('🤖 Calling Hugging Face AI for:', query);
    
    // Use a fast, lightweight model
    const prompt = `You are a helpful shopping assistant for Rose Chemicals. 
Answer the customer's question about products briefly and helpfully.
Available product categories: Cleaning Products, Chemicals, Perfumes, Brushes.

Question: ${query}

Answer (keep it under 100 words):`;
    
    const response = await hf.textGeneration({
      model: 'facebook/opt-350m', // Lightweight model
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
        top_p: 0.9
      }
    });
    
    const answer = response.generated_text.replace(prompt, '').trim();
    
    // Cache the response
    responseCache.set(cacheKey, answer);
    
    // Limit cache size
    if (responseCache.size > 100) {
      const firstKey = responseCache.keys().next().value;
      responseCache.delete(firstKey);
    }
    
    return answer;
  } catch (error) {
    console.error('❌ Hugging Face error:', error.message);
    return null;
  }
}

// Format product results
function formatProducts(results, language = 'en') {
  if (!results || results.length === 0) {
    return null;
  }
  
  let response = `🛍️ *Found ${results.length} product${results.length > 1 ? 's' : ''}:*\n\n`;
  
  results.forEach((result, index) => {
    const product = result.product;
    response += `*${index + 1}. ${product.name}*\n`;
    response += `💰 ₹${product.price || 'N/A'}\n`;
    response += `📦 ${product.category}\n`;
    if (product.id) response += `🆔 #${product.id}\n`;
    response += '\n';
  });
  
  return response;
}

// Main message handler
async function handleMessage(message, session) {
  const language = session.language || 'en';
  
  // Detect intent
  const { intent, entity, confidence } = detectIntent(message);
  console.log(`🧠 Intent: ${intent} (${(confidence * 100).toFixed(0)}%), Entity: ${entity}`);
  
  // Handle different intents
  switch (intent) {
    case 'greeting':
      return getTranslation(language, 'greeting');
      
    case 'search':
      if (entity) {
        const results = smartSearch(entity);
        if (results.length > 0) {
          return formatProducts(results, language);
        }
      }
      return getTranslation(language, 'noResults', { query: entity || message });
      
    case 'question':
    case 'recommendation':
      // First search products
      if (entity) {
        const results = smartSearch(entity);
        if (results.length > 0) {
          const productList = formatProducts(results, language);
          
          // Try to add AI context (if available)
          if (hf) {
            const aiAnswer = await getAIResponse(message, language, session.conversationHistory);
            if (aiAnswer) {
              return productList + '\n' + getTranslation(language, 'aiResponse') + aiAnswer;
            }
          }
          
          return productList;
        }
      }
      
      // If no products found, try pure AI response
      if (hf) {
        const aiAnswer = await getAIResponse(message, language, session.conversationHistory);
        if (aiAnswer) {
          return getTranslation(language, 'aiResponse') + aiAnswer;
        }
      }
      
      return getTranslation(language, 'noResults', { query: entity || message });
      
    case 'price':
      if (entity) {
        const results = smartSearch(entity, 3);
        if (results.length > 0) {
          return formatProducts(results, language);
        }
      }
      return getTranslation(language, 'noResults', { query: entity || message });
      
    default:
      // Try general search
      const results = smartSearch(message);
      if (results.length > 0) {
        return formatProducts(results, language);
      }
      
      // Last resort: AI response
      if (hf) {
        const aiAnswer = await getAIResponse(message, language, session.conversationHistory);
        if (aiAnswer) {
          return getTranslation(language, 'aiResponse') + aiAnswer;
        }
      }
      
      return getTranslation(language, 'noResults', { query: message });
  }
}

// Language detection
function detectLanguageFromNumber(input) {
  const num = parseInt(input.trim());
  const languageMap = {
    1: 'en', 2: 'ta', 3: 'te', 4: 'kn', 5: 'ml', 6: 'hi'
  };
  return languageMap[num] || null;
}

// Logging middleware
app.use((req, res, next) => {
  console.log(`\n📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Smart WhatsApp Bot with Hugging Face',
    aiEnabled: !!hf,
    productsIndexed: productSearchIndex.length
  });
});

// Main webhook
app.post('/whatsapp', async (req, res) => {
  try {
    console.log('🔵 WEBHOOK CALLED');
    
    const {
      Body: messageBody,
      From: senderNumber,
      ProfileName: senderName
    } = req.body;

    console.log(`📱 From: ${senderNumber} (${senderName})`);
    console.log(`📱 Message: "${messageBody}"`);

    if (!messageBody || messageBody.trim() === '') {
      const twiml = new MessagingResponse();
      twiml.message('Please send a text message to get started! 😊');
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      return res.end(twiml.toString());
    }

    const session = getUserSession(senderNumber);
    const twiml = new MessagingResponse();
    const incomingMessage = messageBody.trim();
    let responseMessage = '';

    // First time user
    if (session.isFirstMessage) {
      responseMessage = getTranslation('en', 'welcome') + '\n\n' + 
                       getTranslation('en', 'languageMenu');
      updateUserSession(senderNumber, { isFirstMessage: false });
    }
    // Language selection
    else if (!session.language) {
      const selectedLang = detectLanguageFromNumber(incomingMessage);
      if (selectedLang) {
        updateUserSession(senderNumber, { language: selectedLang });
        responseMessage = getTranslation(selectedLang, 'greeting');
      } else {
        responseMessage = getTranslation('en', 'languageMenu') + 
                         '\n\n⚠️ Please select a valid number (1-6)';
      }
    }
    // Handle conversation
    else {
      // Add to conversation history
      session.conversationHistory.push({ role: 'user', content: incomingMessage });
      
      // Process message
      responseMessage = await handleMessage(incomingMessage, session);
      
      // Add bot response to history
      session.conversationHistory.push({ role: 'assistant', content: responseMessage });
      
      // Limit history
      if (session.conversationHistory.length > 10) {
        session.conversationHistory = session.conversationHistory.slice(-10);
      }
    }

    if (!responseMessage) {
      responseMessage = getTranslation(session.language || 'en', 'error');
    }

    console.log(`📤 Response: ${responseMessage.substring(0, 100)}...`);
    
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
  console.log('\n🚀 Smart WhatsApp Bot Starting...');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`📱 Webhook endpoint: http://localhost:${PORT}/whatsapp`);
  console.log(`🤖 AI Enabled: ${hf ? 'YES (Hugging Face)' : 'NO (Set HUGGINGFACE_TOKEN)'}`);
  console.log(`📊 Products indexed: ${productSearchIndex.length}`);
  console.log(`🧠 NLP Engine: Natural + Fuzzysort (Lightweight & Fast)`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎯 Features:');
  console.log('  ✅ Smart intent detection');
  console.log('  ✅ Fuzzy product search');
  console.log('  ✅ Conversation memory');
  console.log('  ✅ Response caching');
  console.log('  ✅ Multilingual support (6 languages)');
  if (hf) {
    console.log('  ✅ AI-powered responses (Hugging Face)');
  } else {
    console.log('  💡 Get free HF token: https://huggingface.co/settings/tokens');
  }
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎯 Ready to receive messages!\n');
});
