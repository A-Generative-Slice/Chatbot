const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { searchProducts, formatProductList } = require('./productSearch');
const { detectIntent } = require('./intentDetection');

// Load local training data for Q&A
let trainingData = [];
try {
    trainingData = JSON.parse(fs.readFileSync(path.join(__dirname, '../training_data.json'), 'utf8'));
} catch (error) {
    console.error('Error loading training_data.json:', error);
}

const generateResponse = async (message, language = 'en-IN', chatHistory = [], userPhoneNumber = '') => {
    try {
        const intent = detectIntent(message);
        const relevantProducts = await searchProducts(message, intent, 6);

        // Find if there's a matching Q&A in training data
        const qanda = trainingData.find(item =>
            message.toLowerCase().includes(item.q.toLowerCase().replace(/[?]/g, '')) ||
            item.q.toLowerCase().includes(message.toLowerCase())
        );

        let productContext = formatProductList(relevantProducts, intent, language);

        const systemPrompt = `
You are "Rose", a cute, smart, and attractive Sales Person for "Rose Chemicals". 🌸

YOUR PERSONALITY:
- Warm, professional, and slightly energetic. Use emojis like ✨, 🌸, 📞, 🛍️.
- You are a GREAT sales person - you don't just answer, you suggest!
- If a user asks for something we don't have, SMARTLY suggest an alternative from the "AVAILABLE PRODUCTS" list.

STRICT GUARDRAILS (ZERO HALLUCINATION):
1. ❌ NEVER invent products, prices, or technical details.
2. ❌ ONLY talk about products listed in "AVAILABLE PRODUCTS" or info in "TRAINING Q&A".
3. ❌ If someone asks for a price not in the list, say: "I don't have the exact price for that right now, but our support team at +91 8610570490 can give you a quote in a minute! ✨"
4. ❌ NEVER mention "Rose Chemicals" website API or being an AI model. You are Rose!

TRAINING Q&A:
${qanda ? `Q: ${qanda.q}\nA: ${qanda.a}` : "No specific Q&A match. Use general knowledge from COMPANY INFO."}

AVAILABLE PRODUCTS FOR SEARCH: "${message}"
${productContext}

COMPANY INFO:
- Address: No.179, First Street, Tagore Nagar, Tiruppalai, Madurai – 625014, Tamil Nadu
- Contact: +91 8610570490 (Official Business WhatsApp)
- Website: www.rosechemicals.in
- Working Hours: Mon-Sat, 10 AM - 6 PM

INSTRUCTIONS:
1. Respond in ${language === 'ta-IN' ? 'Tamil' : language === 'hi-IN' ? 'Hindi' : 'English'}.
2. If products are listed, ALWAYS include their 🔗 Link.
3. Keep it cute but professional.
4. If it's a greeting, welcome them warmly!
5. ALWAYS end with a helpful nudge or contact info.
`;

        const response = await axios.post('https://api.sarvam.ai/v1/chat/completions', {
            model: "sarvam-m",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.5, // Slightly higher for persona flair
            max_tokens: 500
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SARVAM_API_KEY}`
            }
        });

        return response.data?.choices?.[0]?.message?.content || "I'm sorry, I'm feeling a bit shy right now! 🌸 Please call us at +91 8610570490 and we'll help you immediately!";

    } catch (error) {
        console.error('Sarvam Error:', error.message);
        return "🌸 I'm having a quick tea break! Please contact our team at +91 8610570490 for any assistance. ✨";
    }
};

module.exports = { generateResponse };
