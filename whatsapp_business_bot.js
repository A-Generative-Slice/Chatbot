/**
 * 🚀 WhatsApp Business API Bot (No Twilio Dependency!)
 * Runs 24/7 on GitHub Codespaces
 * Direct WhatsApp Cloud API integration
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORT = process.env.PORT || 3000;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; // Meta WhatsApp API token
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID; // Your WhatsApp Business phone ID
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'your-verify-token-123';
const SARVAM_API_KEY = process.env.AI_API_KEY; // Sarvam AI API key

// Sarvam AI configuration
const SARVAM_API_URL = 'https://api.sarvam.ai/v1/chat/completions';

// 🚀 SARVAM AI MODELS - Best for Indian Languages!
const AI_MODELS = {
  // Primary: Sarvam-M - FREE model for Indian languages
  primary: 'sarvam-m',
  
  // Note: Sarvam AI specializes in:
  // - Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, Gujarati, Marathi
  // - Excellent grammar and natural responses
  // - Built specifically for Indian market
  // - FREE: ₹0 per token - Perfect for unlimited conversations!
};

// Welcome messages in different languages
const WELCOME_MESSAGES = {
  greeting: {
    en: "🙏 *Welcome to Rose Chemicals!*\n\nWe're your trusted partner for premium cleaning solutions.",
    ta: "🙏 *ரோஸ் கெமிக்கல்ஸ் நிறுவனத்திற்கு வரவேற்கிறோம்!*\n\nதரமான சுத்தம் செய்யும் தயாரிப்புகளுக்கான உங்கள் நம்பகமான துணை.",
    hi: "🙏 *रोज केमिकल्स में आपका स्वागत है!*\n\nहम प्रीमियम सफाई समाधान के लिए आपके विश्वसनीय साथी हैं।",
    te: "🙏 *రోజ్ కెమికల్స్‌కు స్వాగతం!*\n\nప్రీమియం శుభ్రపరిచే పరిష్కారాల కోసం మేము మీ నమ్మకమైన భాగస్వామి.",
    kn: "🙏 *ರೋಸ್ ಕೆಮಿಕಲ್ಸ್‌ಗೆ ಸ್ವಾಗತ!*\n\nಪ್ರೀಮಿಯಂ ಶುಚಿಗೊಳಿಸುವ ಪರಿಹಾರಗಳಿಗಾಗಿ ನಾವು ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ಪಾಲುದಾರರು.",
    ml: "🙏 *റോസ് കെമിക്കൽസിലേക്ക് സ്വാഗതം!*\n\nപ്രീമിയം ക്ലീനിംഗ് സൊല്യൂഷനുകൾക്കായി ഞങ്ങൾ നിങ്ങളുടെ വിശ്വസ്ത പങ്കാളിയാണ്."
  },
  languagePrompt: {
    en: "\n\n🌐 *Please select your preferred language:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ हिंदी (Hindi)\n4️⃣ తెలుగు (Telugu)\n5️⃣ ಕನ್ನಡ (Kannada)\n6️⃣ മലയാളം (Malayalam)\n\nJust reply with the number (1-6) or start chatting in your language! 😊",
    ta: "\n\n🌐 *உங்கள் விருப்ப மொழியைத் தேர்ந்தெடுக்கவும்:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ हिंदी (Hindi)\n4️⃣ తెలుగు (Telugu)\n5️⃣ ಕನ್ನಡ (Kannada)\n6️⃣ മലയാളം (Malayalam)\n\nஎண்ணை (1-6) அனுப்புங்கள் அல்லது உங்கள் மொழியில் பேச ஆரம்பிக்கவும்! 😊",
    hi: "\n\n🌐 *कृपया अपनी पसंदीदा भाषा चुनें:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ हिंदी (Hindi)\n4️⃣ తెలుగు (Telugu)\n5️⃣ ಕನ್ನಡ (Kannada)\n6️⃣ മലയാളം (Malayalam)\n\nनंबर (1-6) से जवाब दें या अपनी भाषा में बात करना शुरू करें! 😊",
    te: "\n\n🌐 *దయచేసి మీ ఇష్టమైన భాషను ఎంచుకోండి:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ हिंदी (Hindi)\n4️⃣ తెలుగు (Telugu)\n5️⃣ ಕನ್ನಡ (Kannada)\n6️⃣ മലയാളം (Malayalam)\n\nసంఖ్యతో (1-6) ప్రత్యుత్తరం ఇవ్వండి లేదా మీ భాషలో మాట్లాడటం ప్రారంభించండి! 😊",
    kn: "\n\n🌐 *ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ हिंदी (Hindi)\n4️⃣ తెలుగు (Telugu)\n5️⃣ ಕನ್ನಡ (Kannada)\n6️⃣ മലയാളം (Malayalam)\n\nಸಂಖ್ಯೆಯೊಂದಿಗೆ (1-6) ಪ್ರತ್ಯುತ್ತರಿಸಿ ಅಥವಾ ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಚಾಟ್ ಮಾಡಲು ಪ್ರಾರಂಭಿಸಿ! 😊",
    ml: "\n\n🌐 *ദയവായി നിങ്ങളുടെ ഇഷ്ടമുള്ള ഭാഷ തിരഞ്ഞെടുക്കുക:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ हिंदी (Hindi)\n4️⃣ తెలుగు (Telugu)\n5️⃣ ಕನ್ನಡ (Kannada)\n6️⃣ മലയാളം (Malayalam)\n\nനമ്പർ (1-6) ഉപയോഗിച്ച് മറുപടി നൽകുക അല്ലെങ്കിൽ നിങ്ങളുടെ ഭാഷയിൽ ചാറ്റ് ചെയ്യാൻ തുടങ്ങുക! 😊"
  }
};

// Session storage (in production, use Redis or database)
const userSessions = new Map();

// Load products from JSON
let PRODUCTS_DATA = { categories: {} };
let ALL_PRODUCTS = [];

try {
  const productsRaw = fs.readFileSync('./products.json', 'utf-8');
  PRODUCTS_DATA = JSON.parse(productsRaw);
  
  // Flatten all products into a single array for easy searching
  for (const categoryKey in PRODUCTS_DATA.categories) {
    const category = PRODUCTS_DATA.categories[categoryKey];
    if (category.products) {
      ALL_PRODUCTS.push(...category.products.map(p => ({
        ...p,
        category: category.name
      })));
    }
  }
  console.log(`✅ Loaded ${ALL_PRODUCTS.length} products from ${Object.keys(PRODUCTS_DATA.categories).length} categories`);
} catch (error) {
  console.error('⚠️  Could not load products.json:', error.message);
}

// ============================================================================
// LANGUAGE DETECTION & TRANSLATION
// ============================================================================

const LANGUAGES = {
  en: { name: 'English', code: 'en_XX' },
  ta: { name: 'Tamil', code: 'ta_IN' },
  hi: { name: 'Hindi', code: 'hi_IN' },
  te: { name: 'Telugu', code: 'te_IN' },
  kn: { name: 'Kannada', code: 'kn_IN' },
  ml: { name: 'Malayalam', code: 'ml_IN' }
};

function detectLanguage(text) {
  const trimmed = text.trim();
  const lower = text.toLowerCase();
  
  // Check for language selection numbers
  if (trimmed === '1') return 'en';
  if (trimmed === '2') return 'ta';
  if (trimmed === '3') return 'hi';
  if (trimmed === '4') return 'te';
  if (trimmed === '5') return 'kn';
  if (trimmed === '6') return 'ml';
  
  // Check for Tanglish (Tamil words in English script)
  const tanglishPatterns = [
    /\b(vanakkam|vanakam|eppadi|epdi|irukeenga|irukinga|nalla|nalladhu|sari|serri|romba|rumba|nandri|thanks|soap|saabun|sabu|cleanser|floor|thurai|veedu|veetu)\b/i,
    /\b(podi|powder|thanni|water|paal|milk|velai|work|kaasu|money|price|vilai)\b/i
  ];
  if (tanglishPatterns.some(pattern => pattern.test(lower))) return 'ta';
  
  // Check for Hinglish (Hindi words in English script)
  const hinglishPatterns = [
    /\b(namaste|namaskar|kaise|kaisa|accha|acha|theek|thik|dhanyavaad|shukriya|soap|sabun|saaf|safai|ghar|floor)\b/i,
    /\b(paisa|paise|kitna|kitni|chahiye|chaiye|price|keemat|kya|hai|hain)\b/i
  ];
  if (hinglishPatterns.some(pattern => pattern.test(lower))) return 'hi';
  
  // Check for Tenglish (Telugu in English script)
  const tenglishPatterns = [
    /\b(namaskaram|namaskaaram|ela|elaa|unnaru|unnaaru|manchidi|manchi|thanks|dhanyavadalu|soap|sabbu|clean|safai|inti|illu)\b/i,
    /\b(dabbu|money|entha|enta|kavali|kavaali|price|viluva)\b/i
  ];
  if (tenglishPatterns.some(pattern => pattern.test(lower))) return 'te';
  
  // Check for language keywords
  if (lower.includes('english') || lower.includes('இங்கிலீஷ்') || lower.includes('अंग्रेजी')) return 'en';
  if (lower.includes('tamil') || lower.includes('தமிழ்') || lower.includes('तमिल')) return 'ta';
  if (lower.includes('hindi') || lower.includes('हिंदी') || lower.includes('ஹிந்தி')) return 'hi';
  if (lower.includes('telugu') || lower.includes('తెలుగు') || lower.includes('तेलुगु')) return 'te';
  if (lower.includes('kannada') || lower.includes('ಕನ್ನಡ') || lower.includes('कन्नड़')) return 'kn';
  if (lower.includes('malayalam') || lower.includes('മലയാളം') || lower.includes('मलयालम')) return 'ml';
  
  // Unicode range detection
  const tamilChars = /[\u0B80-\u0BFF]/;
  const hindiChars = /[\u0900-\u097F]/;
  const teluguChars = /[\u0C00-\u0C7F]/;
  const kannadaChars = /[\u0C80-\u0CFF]/;
  const malayalamChars = /[\u0D00-\u0D7F]/;

  if (tamilChars.test(text)) return 'ta';
  if (hindiChars.test(text)) return 'hi';
  if (teluguChars.test(text)) return 'te';
  if (kannadaChars.test(text)) return 'kn';
  if (malayalamChars.test(text)) return 'ml';
  return 'en';
}

// Get welcome message for new users
function getWelcomeMessage(language = 'en') {
  const lang = WELCOME_MESSAGES.greeting[language] || WELCOME_MESSAGES.greeting.en;
  const prompt = WELCOME_MESSAGES.languagePrompt[language] || WELCOME_MESSAGES.languagePrompt.en;
  return lang + prompt;
}

// ============================================================================
// WHATSAPP BUSINESS API FUNCTIONS
// ============================================================================

async function sendWhatsAppMessage(to, message) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Message sent to ${to}:`, message.substring(0, 50) + '...');
    return response.data;
  } catch (error) {
    console.error('❌ WhatsApp send error:', error.response?.data || error.message);
    throw error;
  }
}

async function markAsRead(messageId) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('⚠️  Mark as read error:', error.message);
  }
}

// ============================================================================
// PRODUCT SEARCH
// ============================================================================

function searchProducts(query, limit = 5) {
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/);
  
  const matches = ALL_PRODUCTS.map(product => {
    let score = 0;
    
    // Search in name
    if (product.name.toLowerCase().includes(queryLower)) score += 10;
    
    // Search in description
    if (product.description && product.description.toLowerCase().includes(queryLower)) score += 5;
    
    // Search in keywords
    if (product.keywords) {
      for (const keyword of product.keywords) {
        if (keyword.toLowerCase().includes(queryLower)) score += 3;
        for (const word of words) {
          if (keyword.toLowerCase().includes(word)) score += 1;
        }
      }
    }
    
    // Search in category
    if (product.category && product.category.toLowerCase().includes(queryLower)) score += 4;
    
    return { product, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, limit)
  .map(item => item.product);
  
  return matches;
}

// ============================================================================
// AI RESPONSE GENERATION - ENHANCED MULTILINGUAL WITH BETTER GRAMMAR
// ============================================================================

async function generateAIResponse(userMessage, language, products, isFirstMessage = false) {
  // Search for relevant products
  const relevantProducts = searchProducts(userMessage, 5);
  
  // Build product context with rich details - MORE PROMINENT FORMAT
  let productContext = '';
  if (relevantProducts.length > 0) {
    productContext = '\n\n🎯 PRODUCTS TO RECOMMEND:\n';
    relevantProducts.forEach((p, i) => {
      productContext += `\n${i + 1}. **${p.name}** - ₹${p.mrp}\n`;
      if (p.description) {
        productContext += `   Description: ${p.description}\n`;
      }
      if (p.uses && p.uses.length > 0) {
        productContext += `   Uses: ${p.uses.slice(0, 3).join(', ')}\n`;
      }
      if (p.category) {
        productContext += `   Category: ${p.category}\n`;
      }
    });
    productContext += '\n⚠️ YOU MUST MENTION THESE PRODUCTS IN YOUR RESPONSE!\n';
  } else {
    // No specific match - show general product categories
    productContext = '\n\n📦 ROSE CHEMICALS PRODUCTS:\n';
    productContext += '• Floor Cleaners (Phenyl, Acid-based)\n';
    productContext += '• Toilet Cleaners (Acid-based, Liquid)\n';
    productContext += '• Dishwash Liquids & Bars\n';
    productContext += '• Detergents & Fabric Care\n';
    productContext += '• Hand Wash & Sanitizers\n';
    productContext += '• Glass & Surface Cleaners\n';
    productContext += '\n⚠️ INFORM CUSTOMER ABOUT THESE CATEGORIES!\n';
  }
  
  // CRITICAL: Language-first system prompts - Target language instructions FIRST
  const systemPrompts = {
    en: `You are a sales assistant for Rose Chemicals. Respond ONLY in English with proper grammar.

Customer message: "${userMessage}"

IMPORTANT: You MUST mention at least 2-3 products from the list below in your response. Include product names and prices.

Help them find cleaning products. Be friendly and concise.
${productContext}

REMEMBER: Always include product names and prices (₹) in your response!`,

    ta: `நீங்கள் ரோஸ் கெமிக்கல்ஸ் நிறுவனத்தின் விற்பனை உதவியாளர். தமிழில் மட்டும் பதிலளிக்கவும்.

வாடிக்கையாளர் செய்தி: "${userMessage}"

முக்கியம்: கீழே உள்ள பட்டியலில் இருந்து குறைந்தது 2-3 பொருட்களை உங்கள் பதிலில் குறிப்பிட வேண்டும். பொருள் பெயர்கள் மற்றும் விலைகளை சேர்க்கவும்.

அவர்களுக்கு சுத்தம் செய்யும் பொருட்களைக் கண்டுபிடிக்க உதவுங்கள். நட்பாகவும் சுருக்கமாகவும் பதிலளிக்கவும்.
${productContext}

நினைவில் கொள்ளுங்கள்: எப்போதும் பொருள் பெயர்கள் மற்றும் விலைகளை (₹) உங்கள் பதிலில் சேர்க்கவும்!
தமிழில் மட்டுமே பதில் எழுதவும். ஆங்கிலத்தில் எழுத வேண்டாம்.`,

    hi: `आप रोज केमिकल्स के विक्रय सहायक हैं। केवल हिंदी में जवाब दें।

ग्राहक का संदेश: "${userMessage}"

महत्वपूर्ण: आपको नीचे दी गई सूची से कम से कम 2-3 उत्पादों का उल्लेख करना होगा। उत्पाद के नाम और कीमतें शामिल करें।

उन्हें सफाई उत्पाद खोजने में मदद करें। मित्रवत और संक्षिप्त में जवाब दें।
${productContext}

याद रखें: हमेशा उत्पाद के नाम और कीमतें (₹) अपने जवाब में शामिल करें!
केवल हिंदी में लिखें। अंग्रेजी में न लिखें।`,

    te: `మీరు రోజ్ కెమికల్స్ విక్రయ సహాయకుడు. తెలుగులో మాత్రమే సమాధానం ఇవ్వండి।

కస్టమర్ సందేశం: "${userMessage}"

ముఖ్యమైనది: క్రింద ఉన్న జాబితా నుండి కనీసం 2-3 ఉత్పత్తులను మీ సమాధానంలో పేర్కొనాలి. ఉత్పత్తి పేర్లు మరియు ధరలను చేర్చండి।

వారికి శుభ్రపరిచే ఉత్పత్తులను కనుగొనడంలో సహాయం చేయండి. స్నేహపూర్వకంగా మరియు సంక్షిప్తంగా సమాధానం ఇవ్వండి।
${productContext}

గుర్తుంచుకోండి: ఎల్లప్పుడూ ఉత్పత్తి పేర్లు మరియు ధరలను (₹) మీ సమాధానంలో చేర్చండి!
తెలుగులో మాత్రమే రాయండి. ఆంగ్లంలో రాయవద్దు।`,

    kn: `ನೀವು ರೋಸ್ ಕೆಮಿಕಲ್ಸ್ ಮಾರಾಟ ಸಹಾಯಕ. ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಉತ್ತರಿಸಿ।

ಗ್ರಾಹಕರ ಸಂದೇಶ: "${userMessage}"

ಮುಖ್ಯ: ಕೆಳಗಿನ ಪಟ್ಟಿಯಿಂದ ಕನಿಷ್ಠ 2-3 ಉತ್ಪನ್ನಗಳನ್ನು ನಿಮ್ಮ ಉತ್ತರದಲ್ಲಿ ಉಲ್ಲೇಖಿಸಬೇಕು. ಉತ್ಪನ್ನದ ಹೆಸರುಗಳು ಮತ್ತು ಬೆಲೆಗಳನ್ನು ಸೇರಿಸಿ।

ಅವರಿಗೆ ಶುಚಿಗೊಳಿಸುವ ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಲು ಸಹಾಯ ಮಾಡಿ. ಸ್ನೇಹಪರ ಮತ್ತು ಸಂಕ್ಷಿಪ್ತವಾಗಿ ಉತ್ತರಿಸಿ।
${productContext}

ನೆನಪಿಡಿ: ಯಾವಾಗಲೂ ಉತ್ಪನ್ನದ ಹೆಸರುಗಳು ಮತ್ತು ಬೆಲೆಗಳನ್ನು (₹) ನಿಮ್ಮ ಉತ್ತರದಲ್ಲಿ ಸೇರಿಸಿ!
ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಬರೆಯಿರಿ. ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಬರೆಯಬೇಡಿ।`,

    ml: `നിങ്ങൾ റോസ് കെമിക്കൽസിന്റെ വിൽപ്പന സഹായി. മലയാളത്തിൽ മാത്രം മറുപടി നൽകുക।

ഉപഭോക്തൃ സന്ദേശം: "${userMessage}"

പ്രധാനം: താഴെയുള്ള ലിസ്റ്റിൽ നിന്ന് കുറഞ്ഞത് 2-3 ഉൽപ്പന്നങ്ങൾ നിങ്ങളുടെ മറുപടിയിൽ പരാമർശിക്കണം. ഉൽപ്പന്ന നാമങ്ങളും വിലകളും ഉൾപ്പെടുത്തുക।

അവരെ ക്ലീനിംഗ് ഉൽപ്പന്നങ്ങൾ കണ്ടെത്താൻ സഹായിക്കുക. സൗഹാർദ്ദപരവും സംക്ഷിപ്തവുമായി മറുപടി നൽകുക।
${productContext}

ഓർക്കുക: എല്ലായ്പ്പോഴും ഉൽപ്പന്ന നാമങ്ങളും വിലകളും (₹) നിങ്ങളുടെ മറുപടിയിൽ ഉൾപ്പെടുത്തുക!
മലയാളത്തിൽ മാത്രം എഴുതുക. ഇംഗ്ലീഷിൽ എഴുതരുത്।`
  };

  const systemPrompt = systemPrompts[language] || systemPrompts.en;

  // 🎯 Sarvam AI model - FREE for Indian languages!
  const modelCascade = [
    { name: 'Sarvam-M (FREE - Indian Languages)', model: AI_MODELS.primary, temp: 0.7, maxTokens: 512 }
  ];

  // Try the model
  for (const { name, model, temp, maxTokens } of modelCascade) {
    try {
      console.log(`🤖 Trying ${name} [${model}]...`);
      
      const response = await axios.post(
        SARVAM_API_URL,
        {
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: maxTokens,
          temperature: temp,
          top_p: 0.9
        },
        {
          headers: {
            'api-subscription-key': SARVAM_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 15000 // 15s timeout
        }
      );

      const aiText = response.data.choices[0].message.content.trim();
      
      // Basic quality validation
      if (aiText.length < 15) {
        throw new Error('Response too short');
      }
      
      console.log(`✅ ${name} generated ${aiText.length} chars`);
      return aiText;

    } catch (error) {
      console.error(`⚠️  ${name} failed: ${error.response?.data?.error?.message || error.message}`);
      if (error.response?.data) {
        console.error('Full error:', JSON.stringify(error.response.data, null, 2));
      }
      // Continue to fallback
      continue;
    }
  }

  // All models failed - use intelligent fallback
  console.log('⚠️  All AI models failed, using enhanced fallback response...');
  
  // Enhanced fallback responses with product info
  const fallbacks = {
    en: `👋 Hello! I'm here to help you find the best cleaning products.\n\n${relevantProducts.length > 0 ? `I found these for you:\n${relevantProducts[0].name} - ₹${relevantProducts[0].mrp}\n\n` : ''}What specific cleaning solution do you need? 🧹`,
    
    ta: `வணக்கம்! 🙏 நான் உங்களுக்கு சிறந்த சுத்தம் செய்யும் பொருட்களைக் கண்டுபிடிக்க உதவுகிறேன்.\n\n${relevantProducts.length > 0 ? `இதோ உங்களுக்கான பொருள்:\n${relevantProducts[0].name} - ₹${relevantProducts[0].mrp}\n\n` : ''}என்ன தேவை? 🧹`,
    
    hi: `नमस्ते! 🙏 मैं आपको बेहतरीन सफाई उत्पाद खोजने में मदद करूंगा।\n\n${relevantProducts.length > 0 ? `यह देखें:\n${relevantProducts[0].name} - ₹${relevantProducts[0].mrp}\n\n` : ''}आपको क्या चाहिए? 🧹`,
    
    te: `నమస్కారం! 🙏 నేను మీకు ఉత్తమ శుభ్రపరిచే ఉత్పత్తులను కనుగొనడంలో సహాయం చేస్తాను।\n\n${relevantProducts.length > 0 ? `ఇదిగో మీ కోసం:\n${relevantProducts[0].name} - ₹${relevantProducts[0].mrp}\n\n` : ''}మీకు ఏమి కావాలి? 🧹`,
    
    kn: `ನಮಸ್ಕಾರ! 🙏 ನಾನು ನಿಮಗೆ ಉತ್ತಮ ಶುಚಿಗೊಳಿಸುವ ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ।\n\n${relevantProducts.length > 0 ? `ಇಲ್ಲಿದೆ:\n${relevantProducts[0].name} - ₹${relevantProducts[0].mrp}\n\n` : ''}ನಿಮಗೆ ಏನು ಬೇಕು? 🧹`,
    
    ml: `നമസ്കാരം! 🙏 മികച്ച ക്ലീനിംഗ് ഉൽപ്പന്നങ്ങൾ കണ്ടെത്താൻ ഞാൻ നിങ്ങളെ സഹായിക്കും।\n\n${relevantProducts.length > 0 ? `ഇതാ:\n${relevantProducts[0].name} - ₹${relevantProducts[0].mrp}\n\n` : ''}എന്താണ് വേണ്ടത്? 🧹`
  };
  
  return fallbacks[language] || fallbacks.en;
}

// ============================================================================
// WEBHOOK VERIFICATION (Required by WhatsApp)
// ============================================================================

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('🔍 Webhook verification request received');
  console.log('   Mode:', mode);
  console.log('   Token received:', token);
  console.log('   Challenge:', challenge);
  console.log('   Expected token:', VERIFY_TOKEN);
  console.log('   Token match:', token === VERIFY_TOKEN);

  // Token verification - CRITICAL!
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WEBHOOK VERIFIED SUCCESSFULLY! 🎉');
    console.log('   Sending challenge back to Meta...');
    res.status(200).type('text/plain').send(challenge);
  } else {
    console.error('❌ WEBHOOK VERIFICATION FAILED!');
    console.error('   Mode:', mode, 'Expected: subscribe', 'Match:', mode === 'subscribe');
    console.error('   Token:', token, 'Expected:', VERIFY_TOKEN);
    if (token !== VERIFY_TOKEN) {
      console.error('   ⚠️  TOKEN MISMATCH!');
      console.error('      Received length:', token?.length);
      console.error('      Expected length:', VERIFY_TOKEN?.length);
    }
    res.sendStatus(403);
  }
});

// ============================================================================
// WEBHOOK MESSAGE HANDLER
// ============================================================================

app.post('/webhook', async (req, res) => {
  try {
    // Quick 200 response to WhatsApp (they require this within 5 seconds)
    res.sendStatus(200);

    const body = req.body;

    // Check if it's a WhatsApp message
    if (body.object !== 'whatsapp_business_account') {
      return;
    }

    // Extract message data
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      return;
    }

    const message = messages[0];
    const from = message.from; // Phone number
    const messageId = message.id;
    const messageBody = message.text?.body;

    if (!messageBody) {
      return; // Ignore non-text messages for now
    }

    console.log(`\n📱 Message from ${from}: "${messageBody}"`);

    // Mark as read
    await markAsRead(messageId);

    // Check if user says "hi" or "hello" - ONLY way to start conversation
    const isGreeting = /^(hi|hello|hey|hii|helo|hola|vanakkam|vanakam|namaste|namaskar|namaskaram)$/i.test(messageBody.trim());
    
    if (isGreeting) {
      // Create or reset session when user says Hi
      let session = {
        language: 'en',
        conversationContext: [],
        createdAt: Date.now(),
        languageSelected: false
      };
      userSessions.set(from, session);
      
      const welcomeMsg = getWelcomeMessage('en');
      await sendWhatsAppMessage(from, welcomeMsg);
      console.log(`👋 User ${from} said greeting - showing language menu`);
      return;
    }

    // Get user session - if no session exists, user must say "Hi" first
    let session = userSessions.get(from);
    
    if (!session) {
      // User hasn't said "Hi" yet - don't respond to random messages
      console.log(`⚠️ User ${from} hasn't started conversation with 'Hi' - ignoring message`);
      return;
    }

    // Check if this is a language selection (only if not yet selected)
    if (!session.languageSelected) {
      const detectedLang = detectLanguage(messageBody);
      if (detectedLang !== 'en' || ['1','2','3','4','5','6'].includes(messageBody.trim())) {
        session.language = detectedLang;
        session.languageSelected = true;
        console.log(`🌍 User ${from} selected language: ${detectedLang}`);
        
        // Send a confirmation in their selected language
        const confirmations = {
          en: "Great! I'll help you in English. 😊\n\nWhat cleaning products are you looking for?",
          ta: "சரி! நான் தமிழில் உங்களுக்கு உதவுகிறேன். 😊\n\nஎந்த சுத்தம் செய்யும் பொருட்கள் வேண்டும்?",
          hi: "बढ़िया! मैं हिंदी में आपकी मदद करूंगा। 😊\n\nआपको कौन से सफाई उत्पाद चाहिए?",
          te: "అద్భుతం! నేను తెలుగులో మీకు సహాయం చేస్తాను। 😊\n\nమీకు ఏ శుభ్రపరిచే ఉత్పత్తులు కావాలి?",
          kn: "ಅದ್ಭುತ! ನಾನು ಕನ್ನಡದಲ್ಲಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ। 😊\n\nನಿಮಗೆ ಯಾವ ಶುಚಿಗೊಳಿಸುವ ಉತ್ಪನ್ನಗಳು ಬೇಕು?",
          ml: "മികച്ചത്! ഞാൻ മലയാളത്തിൽ നിങ്ങളെ സഹായിക്കും। 😊\n\nനിങ്ങൾക്ക് ഏത് ക്ലീനിംഗ് ഉൽപ്പന്നങ്ങൾ വേണം?"
        };
        await sendWhatsAppMessage(from, confirmations[detectedLang] || confirmations.en);
        return; // Don't process this message further
      }
    }

    // Auto-detect language from message if already selected (for Tanglish, Hinglish, etc.)
    if (session.languageSelected) {
      const detectedLang = detectLanguage(messageBody);
      if (detectedLang !== 'en') {
        session.language = detectedLang;
        console.log(`🔄 Detected ${detectedLang} (possibly romanized) - responding in ${detectedLang}`);
      }
    }

    // Update context
    session.conversationContext.push({
      role: 'user',
      content: messageBody,
      timestamp: Date.now()
    });

    // Generate AI response
    const aiResponse = await generateAIResponse(
      messageBody,
      session.language,
      ALL_PRODUCTS
    );

    // Send response
    await sendWhatsAppMessage(from, aiResponse);

    // Update context
    session.conversationContext.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: Date.now()
    });

    // Clean up old sessions (older than 24 hours)
    const now = Date.now();
    for (const [phone, sess] of userSessions.entries()) {
      if (now - sess.createdAt > 24 * 60 * 60 * 1000) {
        userSessions.delete(phone);
      }
    }

  } catch (error) {
    console.error('❌ Webhook error:', error);
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/', (req, res) => {
  res.json({
    status: '✅ Bot is running!',
    uptime: process.uptime(),
    sessions: userSessions.size,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    ai: SARVAM_API_KEY ? 'configured (Sarvam AI)' : 'missing',
    whatsapp: WHATSAPP_TOKEN && PHONE_NUMBER_ID ? 'configured' : 'missing'
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('   🤖 AI SALES BOT - WhatsApp Business API');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 WhatsApp webhook: http://localhost:${PORT}/webhook`);
  console.log(`\n🔑 Configuration:`);
  console.log(`   • Sarvam AI: ${SARVAM_API_KEY ? '✅ Configured (Indian Languages Specialist!)' : '❌ Missing'}`);
  console.log(`   • WhatsApp Token: ${WHATSAPP_TOKEN ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   • Phone Number ID: ${PHONE_NUMBER_ID ? '✅ Configured' : '❌ Missing'}`);
  console.log('\n💡 Press Ctrl+C to stop\n');
});
