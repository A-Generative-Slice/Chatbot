const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Load products knowledge base
let products = {};
let productsKnowledge = {};
try {
  const productsData = fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8');
  products = JSON.parse(productsData);
  console.log('✅ Products knowledge base loaded successfully');
} catch (error) {
  console.error('❌ Error loading products.json:', error);
}

// Load detailed knowledge base
try {
  const knowledgeData = fs.readFileSync(path.join(__dirname, 'products_knowledge_enhanced.json'), 'utf8');
  productsKnowledge = JSON.parse(knowledgeData);
  console.log('✅ Enhanced detailed knowledge base loaded successfully');
} catch (error) {
  console.error('❌ Error loading products_knowledge_enhanced.json:', error);
}

// User session storage (in production, use Redis or database)
const userSessions = new Map();

// Language translations
const translations = {
  en: {
    welcome: "🛍️ *Welcome to Rose Chemicals!*\n\nPlease select your preferred language:",
    languageMenu: "🌐 *Choose Language:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ తెలుగు (Telugu)\n4️⃣ ಕನ್ನಡ (Kannada)\n5️⃣ മലയാളം (Malayalam)\n6️⃣ हिंदी (Hindi)\n\nReply with number (1-6)",
    greeting: "Hello! 🛍️ Welcome to Rose Chemicals!\n\n✨ *We offer:*\n• Chemicals & Raw Materials\n• Cleaning Products\n• Perfumes & Fragrances\n• Brushes & Equipment\n\n🔍 *Try asking:*\n• \"Show me cleaning products\"\n• \"What is the price of acetic acid?\"\n• \"Browse perfumes\"\n• \"Categories\" to see all",
    greetingResponse: "Hello! 👋 Welcome to Rose Chemicals!\n\n🛍️ I'm here to help you find the perfect products for your needs.\n\n💡 *Quick commands:*\n• \"Categories\" - Browse all products\n• \"Search [product]\" - Find specific items\n• \"Help\" - Get assistance\n\nWhat can I help you find today?",
    thanksResponse: "You're welcome! 😊\n\nI'm always here to help you find the best products. Feel free to ask anything else!",
    noResults: "❌ No products found for \"{query}\"\n\n💡 *Try:*\n• Different keywords\n• Check spelling\n• Browse \"Categories\"\n• Ask \"Help\" for guidance",
    help: "🤖 *How can I help you?*\n\n🛒 *Shopping:*\n• Browse categories\n• Search products\n• Get prices\n• Place orders\n\n🔍 *Examples:*\n• \"Show cleaning products\"\n• \"Price of acetic acid\"\n• \"Add to cart\"\n• \"Checkout\"",
    categories: "📂 *Our Categories:*",
    priceInfo: "💰 *{name}*\n\n• Price: ₹{price}\n• Category: {category}\n• Code: #{id}\n\n🛒 Reply \"*Add {name}*\" to add to cart",
    searchResults: "🔍 Found {count} products for \"{query}\":",
    cart: "🛒 *Your Cart:*\n\n{items}\n\n💰 *Total: ₹{total}*\n\nReply \"*Checkout*\" to place order",
    orderPlaced: "✅ *Order Confirmed!*\n\nOrder ID: #{orderId}\nTotal: ₹{total}\n\nWe'll contact you shortly for delivery details! 📞",
    unknownQuery: "🤔 I didn't quite understand that.\n\n💡 *Try:*\n• \"Categories\" - Browse products\n• \"Help\" - Get assistance\n• \"Search [product name]\" - Find items\n\nWhat are you looking for?"
  },
  ta: {
    welcome: "🛍️ *ரோஸ் கெமிக்கல்ஸ்-க்கு வணக்கம்!*\n\nஉங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்:",
    languageMenu: "🌐 *மொழி தேர்வு:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ తెలుగు (Telugu)\n4️⃣ ಕನ್ನಡ (Kannada)\n5️⃣ മലയാളം (Malayalam)\n6️⃣ हिंदी (Hindi)\n\nஎண்ணுடன் பதிலளிக்கவும் (1-6)",
    greeting: "வணக்கம்! 🛍️ ரோஸ் கெமிக்கல்ஸ்-க்கு வரவேற்கிறோம்!\n\n✨ *எங்கள் தயாரிப்புகள்:*\n• ரசாயனங்கள் & மூலப்பொருட்கள்\n• சுத்தம் செய்யும் பொருட்கள்\n• வாசனை திரவியங்கள்\n• தூரிகைகள் & உபகரணங்கள்\n\n🔍 *கேட்கலாம்:*\n• \"சுத்தம் செய்யும் பொருட்கள் காட்டுங்கள்\"\n• \"அசிட்டிக் ஆசிட் விலை என்ன?\"\n• \"வாசனை திரவியங்கள்\"\n• \"வகைகள்\"",
    greetingResponse: "வணக்கம்! 👋 ரோஸ் கெமிக்கல்ஸ்-க்கு வரவேற்கிறோம்!\n\n🛍️ உங்களுக்கு தேவையான பொருட்களைக் கண்டறிய நான் இங்கே உள்ளேன்.\n\n💡 *விரைவு கட்டளைகள்:*\n• \"வகைகள்\" - அனைத்து பொருட்களும்\n• \"தேடல் [பொருள்]\" - குறிப்பிட்ட பொருட்கள்\n• \"உதவி\" - உதவி பெறுங்கள்\n\nஇன்று நான் என்ன உதவ முடியும்?",
    thanksResponse: "நல்வரவு! 😊\n\nசிறந்த பொருட்களைக் கண்டறிய நான் எப்போதும் இங்கே உள்ளேன். வேறு ஏதாவது கேளுங்கள்!",
    noResults: "❌ \"{query}\"-க்கு பொருட்கள் இல்லை\n\n💡 *முயற்சிக்கவும்:*\n• வேறு வார்த்தைகள்\n• எழுத்துப்பிழை சரிபார்க்கவும்\n• \"வகைகள்\" பார்க்கவும்\n• \"உதவி\" கேட்கவும்",
    help: "🤖 *எப்படி உதவ முடியும்?*\n\n🛒 *ஷாப்பிங்:*\n• வகைகள் பார்க்கவும்\n• பொருட்கள் தேடவும்\n• விலை பெறவும்\n• ஆர்டர் செய்யவும்",
    categories: "📂 *எங்கள் வகைகள்:*",
    priceInfo: "💰 *{name}*\n\n• விலை: ₹{price}\n• வகை: {category}\n• குறியீடு: #{id}\n\n🛒 கார்ட்டில் சேர்க்க \"*{name} சேர்*\" என்று பதிலளிக்கவும்",
    searchResults: "🔍 \"{query}\"-க்கு {count} பொருட்கள் கிடைத்தன:",
    cart: "🛒 *உங்கள் கார்ட்:*\n\n{items}\n\n💰 *மொத்தம்: ₹{total}*\n\nஆர்டர் செய்ய \"*செக்அவுட்*\" என்று பதிலளிக்கவும்",
    orderPlaced: "✅ *ஆர்டர் உறுதி!*\n\nஆர்டர் ஐடி: #{orderId}\nமொத்தம்: ₹{total}\n\nடெலிவரி விவரங்களுக்கு விரைவில் தொடர்பு கொள்வோம்! 📞",
    unknownQuery: "🤔 அது சரியாக புரியவில்லை.\n\n💡 *முயற்சிக்கவும்:*\n• \"வகைகள்\" - பொருட்கள் பார்க்கவும்\n• \"உதவி\" - உதவி பெறுங்கள்\n• \"தேடல் [பொருள் பெயர்]\" - பொருட்களைக் கண்டறியுங்கள்\n\nநீங்கள் எதைத் தேடுகிறீர்கள்?"
  },
  te: {
    welcome: "🛍️ *రోజ్ కెమికల్స్‌కు స్వాగతం!*\n\nమీ ఇష్టమైన భాషను ఎంచుకోండి:",
    languageMenu: "🌐 *భాష ఎంపిక:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ తెలుగు (Telugu)\n4️⃣ ಕನ್ನಡ (Kannada)\n5️⃣ മലയാളം (Malayalam)\n6️⃣ हिंदी (Hindi)\n\nసంఖ్యతో జవాబు ఇవ్వండి (1-6)",
    greeting: "నమస్కారం! 🛍️ రోజ్ కెమికల్స్‌కు స్వాగతం!\n\n✨ *మా ఉత్పత్తులు:*\n• రసాయనాలు & ముడిసరుకులు\n• శుభ్రపరిచే వస్తువులు\n• సుగంధ ద్రవ్యాలు\n• బ్రష్‌లు & పరికరాలు\n\n🔍 *అడగవచ్చు:*\n• \"శుభ్రపరిచే వస్తువులు చూపించు\"\n• \"ఎసిటిక్ యాసిడ్ ధర ఎంత?\"\n• \"సుగంధ ద్రవ్యాలు\"\n• \"వర్గాలు\"",
    noResults: "❌ \"{query}\" కోసం ఉత్పత్తులు లేవు\n\n💡 *ప్రయత్నించండి:*\n• వేరే పదాలు\n• స్పెల్లింగ్ చూడండి\n• \"వర్గాలు\" చూడండి\n• \"సహాయం\" అడగండి",
    help: "🤖 *ఎలా సహాయం చేయగలను?*\n\n🛒 *షాపింగ్:*\n• వర్గాలు చూడండి\n• ఉత్పత్తులు వెతకండి\n• ధరలు తెలుసుకోండి\n• ఆర్డర్ చేయండి",
    categories: "📂 *మా వర్గాలు:*",
    priceInfo: "💰 *{name}*\n\n• ధర: ₹{price}\n• వర్గం: {category}\n• కోడ్: #{id}\n\n🛒 కార్ట్‌కు జోడించడానికి \"*{name} జోడించు*\" అని రిప్లై చేయండి",
    searchResults: "🔍 \"{query}\" కోసం {count} ఉత్పత్తులు దొరికాయి:",
    cart: "🛒 *మీ కార్ట్:*\n\n{items}\n\n💰 *మొత్తం: ₹{total}*\n\nఆర్డర్ చేయడానికి \"*చెక్అవుట్*\" అని రిప్లై చేయండి",
    orderPlaced: "✅ *ఆర్డర్ నిర్ధారించబడింది!*\n\nఆర్డర్ ID: #{orderId}\nమొత్తం: ₹{total}\n\nడెలివరీ వివరాల కోసం త్వరలో సంప్రదిస్తాము! 📞"
  },
  kn: {
    welcome: "🛍️ *ರೋಸ್ ಕೆಮಿಕಲ್ಸ್‌ಗೆ ಸ್ವಾಗತ!*\n\nನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:",
    languageMenu: "🌐 *ಭಾಷೆ ಆಯ್ಕೆ:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ తెలుగు (Telugu)\n4️⃣ ಕನ್ನಡ (Kannada)\n5️⃣ മലയാളം (Malayalam)\n6️⃣ हिंदी (Hindi)\n\nಸಂಖ್ಯೆಯೊಂದಿಗೆ ಉತ್ತರಿಸಿ (1-6)",
    greeting: "ನಮಸ್ಕಾರ! 🛍️ ರೋಸ್ ಕೆಮಿಕಲ್ಸ್‌ಗೆ ಸ್ವಾಗತ!\n\n✨ *ನಮ್ಮ ಉತ್ಪನ್ನಗಳು:*\n• ರಸಾಯನಗಳು & ಕಚ್ಚಾ ವಸ್ತುಗಳು\n• ಸ್ವಚ್ಛಗೊಳಿಸುವ ವಸ್ತುಗಳು\n• ಸುಗಂಧ ದ್ರವ್ಯಗಳು\n• ಬ್ರಷ್‌ಗಳು & ಉಪಕರಣಗಳು\n\n🔍 *ಕೇಳಬಹುದು:*\n• \"ಸ್ವಚ್ಛಗೊಳಿಸುವ ವಸ್ತುಗಳನ್ನು ತೋರಿಸಿ\"\n• \"ಅಸಿಟಿಕ್ ಆಸಿಡ್ ಬೆಲೆ ಎಷ್ಟು?\"\n• \"ಸುಗಂಧ ದ್ರವ್ಯಗಳು\"\n• \"ವಿಭಾಗಗಳು\"",
    noResults: "❌ \"{query}\" ಗಾಗಿ ಉತ್ಪನ್ನಗಳು ಇಲ್ಲ\n\n💡 *ಪ್ರಯತ್ನಿಸಿ:*\n• ಬೇರೆ ಪದಗಳು\n• ಕಾಗುಣಿತ ಪರಿಶೀಲಿಸಿ\n• \"ವಿಭಾಗಗಳು\" ನೋಡಿ\n• \"ಸಹಾಯ\" ಕೇಳಿ",
    help: "🤖 *ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?*\n\n🛒 *ಶಾಪಿಂಗ್:*\n• ವಿಭಾಗಗಳನ್ನು ನೋಡಿ\n• ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ\n• ಬೆಲೆಗಳನ್ನು ಪಡೆಯಿರಿ\n• ಆರ್ಡರ್ ಮಾಡಿ",
    categories: "📂 *ನಮ್ಮ ವಿಭಾಗಗಳು:*",
    priceInfo: "💰 *{name}*\n\n• ಬೆಲೆ: ₹{price}\n• ವಿಭಾಗ: {category}\n• ಕೋಡ್: #{id}\n\n🛒 ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲು \"*{name} ಸೇರಿಸಿ*\" ಎಂದು ಉತ್ತರಿಸಿ",
    searchResults: "🔍 \"{query}\" ಗಾಗಿ {count} ಉತ್ಪನ್ನಗಳು ಸಿಕ್ಕಿವೆ:",
    cart: "🛒 *ನಿಮ್ಮ ಕಾರ್ಟ್:*\n\n{items}\n\n💰 *ಒಟ್ಟು: ₹{total}*\n\nಆರ್ಡರ್ ಮಾಡಲು \"*ಚೆಕ್‌ಔಟ್*\" ಎಂದು ಉತ್ತರಿಸಿ",
    orderPlaced: "✅ *ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ!*\n\nಆರ್ಡರ್ ID: #{orderId}\nಒಟ್ಟು: ₹{total}\n\nಡೆಲಿವರಿ ವಿವರಗಳಿಗಾಗಿ ಶೀಘ್ರವೇ ಸಂಪರ್ಕಿಸುತ್ತೇವೆ! 📞"
  },
  ml: {
    welcome: "🛍️ *റോസ് കെമിക്കൽസിലേക്ക് സ്വാഗതം!*\n\nനിങ്ങളുടെ ഇഷ്ടമുള്ള ഭാഷ തിരഞ്ഞെടുക്കുക:",
    languageMenu: "🌐 *ഭാഷ തിരഞ്ഞെടുപ്പ്:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ తెలుగు (Telugu)\n4️⃣ ಕನ್ನಡ (Kannada)\n5️⃣ മലയാളം (Malayalam)\n6️⃣ हिंदी (Hindi)\n\nസംഖ്യയോടെ മറുപടി നൽകുക (1-6)",
    greeting: "നമസ്കാരം! 🛍️ റോസ് കെമിക്കൽസിലേക്ക് സ്വാഗതം!\n\n✨ *ഞങ്ങളുടെ ഉൽപ്പന്നങ്ങൾ:*\n• രാസവസ്തുക്കളും അസംസ്കൃത വസ്തുക്കളും\n• വൃത്തിയാക്കൽ ഉൽപ്പന്നങ്ങൾ\n• പരിമളദ്രവ്യങ്ങൾ\n• ബ്രഷുകളും ഉപകരണങ്ങളും\n\n🔍 *ചോദിക്കാം:*\n• \"വൃത്തിയാക്കൽ ഉൽപ്പന്നങ്ങൾ കാണിക്കുക\"\n• \"അസിറ്റിക് ആസിഡിന്റെ വില എന്താണ്?\"\n• \"സുഗന്ധദ്രവ്യങ്ങൾ\"\n• \"വിഭാഗങ്ങൾ\"",
    noResults: "❌ \"{query}\" നായി ഉൽപ്പന്നങ്ങൾ ഇല്ല\n\n💡 *ശ്രമിക്കുക:*\n• വ്യത്യസ്ത പദങ്ങൾ\n• അക്ഷരത്തെറ്റ് പരിശോധിക്കുക\n• \"വിഭാഗങ്ങൾ\" കാണുക\n• \"സഹായം\" ചോദിക്കുക",
    help: "🤖 *എങ്ങനെ സഹായിക്കാൻ കഴിയും?*\n\n🛒 *ഷോപ്പിംഗ്:*\n• വിഭാഗങ്ങൾ കാണുക\n• ഉൽപ്പന്നങ്ങൾ തിരയുക\n• വിലകൾ നേടുക\n• ഓർഡർ ചെയ്യുക",
    categories: "📂 *ഞങ്ങളുടെ വിഭാഗങ്ങൾ:*",
    priceInfo: "💰 *{name}*\n\n• വില: ₹{price}\n• വിഭാഗം: {category}\n• കോഡ്: #{id}\n\n🛒 കാർട്ടിൽ ചേർക്കാൻ \"*{name} ചേർക്കുക*\" എന്ന് മറുപടി നൽകുക",
    searchResults: "🔍 \"{query}\" നായി {count} ഉൽപ്പന്നങ്ങൾ കണ്ടെത്തി:",
    cart: "🛒 *നിങ്ങളുടെ കാർട്ട്:*\n\n{items}\n\n💰 *ആകെ: ₹{total}*\n\nഓർഡർ ചെയ്യാൻ \"*ചെക്ക്ഔട്ട്*\" എന്ന് മറുപടി നൽകുക",
    orderPlaced: "✅ *ഓർഡർ സ്ഥിരീകരിച്ചു!*\n\nഓർഡർ ID: #{orderId}\nആകെ: ₹{total}\n\nഡെലിവറി വിവരങ്ങൾക്കായി ഉടൻ ബന്ധപ്പെടും! 📞"
  },
  hi: {
    welcome: "🛍️ *रोज़ केमिकल्स में आपका स्वागत है!*\n\nकृपया अपनी पसंदीदा भाषा चुनें:",
    languageMenu: "🌐 *भाषा चुनें:*\n\n1️⃣ English\n2️⃣ தமிழ் (Tamil)\n3️⃣ తెలుగు (Telugu)\n4️⃣ ಕನ್ನಡ (Kannada)\n5️⃣ മലയാളം (Malayalam)\n6️⃣ हिंदी (Hindi)\n\nनंबर के साथ जवाब दें (1-6)",
    greeting: "नमस्ते! 🛍️ रोज़ केमिकल्स में आपका स्वागत है!\n\n✨ *हमारे उत्पाद:*\n• रसायन और कच्चे माल\n• सफाई के उत्पाद\n• इत्र और सुगंध\n• ब्रश और उपकरण\n\n🔍 *पूछ सकते हैं:*\n• \"सफाई के उत्पाद दिखाएं\"\n• \"एसिटिक एसिड की कीमत क्या है?\"\n• \"इत्र\"\n• \"श्रेणियां\"",
    noResults: "❌ \"{query}\" के लिए उत्पाद नहीं मिले\n\n💡 *कोशिश करें:*\n• अलग शब्द\n• वर्तनी जांचें\n• \"श्रेणियां\" देखें\n• \"सहायता\" मांगें",
    help: "🤖 *कैसे मदद कर सकते हैं?*\n\n🛒 *खरीदारी:*\n• श्रेणियां देखें\n• उत्पाद खोजें\n• कीमतें जानें\n• ऑर्डर करें",
    categories: "📂 *हमारी श्रेणियां:*",
    priceInfo: "💰 *{name}*\n\n• कीमत: ₹{price}\n• श्रेणी: {category}\n• कोड: #{id}\n\n🛒 कार्ट में जोड़ने के लिए \"*{name} जोड़ें*\" का जवाब दें",
    searchResults: "🔍 \"{query}\" के लिए {count} उत्पाद मिले:",
    cart: "🛒 *आपका कार्ट:*\n\n{items}\n\n💰 *कुल: ₹{total}*\n\nऑर्डर करने के लिए \"*चेकआउट*\" का जवाब दें",
    orderPlaced: "✅ *ऑर्डर की पुष्टि!*\n\nऑर्डर ID: #{orderId}\nकुल: ₹{total}\n\nडिलीवरी विवरण के लिए जल्द संपर्क करेंगे! 📞"
  }
};

