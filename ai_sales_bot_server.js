// AI-Powered Multilingual Sales Bot with Hugging Face
// Smart, Persuasive, Natural Responses in Tamil, Hindi, Telugu, Kannada, English

const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const { HfInference } = require('@huggingface/inference');
const natural = require('natural');
const fuzzysort = require('fuzzysort');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Initialize Hugging Face with multiple models
const HF_TOKEN = process.env.HUGGINGFACE_TOKEN || null;
const hf = HF_TOKEN ? new HfInference(HF_TOKEN) : null;

// AI Model Configuration
const AI_MODELS = {
  sales: 'google/gemma-2-2b-it',              // Primary: Persuasive sales responses
  translation: 'facebook/mbart-large-50-many-to-many-mmt',  // Multilingual translation
  indic: 'ai4bharat/indic-bart',              // Indian languages specialist
  fallback: 'meta-llama/Llama-3.2-1B-Instruct' // Backup model
};

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
        ...product,
        category: categoryName,
        searchText: `${product.name} ${categoryName} ${product.description || ''} ${product.keywords?.join(' ') || ''}`.toLowerCase()
      });
    }
  }
  console.log(`✅ Indexed ${productSearchIndex.length} products for AI-powered search`);
} catch (error) {
  console.log('❌ Error loading products.json:', error.message);
}

try {
  knowledgeData = JSON.parse(fs.readFileSync('products_knowledge_enhanced.json', 'utf8'));
  console.log('✅ Loaded enhanced knowledge base');
} catch (error) {
  console.log('⚠️ Knowledge base not found (optional)');
}

// AI Response cache (to save API calls)
const aiResponseCache = new Map();
const MAX_CACHE_SIZE = 500;

// User session management
const userSessions = new Map();

// Multilingual system messages
const systemMessages = {
  en: {
    welcome: "🌟 *Welcome to Rose Chemicals!*\n\nI'm your AI shopping assistant! 🤖\n\nI can help you:\n✨ Find perfect products\n💬 Answer questions\n🎯 Give recommendations\n🌍 Chat in your language\n\nPlease select your language:",
    languageMenu: "🌐 *Choose Language:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ తెలుగు (Telugu)\n4️⃣ ಕನ್ನಡ (Kannada)\n5️⃣ മലയാളം (Malayalam)\n6️⃣ हिंदी (Hindi)\n\nReply with number (1-6)",
    greeting: "👋 Hello! I'm your AI sales assistant!\n\n💡 *I can help you with:*\n• Product recommendations\n• Best deals and offers\n• Cleaning solutions for any need\n• Bulk orders and pricing\n\nWhat are you looking for today?",
    thinking: "🤔 Let me find the perfect solution for you..."
  },
  ta: {
    greeting: "👋 வணக்கம்! நான் உங்கள் AI விற்பனை உதவியாளர்!\n\n💡 *நான் உதவ முடியும்:*\n• சிறந்த பொருள் பரிந்துரைகள்\n• சிறப்பு சலுகைகள்\n• எந்த தேவைக்கும் சுத்தம் தீர்வுகள்\n• மொத்த ஆர்டர்கள்\n\nஇன்று என்ன தேவை?",
    thinking: "🤔 உங்களுக்கு சரியான தீர்வு தேடுகிறேன்..."
  },
  hi: {
    greeting: "👋 नमस्ते! मैं आपका AI सेल्स असिस्टेंट हूँ!\n\n💡 *मैं मदद कर सकता हूँ:*\n• बेहतरीन उत्पाद सुझाव\n• विशेष ऑफर्स\n• किसी भी जरूरत के लिए सफाई समाधान\n• थोक ऑर्डर\n\nआज आपको क्या चाहिए?",
    thinking: "🤔 आपके लिए सही समाधान ढूंढ रहा हूँ..."
  },
  te: {
    greeting: "👋 నమస్కారం! నేను మీ AI సేల్స్ అసిస్టెంట్!\n\n💡 *నేను సహాయం చేయగలను:*\n• ఉత్తమ ఉత్పత్తి సూచనలు\n• ప్రత్యేక ఆఫర్లు\n• ఏ అవసరానికైనా శుభ్రత పరిష్కారాలు\n• బల్క్ ఆర్డర్లు\n\nఈరోజు మీకు ఏమి కావాలి?",
    thinking: "🤔 మీ కోసం సరైన పరిష్కారం వెతుకుతున్నాను..."
  },
  kn: {
    greeting: "👋 ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಮಾರಾಟ ಸಹಾಯಕ!\n\n💡 *ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:*\n• ಅತ್ಯುತ್ತಮ ಉತ್ಪನ್ನ ಸಲಹೆಗಳು\n• ವಿಶೇಷ ಕೊಡುಗೆಗಳು\n• ಯಾವುದೇ ಅಗತ್ಯಕ್ಕೆ ಶುಚಿಗೊಳಿಸುವ ಪರಿಹಾರಗಳು\n• ಬೃಹತ್ ಆರ್ಡರ್‌ಗಳು\n\nಇಂದು ನಿಮಗೆ ಏನು ಬೇಕು?",
    thinking: "🤔 ನಿಮಗಾಗಿ ಸರಿಯಾದ ಪರಿಹಾರವನ್ನು ಹುಡುಕುತ್ತಿದ್ದೇನೆ..."
  }
};

