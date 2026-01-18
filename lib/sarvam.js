const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { searchProducts, formatProductList } = require('./productSearch');
const { detectIntent } = require('./intentDetection');

// Load local training data for Q&A and tutorials
let trainingData = [];
let tutorialsData = [];
try {
    trainingData = JSON.parse(fs.readFileSync(path.join(__dirname, '../training_data.json'), 'utf8'));
    tutorialsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../tutorials.json'), 'utf8'));
} catch (error) {
    console.error('Error loading knowledge data:', error);
}

const findRelevantTutorials = (message) => {
    const msg = message.toLowerCase();
    const searchTerms = msg.split(' ').filter(word => word.length > 2);

    let filtered = tutorialsData.filter(t => {
        const title = t.title.toLowerCase();
        // Check for specific DIY kit keywords if the user asks for "diy"
        if (msg.includes('diy')) {
            if (title.includes('making') || title.includes('formulation') || title.includes('tutorial')) {
                return true;
            }
        }
        return searchTerms.some(term => title.includes(term));
    });

    // Fallback: If no match but user wants tutorials, give top results
    if (filtered.length === 0 && (msg.includes('tutorial') || msg.includes('video') || msg.includes('how to make'))) {
        filtered = tutorialsData.slice(0, 8);
    }

    return filtered.slice(0, 10);
};

const generateResponse = async (message, language = 'en-IN', chatHistory = [], userPhoneNumber = '') => {
    try {
        const intent = detectIntent(message);
        const relevantProducts = await searchProducts(message, intent, 6);
        const relevantTutorials = findRelevantTutorials(message);

        // Find if there's a matching Q&A in training data
        const qanda = trainingData.find(item =>
            message.toLowerCase().includes(item.q.toLowerCase().replace(/[?]/g, '')) ||
            item.q.toLowerCase().includes(message.toLowerCase())
        );

        let productContext = formatProductList(relevantProducts, intent, language);
        let tutorialContext = relevantTutorials.length > 0
            ? "\n\nRELEVANT TUTORIAL VIDEOS (Use these YouTube links!):\n" + relevantTutorials.map(t => `- ${t.title}: ${t.link}`).join('\n')
            : "";

        const systemPrompt = `
You are "Rose", a cute, smart, and attractive Sales Person for "Rose Chemicals". 🌸

YOUR PERSONALITY:
- Warm, professional, and slightly energetic. Use emojis like ✨, 🌸, 📞, 🛍️.
- You are a GREAT sales person - you don't just answer, you suggest!
- If a user asks for something we don't have, SMARTLY suggest an alternative from the "AVAILABLE PRODUCTS" list.

STRICT GUARDRAILS (ZERO HALLUCINATION):
1. ❌ NEVER invent products, prices, or technical details.
2. ❌ ONLY talk about products listed in "AVAILABLE PRODUCTS", info in "TRAINING Q&A", or "RELEVANT TUTORIAL VIDEOS".
3. ❌ WhatsApp DOES NOT support Markdown links like [text](url). ALWAYS use raw URLs.
   - Example Correct: "Watch here: https://youtube.com/..."
   - Example Incorrect: "[Watch here](https://youtube.com/...)"
4. ❌ NEVER mention "Rose Chemicals" website API. You are Rose!

CONVERSATION CONTEXT (LAST FEW MESSAGES):
${chatHistory.map(m => `${(m.role || 'user').toUpperCase()}: ${m.content || ''}`).join('\n')}

TRAINING Q&A:
${qanda ? `Q: ${qanda.q}\nA: ${qanda.a}` : "No specific Q&A match. Use general knowledge from COMPANY INFO."}

AVAILABLE PRODUCTS FOR SEARCH: "${message}"
${productContext}
${tutorialContext}

COMPANY INFO:
- Address: No.179, First Street, Tagore Nagar, Tiruppalai, Madurai – 625014, Tamil Nadu
- Contact: +91 8610570490 (Official Business WhatsApp)
- Website: www.rosechemicals.in
- Working Hours: Mon-Sat, 10 AM - 6 PM

INSTRUCTIONS:
1. Respond in ${language === 'ta-IN' ? 'Tamil' : language === 'hi-IN' ? 'Hindi' : 'English'}.
2. If products or tutorials are listed, ALWAYS include their 🔗 Link as a RAW URL.
3. Use the CONVERSATION CONTEXT to answer follow-up questions (e.g., if user says "how much for that?").
4. Keep it cute but professional.
5. Provide the specific YouTube links from "RELEVANT TUTORIAL VIDEOS" when user asks for tutorials/videos.
6. If it's a greeting, welcome them warmly!
7. ALWAYS end with a helpful nudge or contact info.
`;
        // Format history for Sarvam API (last 5 messages)
        // Ensure every message is a valid object with role and content
        const historyMessages = (chatHistory || [])
            .filter(m => m && m.content && m.content !== message)
            .slice(-5)
            .map(m => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: String(m.content || "")
            }));

        const response = await axios.post('https://api.sarvam.ai/v1/chat/completions', {
            model: "sarvam-m",
            messages: [
                { role: "system", content: systemPrompt },
                ...historyMessages,
                { role: "user", content: String(message) }
            ],
            temperature: 0.5,
            max_tokens: 500
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(process.env.SARVAM_API_KEY || '').trim()}`
            },
            timeout: 20000 // 20s timeout for safety
        });

        return response.data?.choices?.[0]?.message?.content || "I'm sorry, I'm feeling a bit shy right now! 🌸 Please call us at +91 8610570490 and we'll help you immediately!";

    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || "Unknown Error";
        const statusCode = error.response?.status || "No Status";

        console.error('Sarvam Error Details:', {
            message: error.message,
            status: statusCode,
            responseData: error.response?.data,
            stack: error.stack
        });

        // Diagnostic message for the user to help us debug
        return `🌸 I'm having a quick tea break! (Code: ${statusCode} - ${errorMsg.substring(0, 30)}...). Please contact our team at +91 8610570490 for any assistance. ✨`;
    }
};

module.exports = { generateResponse };