// Session management functions
function getUserSession(phoneNumber) {
  if (!userSessions.has(phoneNumber)) {
    userSessions.set(phoneNumber, {
      language: null,
      cart: [],
      lastActivity: new Date(),
      isFirstMessage: true
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
  
  // Replace variables in translation
  Object.keys(vars).forEach(varKey => {
    text = text.replace(`{${varKey}}`, vars[varKey]);
  });
  
  return text;
}

function detectLanguageFromNumber(message) {
  const langMap = {
    '1': 'en',
    '2': 'ta', 
    '3': 'te',
    '4': 'kn',
    '5': 'ml',
    '6': 'hi'
  };
  return langMap[message.trim()] || null;
}

// Message logging function
function logMessage(direction, from, to, body, messageId = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    direction, // 'incoming' or 'outgoing'
    from,
    to,
    body,
    messageId,
    bodyLength: body ? body.length : 0
  };
  
  console.log(`📱 ${direction.toUpperCase()} MESSAGE:`, JSON.stringify(logEntry, null, 2));
  
  // Optional: Save to file for persistence
  try {
    const logFile = path.join(__dirname, 'message_logs.txt');
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('⚠️ Failed to write to log file:', error);
  }
}

// Helper function to detect language selection from number
function detectLanguageFromNumber(message) {
  const languageMap = {
    '1': 'en',
    '2': 'hi', 
    '3': 'bn',
    '4': 'ta',
    '5': 'te',
    '6': 'kn'
  };
  
  // Check if message is just a number
  const trimmed = message.trim();
  if (/^[1-6]$/.test(trimmed)) {
    return languageMap[trimmed];
  }
  
  // Check if message contains language keywords
  if (message.includes('english') || message.includes('1')) return 'en';
  if (message.includes('hindi') || message.includes('हिंदी') || message.includes('2')) return 'hi';
  if (message.includes('bengali') || message.includes('বাংলা') || message.includes('3')) return 'bn';
  if (message.includes('tamil') || message.includes('தமிழ்') || message.includes('4')) return 'ta';
  if (message.includes('telugu') || message.includes('తెలుగు') || message.includes('5')) return 'te';
  if (message.includes('kannada') || message.includes('ಕನ್ನಡ') || message.includes('6')) return 'kn';
  
  return null;
}

// Enhanced intent recognition function with conversation detection
function detectIntent(message) {
  const msg = message.toLowerCase().trim();
  const words = msg.split(/\s+/);
  
  // Keywords for different intents
  const greetingKeywords = ['hi', 'hello', 'hey', 'hii', 'helo', 'good', 'morning', 'afternoon', 'evening', 'namaste', 'vanakkam', 'adaab', 'salaam'];
  const searchKeywords = ['have', 'show', 'find', 'get', 'need', 'want', 'looking', 'search', 'browse', 'available', 'sell', 'stock'];
  const priceKeywords = ['price', 'cost', 'rate', 'much', 'expensive', 'cheap', 'value', 'amount', 'daam', 'paisa'];
  const helpKeywords = ['help', 'assist', 'guide', 'support'];
  const thanksKeywords = ['thank', 'thanks', 'appreciate', 'great', 'good', 'nice', 'excellent', 'perfect'];
  
  // Conversation/Question keywords
  const questionKeywords = ['does', 'is', 'can', 'will', 'how', 'what', 'which', 'when', 'where', 'why', 
                           'color', 'colour', 'water', 'mix', 'dilute', 'use', 'safe', 'compatible',
                           'recipe', 'make', 'prepare', 'ingredients', 'steps', 'process',
                           'क्या', 'कैसे', 'कौन', 'कब', 'कहाँ', 'रंग', 'पानी', 'मिला', 'उपयोग'];
  
  // Enhanced product terms for better detection
  const productTerms = [
    'acid', 'chemical', 'brush', 'cleaner', 'perfume', 'oil', 'powder', 
    'soap', 'detergent', 'fragrance', 'bottle', 'container', 'solution',
    'liquid', 'spray', 'cream', 'gel', 'paste', 'thinner', 'solvent',
    'fabric', 'conditioner', 'softener', 'dish', 'wash', 'floor', 
    'phenyl', 'compound', 'kit', 'ultra', 'smart'
  ];
  
  // DIY Kit specific terms
  const diyKitTerms = [
    'fabric conditioner', 'liquid detergent', 'dish wash', 'floor cleaner',
    'soap oil', 'phenyl compound', 'washing gel', 'cleaning kit'
  ];
  
  // Function to check if any keyword exists in message
  const hasKeyword = (keywords) => keywords.some(keyword => msg.includes(keyword));
  
  // Check if message contains DIY kit terms
  const hasDIYKitTerms = diyKitTerms.some(term => msg.includes(term));
  
  // Check if message is in question format
  const isQuestion = msg.includes('?') || 
                    msg.startsWith('do ') || 
                    msg.startsWith('can ') || 
                    msg.startsWith('is ') || 
                    msg.startsWith('are ') ||
                    msg.startsWith('what ') ||
                    msg.startsWith('where ') ||
                    msg.startsWith('how ') ||
                    msg.startsWith('does ');
  
  // Check for product indicators
  const hasProductTerms = productTerms.some(term => msg.includes(term));
  
  // Business/shopping terms
  const businessTerms = ['buy', 'purchase', 'order', 'deliver', 'quality', 'brand', 'size', 'quantity'];
  const hasBusinessTerms = businessTerms.some(term => msg.includes(term));
  
  console.log(`🔍 Analyzing: "${msg}" | Question: ${isQuestion} | ProductTerms: ${hasProductTerms} | DIYKits: ${hasDIYKitTerms} | BusinessTerms: ${hasBusinessTerms}`);
  
  // GREETING DETECTION - Most specific first
  if (hasKeyword(greetingKeywords) && !hasKeyword(searchKeywords) && !hasProductTerms && !hasDIYKitTerms) {
    return { intent: 'greeting', entity: null };
  }
  
  // CONVERSATION/QUESTION DETECTION - Enhanced for recipes
  if (hasKeyword(questionKeywords) || isQuestion) {
    let entity = extractProductName(msg, questionKeywords.concat(['do', 'you', 'have', 'can', 'what', 'is', 'are', 'the', 'to']));
    return { intent: 'conversation', entity: entity };
  }
  
  // PRICE DETECTION 
  if (hasKeyword(priceKeywords)) {
    let entity = extractProductName(msg, priceKeywords.concat(['what', 'is', 'the', 'of', 'for', 'tell', 'me']));
    return { intent: 'price', entity: entity };
  }
  
  // DIRECT DIY KIT DETECTION - NEW: Handle direct product names
  if (hasDIYKitTerms) {
    let entity = msg; // Use the entire message as entity for DIY kits
    return { intent: 'search', entity: entity };
  }
  
  // SEARCH DETECTION - Very flexible
  if (hasKeyword(searchKeywords) || hasProductTerms || hasBusinessTerms) {
    let entity = extractProductName(msg, searchKeywords.concat(['do', 'you', 'me', 'any', 'some', 'i', 'we']));
    
    // If no clear entity but has product terms, use the product term
    if (!entity && hasProductTerms) {
      entity = productTerms.find(term => msg.includes(term));
    }
    
    // Last resort - use cleaned message
    if (!entity) {
      entity = msg.replace(/\b(do|you|have|can|i|get|show|me|what|is|are|the)\b/g, '').trim();
      if (entity.length < 2) entity = null;
    }
    
    return { intent: 'search', entity: entity };
  }
  
  // HELP DETECTION
  if (hasKeyword(helpKeywords)) {
    return { intent: 'help', entity: null };
  }
  
  // THANKS DETECTION
  if (hasKeyword(thanksKeywords)) {
    return { intent: 'thanks', entity: null };
  }
  
  // Enhanced fallback logic for product names
  if (words.length >= 1) {
    // Check if the message contains any known product terms
    if (hasProductTerms || words.length === 2) {
      return { intent: 'search', entity: msg };
    }
  }
  
  // Single word that might be a product
  if (words.length === 1 && words[0].length > 2) {
    return { intent: 'search', entity: words[0] };
  }
  
  return { intent: 'unknown', entity: null };
}

// Helper function to extract product name
function extractProductName(message, wordsToRemove) {
  let words = message.toLowerCase().split(/\s+/);
  
  // Remove common words including those passed in
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
                     'can', 'you', 'show', 'me', 'some', 'any', 'what', 'are', 'is', 'do', 'have', 'got',
                     'find', 'get', 'need', 'want', 'looking', 'search', 'browse', 'available', 'sell', 'stock']
    .concat(wordsToRemove || []);
  
  words = words.filter(word => !stopWords.includes(word) && word.length > 1);
  
  return words.length > 0 ? words.join(' ') : null;
}

// Category patterns helper
function detectCategoryRequest(message) {
  const categoryPatterns = [
    /\b(categories|category|types|products|items|menu|options)\b/i,
    /what do you sell/i,
    /show.*all/i,
    /list.*products/i
  ];
  
  return categoryPatterns.some(pattern => pattern.test(message));
}

// Function to search for products using enhanced knowledge base
async function searchProducts(query) {
  try {
    console.log(`🔍 Searching for: "${query}"`);
    
    // First, check the enhanced knowledge base for detailed information
    const knowledgeResponse = getProductKnowledge(query);
    if (knowledgeResponse) {
      console.log(`🧠 Found detailed knowledge for: "${query}"`);
      return {
        type: 'conversation',
        response: knowledgeResponse
      };
    }
    
    // Fallback to regular product search
    const results = await fallbackSearch(query);
    console.log(`📊 Found ${results.length} products in basic search`);
    
    return {
      type: 'search',
      results: results
    };
    
  } catch (error) {
    console.error('❌ Search error:', error);
    return { type: 'search', results: [] };
  }
}

// Function to handle product conversations using Sarvam-1
async function handleConversation(question, productContext = null) {
  try {
    console.log(`💬 Conversation for: "${question}"`);
    
    const response = await fetch('http://localhost:5000/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        product_context: productContext
      })
    });

    if (!response.ok) {
      throw new Error(`Conversation service error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
    
  } catch (error) {
    console.error('🚫 Conversation service error:', error);
    return getFallbackConversationResponse(question);
  }
}

// Get detailed product information from knowledge base
function getProductKnowledge(productName, questionType = null) {
  try {
    const productKey = productName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_');
    
    // Search in knowledge base
    for (const [key, product] of Object.entries(productsKnowledge.products_knowledge || {})) {
      if (key.includes(productKey) || 
          product.name.toLowerCase().includes(productName.toLowerCase()) ||
          (product.keywords && product.keywords.some(k => k.includes(productName.toLowerCase())))) {
        
        // Return specific information based on question type
        if (questionType) {
          return getSpecificKnowledge(product, questionType);
        }
        
        // Return general product info
        return formatProductKnowledge(product);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return null;
  }
}

// Get specific knowledge based on question type
function getSpecificKnowledge(product, questionType) {
  const qt = questionType.toLowerCase();
  
  if (qt.includes('recipe') || qt.includes('how to make') || qt.includes('prepare')) {
    return formatRecipe(product);
  }
  
  if (qt.includes('price') || qt.includes('cost')) {
    return formatPriceInfo(product);
  }
  
  if (qt.includes('ingredients') || qt.includes('what needed')) {
    return formatIngredients(product);
  }
  
  if (qt.includes('water') || qt.includes('mix') || qt.includes('ratio')) {
    return formatMixingInstructions(product);
  }
  
  if (qt.includes('color') || qt.includes('colours')) {
    return formatColorInfo(product);
  }
  
  if (qt.includes('time') || qt.includes('duration')) {
    return formatTimeInfo(product);
  }
  
  return formatProductKnowledge(product);
}

// Format complete recipe
function formatRecipe(product) {
  if (!product.recipe) return null;
  
  let response = `🧪 **${product.name} Recipe**\n\n`;
  response += `💰 **Cost**: ₹${product.price.kit_price} (Makes ${product.price.yield})\n`;
  response += `⏱️ **Time**: ${product.recipe.preparation_time}\n`;
  response += `📊 **Difficulty**: ${product.recipe.difficulty}\n\n`;
  
  response += "📋 **Step-by-step Instructions:**\n\n";
  
  product.recipe.steps.forEach(step => {
    response += `**Step ${step.step}: ${step.title}**\n`;
    response += `${step.instruction}\n`;
    if (step.tip) response += `💡 *Tip: ${step.tip}*\n`;
    response += `⏰ Time: ${step.time}\n\n`;
  });
  
  response += `✅ **Final Result**: ${product.recipe.final_result}\n\n`;
  response += "❓ Need more details? Ask me about ingredients, equipment, or troubleshooting!";
  
  return response;
}

// Format price information
function formatPriceInfo(product) {
  if (!product.price) return null;
  
  let response = `💰 **${product.name} - Price Details**\n\n`;
  response += `🛒 **Kit Price**: ₹${product.price.kit_price}\n`;
  response += `📦 **Yield**: ${product.price.yield}\n`;
  response += `💧 **Cost per Liter**: ₹${product.price.cost_per_liter}\n\n`;
  
  if (product.business_info) {
    response += `📈 **Business Info**:\n`;
    response += `• Profit Margin: ${product.business_info.profit_margin}\n`;
    response += `• Market Demand: ${product.business_info.market_demand}\n`;
    response += `• Competition: ${product.business_info.competition}\n\n`;
  }
  
  response += "💡 Great for starting your own fabric conditioner business!";
  return response;
}

// Format ingredients
function formatIngredients(product) {
  if (!product.ingredients) return null;
  
  let response = `🧪 **${product.name} - Required Items**\n\n`;
  
  response += "📦 **Ingredients:**\n";
  product.ingredients.forEach(ing => {
    const status = ing.included ? "✅" : "❗";
    response += `${status} ${ing.name} - ${ing.quantity}\n`;
    if (ing.note) response += `   ℹ️ ${ing.note}\n`;
  });
  
  if (product.equipment_needed) {
    response += "\n🛠️ **Equipment Needed:**\n";
    product.equipment_needed.forEach(eq => {
      const status = eq.included ? "✅" : "❗";
      response += `${status} ${eq.name}`;
      if (eq.capacity) response += ` (${eq.capacity})`;
      if (eq.purpose) response += ` - ${eq.purpose}`;
      response += "\n";
    });
  }
  
  response += "\n💡 Items marked with ❗ need to be arranged by you.";
  return response;
}

// Format mixing instructions
function formatMixingInstructions(product) {
  if (!product.recipe) return null;
  
  let response = `💧 **${product.name} - Water & Mixing Guide**\n\n`;
  
  // Find water-related steps
  const waterSteps = product.recipe.steps.filter(step => 
    step.instruction.toLowerCase().includes('water') || 
    step.instruction.toLowerCase().includes('mix')
  );
  
  if (waterSteps.length > 0) {
    response += "🌊 **Water Requirements:**\n";
    waterSteps.forEach(step => {
      response += `• **${step.title}**: ${step.instruction}\n`;
      if (step.tip) response += `  💡 ${step.tip}\n`;
    });
  }
  
  // Add general water info
  const waterIngredient = product.ingredients.find(ing => 
    ing.name.toLowerCase().includes('water')
  );
  
  if (waterIngredient) {
    response += `\n📊 **Total Water Needed**: ${waterIngredient.quantity}\n`;
  }
  
  response += "\n⚠️ Always use RO (purified) water for best results!";
  return response;
}

// Format color information
function formatColorInfo(product) {
  if (!product.recipe) return null;
  
  let response = `🌈 **${product.name} - Color Information**\n\n`;
  
  // Find color-related steps
  const colorSteps = product.recipe.steps.filter(step => 
    step.instruction.toLowerCase().includes('color') || 
    step.instruction.toLowerCase().includes('powder')
  );
  
  if (colorSteps.length > 0) {
    response += "🎨 **Color Steps:**\n";
    colorSteps.forEach(step => {
      response += `• **${step.title}**: ${step.instruction}\n`;
      if (step.tip) response += `  💡 ${step.tip}\n`;
    });
  }
  
  // Check for color-related ingredients
  const colorIngredients = product.ingredients.filter(ing => 
    ing.name.toLowerCase().includes('color') || 
    ing.name.toLowerCase().includes('powder')
  );
  
  if (colorIngredients.length > 0) {
    response += "\n🧪 **Color Ingredients:**\n";
    colorIngredients.forEach(ing => {
      response += `• ${ing.name} - ${ing.quantity}\n`;
      if (ing.note) response += `  ℹ️ ${ing.note}\n`;
    });
  }
  
  response += "\n🎨 You can choose from various attractive colors for your fabric conditioner!";
  return response;
}

// Format time information
function formatTimeInfo(product) {
  if (!product.recipe) return null;
  
  let response = `⏰ **${product.name} - Time Guide**\n\n`;
  response += `📊 **Total Preparation Time**: ${product.recipe.preparation_time}\n\n`;
  
  response += "⏱️ **Step-by-step Timing:**\n";
  product.recipe.steps.forEach(step => {
    response += `• **${step.title}**: ${step.time}\n`;
  });
  
  response += "\n💡 **Important**: Follow timing carefully for best results!";
  return response;
}

// Format general product knowledge
function formatProductKnowledge(product) {
  let response = `📋 **${product.name}**\n\n`;
  response += `${product.description}\n\n`;
  
  if (product.price) {
    response += `💰 **Price**: ₹${product.price.kit_price} (Makes ${product.price.yield})\n\n`;
  }
  
  response += "❓ **Ask me about:**\n";
  response += "• Recipe and instructions\n";
  response += "• Ingredients needed\n";
  response += "• Water and mixing ratios\n";
  response += "• Price and business info\n";
  response += "• Troubleshooting tips\n\n";
  
  response += "💬 Try asking: *How to make fabric conditioner?* or *What ingredients needed?*";
  
  return response;
}

// Fallback conversation responses
function getFallbackConversationResponse(question) {
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes('color') || questionLower.includes('colour') || questionLower.includes('रंग')) {
    return "हमारे उत्पाद विभिन्न रंगों में उपलब्ध हैं। कृपया विशिष्ट रंग की जानकारी के लिए हमसे संपर्क करें।\n\nOur products are available in various colors. Please contact us for specific color information.";
  }
  
  if (questionLower.includes('water') || questionLower.includes('mix') || questionLower.includes('पानी')) {
    return "मिश्रण के अनुपात के लिए कृपया उत्पाद लेबल देखें या हमारी टीम से संपर्क करें।\n\nFor mixing ratios, please check the product label or contact our team.";
  }
  
  if (questionLower.includes('use') || questionLower.includes('how') || questionLower.includes('उपयोग')) {
    return "उपयोग की विधि के लिए कृपया उत्पाद के निर्देश देखें या हमसे पूछें।\n\nFor usage instructions, please check the product directions or ask us.";
  }
  
  if (questionLower.includes('safe') || questionLower.includes('compatible') || questionLower.includes('सुरक्षित')) {
    return "सुरक्षा जानकारी के लिए कृपया उत्पाद की सुरक्षा शीट देखें या हमारी टीम से संपर्क करें।\n\nFor safety information, please check the product safety sheet or contact our team.";
  }
  
  return "आपके प्रश्न के लिए धन्यवाद! विस्तृत जानकारी के लिए कृपया हमारी कस्टमर सर्विस टीम से संपर्क करें।\n\nThank you for your question! For detailed information, please contact our customer service team.";
}

// Fallback search function (original logic)
function fallbackSearch(query) {
  const results = [];
  let searchTerm = query.toLowerCase().trim();
  
  // Enhanced plural forms and common variations
  const pluralMappings = {
    'brushes': 'brush',
    'brooms': 'broom', 
    'detergents': 'detergent',
    'chemicals': 'chemical',
    'acids': 'acid',
    'soaps': 'soap',
    'phenyles': 'phenyl',
    'phenylees': 'phenyl',
    'bottles': 'bottle',
    'containers': 'container',
    'products': 'product',
    'cleaning products': 'cleaning',
    'cleaning': 'clean',
    'perfumes': 'perfume',
    'fragrances': 'fragrance',
    'scents': 'scent',
    'oils': 'oil',
    'liquids': 'liquid',
    'powders': 'powder',
    'cleaners': 'cleaner'
  };
  
  // Common synonyms and alternative names
  const synonymMappings = {
    'soap': ['detergent', 'washing', 'clean'],
    'acid': ['chemical', 'solution'],
    'phenyl': ['disinfectant', 'floor cleaner', 'antiseptic'],
    'perfume': ['fragrance', 'scent', 'attar'],
    'brush': ['cleaning tool', 'scrubber'],
    'broom': ['jhadu', 'sweeper'],
    'thickner': ['thickening', 'thick', 'viscosity'],
    'detergent': ['soap', 'washing powder', 'surf'],
    'cleaner': ['cleaning agent', 'clean'],
    'disinfectant': ['antiseptic', 'sanitizer', 'germicide']
  };
  
  // Check if the search term has a plural mapping
  const singularTerm = pluralMappings[searchTerm] || searchTerm;
  
  console.log(`🔍 Fallback search for: "${searchTerm}" (mapped to: "${singularTerm}")`);
  
  for (const categoryKey in products.categories) {
    const category = products.categories[categoryKey];
    for (const product of category.products) {
      const productName = product.name.toLowerCase();
      let isMatch = false;
      
      // Check for exact match with original term or mapped term
      if (productName.includes(searchTerm) || productName.includes(singularTerm)) {
        isMatch = true;
      }
      
      // Check synonyms
      if (!isMatch && synonymMappings[searchTerm]) {
        for (const synonym of synonymMappings[searchTerm]) {
          if (productName.includes(synonym)) {
            isMatch = true;
            break;
          }
        }
      }
      
      // Check if any synonym maps to our search term
      if (!isMatch) {
        for (const [key, synonyms] of Object.entries(synonymMappings)) {
          if (synonyms.includes(searchTerm) && productName.includes(key)) {
            isMatch = true;
            break;
          }
        }
      }
      
      if (isMatch) {
        results.push({
          ...product,
          category: category.name
        });
      }
    }
  }
  
  console.log(`🔍 Fallback found ${results.length} products for search term: "${searchTerm}"`);
  return results;
}

// Function to get all categories
function getCategories(language = 'en') {
    const categories = [];
    for (const categoryKey in products.categories) {
        const categoryName = products.categories[categoryKey].name;
        const translatedCategoryName = getTranslation(language, `category_${categoryKey}`, { default: categoryName });
        categories.push(`${categories.length + 1}. ${translatedCategoryName}`);
    }
    
    // Add translations for category names if they don't exist
    if (!translations[language].category_chemical_raw_materials) {
        translations.en.category_chemical_raw_materials = "Chemical - Raw Materials";
        translations.ta.category_chemical_raw_materials = "ரசாயன - மூலப்பொருட்கள்";
        translations.te.category_chemical_raw_materials = "రసాయన - ముడి పదార్థాలు";
        translations.kn.category_chemical_raw_materials = "ರಾಸಾಯನಿಕ - ಕಚ್ಚಾ ಸಾಮಗ್ರಿಗಳು";
        translations.ml.category_chemical_raw_materials = "രാസ - അസംസ്കൃത വസ്തുക്കൾ";
        translations.hi.category_chemical_raw_materials = "रासायनिक - कच्चा माल";
    }

    return categories.join('\n');
}

// Add homepage route
app.get('/', (req, res) => {
  res.send(`
    <h1>WhatsApp Product Bot</h1>
    <p>Bot is running successfully! 🎉</p>
    <p>Send messages to your WhatsApp number to interact with the bot.</p>
    <p>Available commands:</p>
    <ul>
      <li><strong>categories</strong> - View all product categories</li>
      <li><strong>search [product name]</strong> - Search for specific products</li>
      <li><strong>price [product name]</strong> - Get product price (inclusive of 18% GST)</li>
      <li><strong>help</strong> - Show available commands</li>
    </ul>
    <hr>
    <h3>Webhook Status</h3>
    <p>✅ Server is ready to receive WhatsApp messages</p>
    <p>📱 Webhook URL: <code>${req.protocol}://${req.get('host')}/whatsapp</code></p>
    <p>🔍 Test webhook: <a href="/webhook-test">Run Test</a></p>
  `);
});

// Webhook verification endpoint (required by Twilio)
app.get('/whatsapp', (req, res) => {
  console.log('🔍 Webhook verification request received');
  console.log('Query params:', req.query);
  
  // Respond with 200 for webhook verification
  res.status(200).send('Webhook verified successfully');
});

// Test endpoint for knowledge base
app.get('/test-knowledge', (req, res) => {
  const query = req.query.q || 'fabric conditioner';
  const questionType = req.query.type || null;
  
  console.log(`🧪 Testing knowledge base with query: "${query}", type: "${questionType}"`);
  
  const result = getProductKnowledge(query, questionType);
  
  res.json({
    query: query,
    questionType: questionType,
    result: result,
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for webhook validation
app.get('/webhook-test', (req, res) => {
  const testData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Webhook endpoint is working correctly',
    products_loaded: Object.keys(products).length > 0,
    total_products: Object.values(products.categories || {}).reduce((sum, category) => sum + (category.products?.length || 0), 0)
  };
  
  res.json(testData);
});

// WhatsApp webhook - Enhanced E-commerce Bot
app.post('/whatsapp', async (req, res) => {
  try {
    // Extract Twilio webhook data
    const {
      Body: messageBody,
      From: senderNumber,
      To: recipientNumber,
      MessageSid: messageId,
      ProfileName: senderName,
      WaId: whatsappId,
      NumMedia: mediaCount,
      MediaContentType0: mediaType,
      MediaUrl0: mediaUrl
    } = req.body;

    // Enhanced logging to debug
    console.log('\n🔵 INCOMING WHATSAPP MESSAGE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 From: ${senderNumber} (${senderName || 'Unknown'})`);
    console.log(`📱 Message: "${messageBody}"`);
    console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
    console.log(`📄 Full Request Body:`, JSON.stringify(req.body, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    logMessage('incoming', senderNumber, recipientNumber, messageBody, messageId);

    // Validate message body
    if (!messageBody || messageBody.trim() === '') {
      const twiml = new MessagingResponse();
      twiml.message('I received your message, but it appears to be empty. Please send a text message to get started! 😊');
      logMessage('outgoing', recipientNumber, senderNumber, 'Empty message response');
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      return res.end(twiml.toString());
    }

    // Handle media messages
    if (mediaCount > 0) {
      const twiml = new MessagingResponse();
      twiml.message('Thank you for sharing media! Currently, I can only process text messages. Please describe what you\'re looking for in text. 📝');
      logMessage('outgoing', recipientNumber, senderNumber, 'Media not supported response');
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      return res.end(twiml.toString());
    }

    // Get user session
    const session = getUserSession(senderNumber);
    const twiml = new MessagingResponse();
    const incomingMessage = messageBody.toLowerCase().trim();
    let responseMessage = '';

    console.log(`🔄 Processing message: "${incomingMessage}"`);
    console.log(`👤 User session: Language=${session.language}, First=${session.isFirstMessage}, Cart=${session.cart.length} items`);

    // For testing purposes, if message starts with "test:", skip language selection
    if (incomingMessage.startsWith('test:')) {
      const testMessage = incomingMessage.replace('test:', '').trim();
      if (!session.language) {
        updateUserSession(senderNumber, { language: 'en', isFirstMessage: false });
      }
      const { intent, entity } = detectIntent(testMessage);
      console.log(`🧪 TEST MODE - Detected intent: "${intent}", entity: "${entity}"`);
      
      switch (intent) {
        case 'greeting':
          responseMessage = getTranslation(session.language, 'greetingResponse');
          break;
        case 'search':
          if (entity) {
            const results = await searchProducts(entity);
            if (results.length > 0) {
              responseMessage = getTranslation(session.language, 'searchResults', {
                count: results.length,
                query: entity
              }) + '\n\n';
              
              // Display all results
              results.forEach((product, index) => {
                responseMessage += `${index + 1}. *${product.name}*\n   💰 ₹${product.mrp} | 📂 ${product.category}\n   🛒 Add: "*Add ${product.name}*"\n\n`;
              });
            } else {
              responseMessage = getTranslation(session.language, 'noResults', { query: entity });
            }
          }
          break;
        default:
          responseMessage = getTranslation(session.language, 'unknownQuery');
      }
    }
    // First time user - show language selection
    else if (session.isFirstMessage) {
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
    // Handle cart commands
    else if (incomingMessage.startsWith('add ') || incomingMessage.includes('जोड़ें') || incomingMessage.includes('சேர்') || incomingMessage.includes('జోడించు') || incomingMessage.includes('ಸೇರಿಸಿ') || incomingMessage.includes('ചേർക്കുക')) {
      // Extract product name for adding to cart
      let productName = incomingMessage.replace(/^add\s+/i, '').replace(/\s*(जोड़ें|சேர்|జోడించు|ಸೇರಿಸಿ|ചേർക്കുക)\s*$/i, '').trim();
      const results = await searchProducts(productName);
      
      if (results.length > 0) {
        const product = results[0];
        session.cart.push(product);
        updateUserSession(senderNumber, { cart: session.cart });
        
        responseMessage = `✅ Added to cart: *${product.name}*\n\n🛒 Cart items: ${session.cart.length}\n💰 Cart total: ₹${session.cart.reduce((sum, item) => sum + item.mrp, 0)}\n\nReply "*Cart*" to view cart or "*Checkout*" to place order`;
      } else {
        responseMessage = getTranslation(session.language, 'noResults', { query: productName });
      }
    }
    // View cart
    else if (/^(cart|कार्ट|கார்ட்|కార్ట్|ಕಾರ್ಟ್|കാർട്ട്)$/i.test(incomingMessage)) {
      if (session.cart.length === 0) {
        responseMessage = '🛒 Your cart is empty!\n\nBrowse products and add items by saying "*Add [product name]*"';
      } else {
        const cartItems = session.cart.map((item, index) => 
          `${index + 1}. ${item.name}\n   Price: ₹${item.mrp}`
        ).join('\n\n');
        const total = session.cart.reduce((sum, item) => sum + item.mrp, 0);
        
        responseMessage = getTranslation(session.language, 'cart', {
          items: cartItems,
          total: total
        });
      }
    }
    // Checkout
    else if (/^(checkout|चेकआउट|செக்அவுட்|చెక్అవుట్|ಚೆಕ್‌ಔಟ್|ചെക്ക്ഔട്ട്)$/i.test(incomingMessage)) {
      if (session.cart.length === 0) {
        responseMessage = '🛒 Your cart is empty! Please add some products first.';
      } else {
        const orderId = Math.floor(Math.random() * 900000) + 100000;
        const total = session.cart.reduce((sum, item) => sum + item.mrp, 0);
        
        responseMessage = getTranslation(session.language, 'orderPlaced', {
          orderId: orderId,
          total: total
        });
        
        // Clear cart after order
        updateUserSession(senderNumber, { cart: [] });
      }
    }
    // Handle regular queries
    else {
      const { intent, entity } = detectIntent(incomingMessage);
      console.log(`🧠 Detected intent: "${intent}", entity: "${entity}"`);
      
      switch (intent) {
        case 'greeting':
          responseMessage = getTranslation(session.language, 'greetingResponse');
          break;
          
        case 'thanks':
          responseMessage = getTranslation(session.language, 'thanksResponse');
          break;
          
        case 'price':
          if (entity) {
            const results = await searchProducts(entity);
            if (results.length > 0) {
              const product = results[0];
              responseMessage = getTranslation(session.language, 'priceInfo', {
                name: product.name,
                price: product.mrp,
                category: product.category,
                id: product.id
              });
            } else {
              responseMessage = getTranslation(session.language, 'noResults', { query: entity });
            }
          } else {
            responseMessage = getTranslation(session.language, 'help');
          }
          break;
          
        case 'search':
          if (entity) {
            // First check knowledge base for detailed information
            const knowledgeResponse = getProductKnowledge(entity, incomingMessage);
            
            if (knowledgeResponse) {
              responseMessage = knowledgeResponse;
            } else {
              // Fallback to regular product search
              const searchResult = await searchProducts(entity);
              
              if (searchResult.type === 'conversation') {
                // Handle conversation response
                responseMessage = searchResult.response;
              } else if (searchResult.results && searchResult.results.length > 0) {
                // Handle search results
                const results = searchResult.results;
                responseMessage = getTranslation(session.language, 'searchResults', {
                  count: results.length,
                  query: entity
                }) + '\n\n';
                
                // Show all results (as requested)
                results.forEach((product, index) => {
                  responseMessage += `${index + 1}. *${product.name}*\n   💰 ₹${product.mrp} | 📂 ${product.category}\n   🛒 Add: "*Add ${product.name}*"\n\n`;
                });
                
                if (results.length > 10) {
                  responseMessage += `📋 *Showing all ${results.length} results*\n\n💡 *Tip:* Use more specific keywords to narrow your search.`;
                }
              } else {
                responseMessage = getTranslation(session.language, 'noResults', { query: entity });
              }
            }
          } else {
            responseMessage = getTranslation(session.language, 'help');
          }
          break;
          
        case 'conversation':
          // Handle product questions and conversations
          if (entity) {
            // First check knowledge base for detailed information
            const knowledgeResponse = getProductKnowledge(entity, incomingMessage);
            
            if (knowledgeResponse) {
              responseMessage = knowledgeResponse;
            } else {
              responseMessage = await handleConversation(incomingMessage, entity);
            }
            // Store last searched product for context
            updateUserSession(senderNumber, { lastSearchedProduct: entity });
          } else {
            responseMessage = getFallbackConversationResponse(incomingMessage);
          }
          break;
          
        case 'categories':
          responseMessage = getTranslation(session.language, 'categories') + '\n\n' + getCategories(session.language);
          break;
          
        case 'help':
          responseMessage = getTranslation(session.language, 'help');
          break;
          
        case 'unknown':
        default:
          responseMessage = getTranslation(session.language, 'unknownQuery');
          break;
      }
    }

    // Always ensure we have a response
    if (!responseMessage || responseMessage.trim() === '') {
      responseMessage = getTranslation(session.g.language || 'en', 'help');
    }
    
    console.log(`\n🟢 OUTGOING RESPONSE (${session.language || 'en'}):`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📤 Response: "${responseMessage}"`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    logMessage('outgoing', recipientNumber, senderNumber, responseMessage);
    
    twiml.message(responseMessage);
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
    
  } catch (error) {
    console.error('\n❌ ERROR processing WhatsApp message:', error);
    
    const twiml = new MessagingResponse();
    twiml.message('Sorry, I encountered an error. Please try again or contact support. 🙏');
    
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('\n🚀 WhatsApp Bot Server Starting...');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`📱 Webhook endpoint: http://localhost:${PORT}/whatsapp`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/webhook-test`);
  console.log(`📊 Products loaded: ${Object.keys(products).length > 0 ? '✅' : '❌'}`);
  
  if (Object.keys(products).length > 0) {
    const totalProducts = Object.values(products.categories || {}).reduce((sum, category) => sum + (category.products?.length || 0), 0);
    console.log(`📦 Total products in database: ${totalProducts}`);
    console.log(`📂 Categories available: ${Object.keys(products.categories || {}).length}`);
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎯 Ready to receive WhatsApp messages!');
  console.log('💡 Make sure your ngrok tunnel is pointing to this server');
  console.log('📞 Configure Twilio webhook URL with your ngrok URL + /whatsapp');
  console.log('═══════════════════════════════════════════════════════════════\n');
});