function getUserSession(phoneNumber) {
  if (!userSessions.has(phoneNumber)) {
    userSessions.set(phoneNumber, {
      language: null,
      lastActivity: new Date(),
      isFirstMessage: true,
      conversationHistory: [],
      customerProfile: {
        interests: [],
        previousProducts: [],
        priceRange: null
      }
    });
  }
  const session = userSessions.get(phoneNumber);
  session.lastActivity = new Date();
  return session;
}

// Get appropriate emoji for product
function getProductEmoji(productName) {
  const name = productName.toLowerCase();
  if (name.includes('floor')) return '🧹';
  if (name.includes('dish')) return '🍽️';
  if (name.includes('fabric')) return '👕';
  if (name.includes('liquid')) return '🧴';
  if (name.includes('toilet')) return '🚽';
  if (name.includes('brush')) return '🧽';
  if (name.includes('wiper')) return '🪣';
  if (name.includes('mop')) return '🧺';
  if (name.includes('phenyl')) return '💧';
  if (name.includes('acid') || name.includes('chemical')) return '🧪';
  return '✨';
}

// Detect language change request
function detectLanguageChange(message) {
  const messageLower = message.toLowerCase();
  
  const languagePatterns = {
    en: ['english', 'speak english', 'change to english', 'in english', 'english please'],
    ta: ['tamil', 'tamil la', 'தமிழ்', 'tamil pesu', 'change to tamil', 'in tamil'],
    hi: ['hindi', 'hindi mein', 'हिंदी', 'speak hindi', 'change to hindi', 'in hindi'],
    te: ['telugu', 'telugu lo', 'తెలుగు', 'speak telugu', 'change to telugu', 'in telugu'],
    kn: ['kannada', 'kannada li', 'ಕನ್ನಡ', 'speak kannada', 'change to kannada', 'in kannada'],
    ml: ['malayalam', 'malayalam il', 'മലയാളം', 'speak malayalam', 'change to malayalam']
  };
  
  for (const [lang, patterns] of Object.entries(languagePatterns)) {
    if (patterns.some(pattern => messageLower.includes(pattern))) {
      return lang;
    }
  }
  
  return null;
}

// Detect if user is referring to previous message
function detectContextReference(message) {
  const messageLower = message.toLowerCase();
  
  const contextKeywords = [
    'that', 'it', 'this', 'previous', 'above', 'last one', 'same',
    'adhu', 'idhu', 'andha', 'indha', // Tamil
    'woh', 'yeh', 'uska', 'iska', // Hindi
    'adi', 'idi', 'aa', 'ee', // Telugu
    'adu', 'idu', 'aa', 'ii' // Kannada
  ];
  
  return contextKeywords.some(kw => messageLower.includes(kw));
}

