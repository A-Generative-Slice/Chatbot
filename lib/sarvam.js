const axios = require('axios');
const { searchProducts, formatProductList, getPopularProducts } = require('./productSearch');
const { detectIntent, getContextualResponse, getTrainingResponse } = require('./intentDetection');

const generateResponse = async (message, language = 'en-IN', chatHistory = [], userPhoneNumber = '') => {
    try {
        const langNames = {
            'en-IN': 'English', 'ta-IN': 'Tamil', 'hi-IN': 'Hindi',
            'ml-IN': 'Malayalam', 'te-IN': 'Telugu', 'kn-IN': 'Kannada'
        };
        const targetLang = langNames[language] || 'English';

        // Detect user intent for better context
        const intent = detectIntent(message);
        console.log(`Intent detected: ${intent} for message: "${message.substring(0, 50)}..."`);

        // Special handling for specific product category queries
        if (intent === 'broom_inquiry' || intent === 'brush_inquiry' || intent === 'mop_inquiry' ||
            intent === 'wiper_inquiry' || intent === 'cleaning_tools_inquiry') {
            const categoryProducts = await searchProducts(message, intent, 15);

            if (categoryProducts.length > 0) {
                return formatCategoryResponse(intent, categoryProducts, targetLang);
            }
        }

        // Search for relevant products based on intent
        const relevantProducts = await searchProducts(message, intent, 5);
        console.log(`Found ${relevantProducts.length} relevant products for intent: ${intent}`);

        // Get training data response if available
        const trainingResponse = getTrainingResponse(intent, message);

        // Format product context
        let productContext = "";
        if (relevantProducts.length > 0) {
            productContext = formatProductList(relevantProducts, intent, language);
        } else {
            // Fallback to popular products
            const popularProducts = getPopularProducts(3);
            if (popularProducts.length > 0) {
                productContext = formatProductList(popularProducts, 'general', language);
            }
        }

        // Get contextual response template
        const contextualResponse = getContextualResponse(intent, relevantProducts);

        // Build conversation context
        const conversationContext = chatHistory.length > 0
            ? `Previous conversation: ${chatHistory.slice(-3).map(msg => `${msg.role}: ${msg.content.substring(0, 100)}`).join(' | ')}`
            : '';

        const systemPrompt = `
You are "Rose", the expert AI assistant for "Rose Chemicals" - India's leading cleaning product manufacturer.

CRITICAL RULES - READ CAREFULLY:
1. ❌ NEVER invent, hallucinate, or imagine products, prices, or details.
2. ❌ ONLY suggest products that appear in the "CURRENT RELEVANT PRODUCTS" list below.
3. ❌ If "CURRENT RELEVANT PRODUCTS" says "No specific products found", do not make up any products. Instead, suggest the user visit www.rosechemicals.in or ask for something else.
4. ❌ NEVER refer to your internal knowledge about cleaning products. Use ONLY the data provided in this prompt.
5. 📋 All prices, yields, and links MUST come directly from the provided search results.

COMPANY INFORMATION:
📍 Address: No.179, First Street, Tagore Nagar, Tiruppalai, Madurai – 625014, Tamil Nadu
📞 Contact: +91 8610570490
📧 Email: rosechemicalsindia@gmail.com
🌐 Website: www.rosechemicals.in
⏰ Working Hours: Monday-Saturday, 10:00 AM to 6:00 PM

USER CONTEXT:
- Detected Intent: ${intent}
- Language: ${targetLang}
- User Phone: ${userPhoneNumber.slice(-4)} (last 4 digits)
${conversationContext}

CURRENT RELEVANT PRODUCTS:
${productContext || "No specific products found for this query."}

${trainingResponse ? `TRAINING DATA REFERENCE:\n${JSON.stringify(trainingResponse, null, 2)}` : ''}

RESPONSE GUIDELINES:
1. 🌸 Be warm, helpful, and professional with appropriate emojis.
2. 📋 Provide specific details: exact prices, yields, and direct links if available.
3. 🗣️ Respond ONLY in ${targetLang} language.
4. 📞 Offer personal assistance (+91 8610570490) if you cannot find the exact information.
5. ✨ Keep responses concise and 100% accurate based on the search results.

REPLY FORMAT:
- If products are found: List them clearly. For EVERY product, you MUST include the 🔗 Product Link exactly as provided in the data. Do NOT skip the link.
- If no products match: "I'm sorry, I couldn't find a direct match for that on our website. Please check our categories at www.rosechemicals.in or call us for custom orders."
`;

        const response = await axios.post('https://api.sarvam.ai/v1/chat/completions', {
            model: "sarvam-m",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.4,
            max_tokens: 450
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SARVAM_API_KEY}`
            }
        });

        if (response.data?.choices?.[0]?.message?.content) {
            const aiResponse = response.data.choices[0].message.content;
            console.log(`AI Response generated successfully for intent: ${intent}`);
            return aiResponse;
        } else {
            console.error('Empty response from Sarvam AI');
            return generateFallbackResponse(intent, relevantProducts, language, message);
        }

    } catch (error) {
        console.error('Sarvam AI API Error:', error.response?.data || error.message);
        // Use 'general' intent if intent detection failed
        const safeIntent = typeof intent !== 'undefined' ? intent : 'general';
        return generateFallbackResponse(safeIntent, [], language, message);
    }
};

const generateFallbackResponse = (intent, products, language, originalMessage) => {
    const responses = {
        'en-IN': {
            'diy_kit_inquiry': `🌸 *Rose Chemicals DIY Kits*

Our popular manufacturing kits help you start your cleaning product business:

💡 *Top Kits:*
• Fabric Conditioner Kit - ₹1100 (makes 20L, cost: ₹55/L)
• Liquid Detergent Ultra - ₹1600 (makes 25L, cost: ₹64/L)
• Dish Wash Kit - ₹1200 (makes 20L, cost: ₹60/L)
• Floor Cleaner Kit - ₹1100 (makes 20L, cost: ₹55/L)

✨ *Each kit includes:*
- Complete formulation
- Step-by-step PDF guide
- Video tutorial with voice
- Technical support

🌸 *Available fragrances:* Moments, Blossom, Comfort, Magic

📞 *Contact:* +91 8610570490
🌐 *Website:* www.rosechemicals.in`,

            'franchise': `🏢 *Rose Chemicals Franchise Opportunity*

Start your cleaning product business with complete support!

✅ *What you get:*
• Proven formulations
• Complete training program
• Marketing materials
• Technical support
• Regional exclusivity options

💰 *Investment:* Varies by region and scale
📈 *ROI:* Excellent returns with proper execution

🔥 *Support includes:*
- Production setup assistance
- Quality control guidance
- Sales & marketing support
- Ongoing technical help

📞 *Apply now:* +91 8610570490
📧 *Email:* rosechemicalsindia@gmail.com`,

            'price_inquiry': `💰 *Rose Chemicals Price Range*

🔥 *Popular Products:*
• DIY Kits: ₹1100 - ₹2000 (includes complete formulation)
• Ready Products: ₹25 - ₹400
• Raw Materials: ₹121 - ₹2655

💡 *DIY Kit Benefits:*
- High profit margins
- Complete guidance provided
- Bulk pricing available

📞 *For detailed pricing:* +91 8610570490
🚚 *Free delivery* on orders above ₹5000`,

            'general': `🌸 *Welcome to Rose Chemicals!*

India's leading cleaning product manufacturer & franchise provider.

🏭 *Our Services:*
✅ DIY Product Manufacturing Kits
✅ Raw Chemical Materials
✅ Ready-to-use Products  
✅ Franchise Opportunities

💡 *Ask me about:*
• Product prices & details
• DIY kit information
• Franchise opportunities
• Technical support

📞 *Contact:* +91 8610570490
🌐 *Website:* www.rosechemicals.in
⏰ *Hours:* Mon-Sat, 10AM-6PM`
        }
    };

    const langResponses = responses[language] || responses['en-IN'];
    return langResponses[intent] || langResponses['general'];
};

const formatCategoryResponse = (intent, products, language = 'English') => {
    const categoryTemplates = {
        'broom_inquiry': {
            title: "🧹 **Our Broom Collection**",
            subtitle: "We have an extensive range of **traditional and modern brooms**:",
            emojis: { premium: "🌟", standard: "🔵", economy: "💰" }
        },
        'brush_inquiry': {
            title: "🧽 **Our Brush Collection**",
            subtitle: "Quality brushes for all your cleaning needs:",
            emojis: { toilet: "🚽", kitchen: "🍽️", cleaning: "🧹" }
        },
        'mop_inquiry': {
            title: "🧽 **Our Mop Collection**",
            subtitle: "Professional mopping solutions:",
            emojis: { microfiber: "✨", string: "🧶", dry: "💨" }
        },
        'wiper_inquiry': {
            title: "🗂️ **Our Wiper Collection**",
            subtitle: "Effective wiping tools for all surfaces:",
            emojis: { floor: "🏠", glass: "🪟", multi: "🔄" }
        },
        'cleaning_tools_inquiry': {
            title: "🛠️ **Our Cleaning Tools**",
            subtitle: "Complete range of cleaning equipment:",
            emojis: { tools: "🔧", premium: "⭐", basic: "📦" }
        }
    };

    const template = categoryTemplates[intent] || categoryTemplates['cleaning_tools_inquiry'];
    let response = `${template.title}\n\n${template.subtitle}\n\n`;

    // Group products by price for better display
    const premiumProducts = products.filter(p => p.mrp >= 100);
    const standardProducts = products.filter(p => p.mrp < 100 && p.mrp >= 70);
    const economyProducts = products.filter(p => p.mrp < 70);

    if (premiumProducts.length > 0) {
        response += `### **${template.emojis.premium || '🌟'} Premium Range:**\n`;
        premiumProducts.slice(0, 6).forEach(product => {
            const link = product.link || `https://rosechemicals.in/products/${product.id || product.slug}`;
            response += `• **${product.name}** - ₹${product.mrp}\n  🔗 ${link}\n`;
        });
        response += '\n';
    }

    if (standardProducts.length > 0) {
        response += `### **${template.emojis.standard || '🔵'} Standard Range:**\n`;
        standardProducts.slice(0, 6).forEach(product => {
            const link = product.link || `https://rosechemicals.in/products/${product.id || product.slug}`;
            response += `• **${product.name}** - ₹${product.mrp}\n  🔗 ${link}\n`;
        });
        response += '\n';
    }

    if (economyProducts.length > 0) {
        response += `### **${template.emojis.economy || '💰'} Economy Range:**\n`;
        economyProducts.slice(0, 6).forEach(product => {
            const link = product.link || `https://rosechemicals.in/products/${product.id || product.slug}`;
            response += `• **${product.name}** - ₹${product.mrp}\n  🔗 ${link}\n`;
        });
        response += '\n';
    }

    if (products.length > 18) {
        response += `*And ${products.length - 18} more varieties available!*\n\n`;
    }

    response += `**💡 All products are:**\n✅ High quality and durable\n✅ Effective for cleaning\n✅ Safe and reliable\n\n**📞 Contact:** +91 8610570490\n**🌐 Website:** www.rosechemicals.in\n\n*Need specific details about any product? Just ask!*`;

    return response;
};

module.exports = { generateResponse };