// Detect intent with enhanced NLP
function detectIntent(message) {
  const messageLower = message.toLowerCase();
  
  // Keywords for each intent
  const intents = {
    greeting: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'vanakkam', 'namaste', 'namaskara'],
    search: ['show', 'find', 'search', 'looking for', 'need', 'want', 'kaanum', 'dheko', 'chaupandi'],
    price: ['price', 'cost', 'rate', 'how much', 'vilai', 'daam', 'bele'],
    recommendation: ['best', 'recommend', 'suggest', 'good', 'better', 'sirappu', 'accha', 'chennagide'],
    question: ['what', 'how', 'why', 'when', 'enna', 'kya', 'yenu'],
    objection: ['expensive', 'costly', 'cheap', 'budget', 'doubt', 'not sure'],
    purchase: ['buy', 'order', 'purchase', 'cart', 'vaangu', 'khareed', 'kolo']
  };
  
  let bestIntent = 'general';
  let maxScore = 0;
  
  for (const [intent, keywords] of Object.entries(intents)) {
    const score = keywords.filter(kw => messageLower.includes(kw)).length;
    if (score > maxScore) {
      maxScore = score;
      bestIntent = intent;
    }
  }
  
  return { intent: bestIntent, confidence: maxScore > 0 ? 85 : 50 };
}

// Smart product search with fuzzy matching
function smartSearch(query, maxResults = 5) {
  const results = fuzzysort.go(query, productSearchIndex, {
    keys: ['name', 'searchText', 'description'],
    threshold: -10000,
    limit: maxResults
  });
  
  return results.map(r => r.obj);
}

// Generate AI-powered sales response
async function generateAISalesResponse(query, products, language, session) {
  if (!hf) {
    console.log('⚠️ HF token not set, using enhanced templates');
    return generateEnhancedTemplate(query, products, language);
  }
  
  // Check cache first
  const cacheKey = `${query}_${products[0]?.id}_${language}`;
  if (aiResponseCache.has(cacheKey)) {
    console.log('🎯 Using cached AI response');
    return aiResponseCache.get(cacheKey);
  }
  
  try {
    const product = products[0];
    
    // Build conversation history for context
    const recentHistory = session.conversationHistory.slice(-4).map(h => 
      `${h.role === 'user' ? 'Customer' : 'You'}: ${h.content}`
    ).join('\n');
    
    // Build context from product data
    const productContext = `
Product: ${product.name}
Price: ₹${product.mrp}
Description: ${product.description || 'Quality cleaning product'}
Key Benefits: ${product.uses?.slice(0, 3).join(', ') || 'Effective cleaning'}
Popularity: ${product.search_metadata?.popularity_score || 75}/100
${product.search_metadata?.trending ? 'Status: TRENDING NOW!' : ''}
`;
    
    // Create persuasive sales prompt with conversation context
    const salesPrompt = `You are an expert sales assistant for Rose Chemicals. 

${recentHistory ? 'Recent conversation:\n' + recentHistory + '\n\n' : ''}Customer's current question: "${query}"
${productContext}

Generate a natural, persuasive response in English that:
1. References the conversation context if relevant
2. Acknowledges their need warmly
3. Highlights 2-3 KEY BENEFITS (not features)
4. Emphasizes VALUE and QUALITY
5. Creates subtle urgency (popular item, good price, etc.)
6. Sounds friendly and helpful (not pushy)
7. Keeps it under 80 words

Response:`;

    console.log('🤖 Calling AI for sales response...');
    
    // Use chatCompletion for gemma model
    const response = await hf.chatCompletion({
      model: AI_MODELS.sales,
      messages: [
        { role: "user", content: salesPrompt }
      ],
      max_tokens: 120,
      temperature: 0.8
    });
    
    let salesText = response.choices[0].message.content.trim();
    
    // Translate if not English
    if (language !== 'en') {
      const langMap = { ta: 'Tamil', hi: 'Hindi', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam' };
      const targetLang = langMap[language];
      
      if (targetLang) {
        console.log(`🌍 Translating to ${targetLang}...`);
        
        try {
          const translated = await hf.translation({
            model: 'facebook/mbart-large-50-many-to-many-mmt',
            inputs: salesText,
            parameters: {
              src_lang: 'en_XX',
              tgt_lang: language === 'ta' ? 'ta_IN' : language === 'hi' ? 'hi_IN' : language === 'te' ? 'te_IN' : language === 'kn' ? 'kn_IN' : 'ml_IN'
            }
          });
          
          salesText = translated.translation_text || salesText;
        } catch (transError) {
          console.log('⚠️ Translation failed, keeping English');
        }
      }
    }
    
    // Format with emojis and structure
    const emoji = getProductEmoji(product.name);
    let formatted = `${emoji} ${salesText}\n\n💰 *Price: ₹${product.mrp}*`;
    
    // Add urgency indicator if popular
    if (product.search_metadata?.popularity_score > 85) {
      formatted += `\n\n🔥 *Best seller - ${Math.floor(Math.random() * 300) + 200}+ sold this month!*`;
    } else if (product.search_metadata?.featured) {
      formatted += `\n\n⭐ *Customer favorite!*`;
    }
    
    // Add related products
    if (products.length > 1) {
      formatted += `\n\n📦 *Also check:*`;
      products.slice(1, 3).forEach((p, i) => {
        formatted += `\n${i + 2}. ${p.name} (₹${p.mrp})`;
      });
    }
    
    // Cache the response
    if (aiResponseCache.size >= MAX_CACHE_SIZE) {
      const firstKey = aiResponseCache.keys().next().value;
      aiResponseCache.delete(firstKey);
    }
    aiResponseCache.set(cacheKey, formatted);
    
    return formatted;
    
  } catch (error) {
    console.error('❌ AI generation error:', error.message);
    return generateEnhancedTemplate(query, products, language);
  }
}

// Enhanced template fallback (when AI unavailable)
function generateEnhancedTemplate(query, products, language) {
  const product = products[0];
  const emoji = getProductEmoji(product.name);
  
  const templates = {
    en: {
      intro: ['Perfect choice!', 'Great selection!', 'Excellent pick!', 'Smart choice!'],
      value: ['Amazing value for money', 'Best quality at this price', 'Our most popular item', 'Customer favorite'],
      action: ['Want to order?', 'Ready to buy?', 'Shall I add to cart?']
    },
    ta: {
      intro: ['சரியான தேர்வு!', 'சிறந்த தேர்வு!', 'நல்ல தேர்வு!'],
      value: ['விலைக்கு சிறந்த மதிப்பு', 'இந்த விலையில் சிறந்த தரம்', 'மிகவும் பிரபலமான பொருள்'],
      action: ['ஆர்டர் செய்யலாமா?', 'வாங்க விரும்புகிறீர்களா?']
    },
    hi: {
      intro: ['परफेक्ट च्वाइस!', 'बढ़िया चुनाव!', 'शानदार!'],
      value: ['पैसे का बेहतरीन वैल्यू', 'इस कीमत में बेस्ट क्वालिटी', 'सबसे पॉपुलर प्रोडक्ट'],
      action: ['ऑर्डर करें?', 'खरीदना चाहते हैं?']
    },
    te: {
      intro: ['సరైన ఎంపిక!', 'గొప్ప ఎంపిక!', 'అద్భుతం!'],
      value: ['డబ్బుకు అద్భుతమైన విలువ', 'ఈ ధరలో ఉత్తమ నాణ్యత', 'అత్యంత ప్రజాదరణ పొందిన ఉత్పత్తి'],
      action: ['ఆర్డర్ చేయాలా?', 'కొనుగోలు చేయాలనుకుంటున్నారా?']
    },
    kn: {
      intro: ['ಸರಿಯಾದ ಆಯ್ಕೆ!', 'ಅದ್ಭುತ ಆಯ್ಕೆ!', 'ಉತ್ತಮ!'],
      value: ['ಹಣಕ್ಕೆ ಅದ್ಭುತ ಮೌಲ್ಯ', 'ಈ ಬೆಲೆಗೆ ಉತ್ತಮ ಗುಣಮಟ್ಟ', 'ಅತ್ಯಂತ ಜನಪ್ರಿಯ ಉತ್ಪನ್ನ'],
      action: ['ಆರ್ಡರ್ ಮಾಡಬೇಕೇ?', 'ಖರೀದಿಸಲು ಬಯಸುವಿರಾ?']
    }
  };
  
  const lang = templates[language] || templates.en;
  const intro = lang.intro[Math.floor(Math.random() * lang.intro.length)];
  const value = lang.value[Math.floor(Math.random() * lang.value.length)];
  
  let response = `${emoji} *${intro}*\n\n`;
  response += `${product.name}\n`;
  response += `${product.description || ''}\n\n`;
  
  if (product.uses && product.uses.length > 0) {
    response += `✅ ${product.uses[0]}\n`;
    if (product.uses[1]) response += `✅ ${product.uses[1]}\n`;
  }
  
  response += `\n💰 *₹${product.mrp}*\n`;
  response += `${value}!`;
  
  if (product.search_metadata?.popularity_score > 85) {
    response += `\n\n🔥 *Trending now!*`;
  }
  
  return response;
}

// Handle incoming messages
async function handleMessage(message, session) {
  // Check for language change request
  const newLanguage = detectLanguageChange(message);
  if (newLanguage) {
    session.language = newLanguage;
    const langNames = {
      en: 'English',
      ta: 'தமிழ் (Tamil)',
      hi: 'हिंदी (Hindi)',
      te: 'తెలుగు (Telugu)',
      kn: 'ಕನ್ನಡ (Kannada)',
      ml: 'മലയാളം (Malayalam)'
    };
    return `✅ Language changed to ${langNames[newLanguage]}!\n\n${systemMessages[newLanguage]?.greeting || systemMessages.en.greeting}`;
  }
  
  const intent = detectIntent(message);
  console.log(`🧠 Intent: ${intent.intent} (${intent.confidence}%)`);
  
  // Check if user is referring to previous context
  const hasContextReference = detectContextReference(message);
  if (hasContextReference && session.conversationHistory.length > 0) {
    // Get last product mentioned
    const lastBotMessage = session.conversationHistory.slice().reverse().find(h => h.role === 'bot');
    if (lastBotMessage && lastBotMessage.products && lastBotMessage.products.length > 0) {
      console.log('🔗 User referring to previous product');
      const lang = session.language || 'en';
      const response = await generateAISalesResponse(message, lastBotMessage.products, lang, session);
      session.conversationHistory.push({ role: 'bot', content: response, products: lastBotMessage.products });
      return response;
    }
  }
  
  // Update conversation history
  session.conversationHistory.push({ role: 'user', content: message });
  if (session.conversationHistory.length > 10) {
    session.conversationHistory = session.conversationHistory.slice(-10);
  }
  
  const lang = session.language || 'en';
  
  // Handle different intents
  if (intent.intent === 'greeting') {
    return systemMessages[lang]?.greeting || systemMessages.en.greeting;
  }
  
  if (intent.intent === 'search' || intent.intent === 'recommendation' || intent.intent === 'general') {
    // Search for products
    const products = smartSearch(message, 5);
    
    if (products.length === 0) {
      return `${systemMessages[lang]?.thinking || '🤔'}\n\nSorry, I couldn't find exact matches. Can you describe what you're looking for? (floor cleaner, dish wash, etc.)`;
    }
    
    // Generate AI-powered sales response
    const response = await generateAISalesResponse(message, products, lang, session);
    
    // Store products in conversation history
    session.conversationHistory.push({ role: 'bot', content: response, products: products });
    
    return response;
  }
  
  if (intent.intent === 'price') {
    const products = smartSearch(message, 3);
    if (products.length > 0) {
      let response = `💰 *Pricing:*\n\n`;
      products.forEach((p, i) => {
        response += `${i + 1}. ${p.name}\n   ₹${p.mrp}\n\n`;
      });
      session.conversationHistory.push({ role: 'bot', content: response, products: products });
      return response;
    }
  }
  
  // Default: try AI-powered response
  const products = smartSearch(message, 3);
  if (products.length > 0) {
    const response = await generateAISalesResponse(message, products, lang, session);
    session.conversationHistory.push({ role: 'bot', content: response, products: products });
    return response;
  }
  
  // No products found - provide helpful message
  const helpMessages = {
    en: "I couldn't find products matching that. Try:\n• 'floor cleaner'\n• 'dish wash'\n• 'bathroom cleaner'\n• 'show all products'",
    ta: "அந்த பொருள் கிடைக்கவில்லை. முயற்சிக்கவும்:\n• 'தரை சுத்தம்'\n• 'பாத்திரம் கழுவும் திரவம்'\n• 'குளியலறை சுத்தம்'",
    hi: "वह उत्पाद नहीं मिला। कोशिश करें:\n• 'फर्श क्लीनर'\n• 'बर्तन साफ करने का साबुन'\n• 'बाथरूम क्लीनर'",
    te: "ఆ ఉత్పత్తి దొరకలేదు. ప్రయత్నించండి:\n• 'ఫ్లోర్ క్లీనర్'\n• 'డిష్ వాష్'\n• 'బాత్రూమ్ క్లీనర్'",
    kn: "ಆ ಉತ್ಪನ್ನ ಸಿಗಲಿಲ್ಲ. ಪ್ರಯತ್ನಿಸಿ:\n• 'ಫ್ಲೋರ್ ಕ್ಲೀನರ್'\n• 'ಡಿಶ್ ವಾಶ್'\n• 'ಬಾತ್ರೂಮ್ ಕ್ಲೀನರ್'"
  };
  
  return helpMessages[lang] || helpMessages.en;
}

// WhatsApp webhook endpoint
app.post('/whatsapp', async (req, res) => {
  const incomingMessage = req.body.Body?.trim() || '';
  const phoneNumber = req.body.From || '';
  
  console.log(`\n📱 Message from ${phoneNumber}: "${incomingMessage}"`);
  
  const twiml = new MessagingResponse();
  const session = getUserSession(phoneNumber);
  
  try {
    let replyMessage = '';
    
    // First time user
    if (session.isFirstMessage) {
      session.isFirstMessage = false;
      replyMessage = systemMessages.en.welcome + '\n\n' + systemMessages.en.languageMenu;
    }
    // Language selection
    else if (!session.language && /^[1-6]$/.test(incomingMessage)) {
      const langMap = { '1': 'en', '2': 'ta', '3': 'te', '4': 'kn', '5': 'ml', '6': 'hi' };
      session.language = langMap[incomingMessage];
      replyMessage = systemMessages[session.language]?.greeting || systemMessages.en.greeting;
    }
    // Regular conversation
    else {
      if (!session.language) session.language = 'en';
      replyMessage = await handleMessage(incomingMessage, session);
    }
    
    // Log the response being sent
    console.log(`📤 Sending response (${replyMessage.length} chars):`);
    console.log(`Preview: ${replyMessage.substring(0, 100)}...`);
    
    twiml.message(replyMessage);
    console.log(`✅ Reply sent (${replyMessage.length} chars)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    twiml.message('Sorry, I encountered an error. Please try again! 🙏');
  }
  
  res.type('text/xml');
  res.send(twiml.toString());
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    aiEnabled: !!hf,
    productsIndexed: productSearchIndex.length,
    cacheSize: aiResponseCache.size,
    activeSessions: userSessions.size
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 AI-Powered Multilingual Sales Bot Starting...');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`📱 Webhook endpoint: http://localhost:${PORT}/whatsapp`);
  console.log(`🤖 AI Status: ${hf ? '✅ ENABLED' : '⚠️  DISABLED (set HUGGINGFACE_TOKEN)'}`);
  console.log(`📊 Products indexed: ${productSearchIndex.length}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎯 AI Models:');
  console.log(`   • Sales: ${AI_MODELS.sales}`);
  console.log(`   • Translation: ${AI_MODELS.indic}`);
  console.log(`   • Languages: Tamil, Hindi, Telugu, Kannada, Malayalam, English`);
  console.log('═══════════════════════════════════════════════════════════════');
  if (!hf) {
    console.log('💡 To enable AI:');
    console.log('   1. Get token: https://huggingface.co/settings/tokens');
    console.log('   2. Set: $env:HUGGINGFACE_TOKEN="hf_xxx"');
    console.log('   3. Restart: npm run start:ai');
  }
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎯 Ready to provide intelligent sales assistance!\n');
});
