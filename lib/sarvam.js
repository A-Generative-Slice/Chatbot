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
        if (msg.includes('diy')) {
            if (title.includes('making') || title.includes('formulation') || title.includes('tutorial')) {
                return true;
            }
        }
        return searchTerms.some(term => title.includes(term));
    });

    if (filtered.length === 0 && (msg.includes('tutorial') || msg.includes('video') || msg.includes('how to make'))) {
        filtered = tutorialsData.slice(0, 4);
    }

    return filtered.slice(0, 5); // Reduce from 10 to 5
};

const generateResponse = async (message, language = 'en-IN', chatHistory = [], userPhoneNumber = '') => {
    try {
        const intent = detectIntent(message);
        const relevantProducts = await searchProducts(message, intent, 10); // INCREASED from 4 to 10 for better variety
        const relevantTutorials = findRelevantTutorials(message);

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

PERSONALITY: Warm, professional, energetic. Suggest alternatives if products are missing.

STRICT GUARDRAILS:
1. ❌ ONLY suggest products and prices listed in "AVAILABLE PRODUCTS".
2. ❌ NEVER suggest products from "local market", "supermarket", "nearby shops", or "local brands". 
3. ❌ NEVER create or suggest "Bulk Quantity", "Kits", or "Combo" versions of products unless they are explicitly listed.
4. ❌ TOTAL CALCULATIONS must be 100% accurate based ONLY on the prices in "AVAILABLE PRODUCTS".
5. ❌ NEVER truncate or shorten a URL. Provide the FULL URL exactly as given in context. This is CRITICAL.
6. ❌ NEVER USE MARKDOWN LINKS like [text](url). Use RAW PLAIN TEXT URLs only.
7. ❌ ONLY use official YouTube links from "RELEVANT TUTORIAL VIDEOS".
8. ❌ NEVER invent or guess a YouTube link. If no video is listed in context for a topic, say "I don't have a video for that yet."
9. ❌ NEVER use generic headers like "Detergent Options at Rose Chemicals" or random emojis like ☁️. 
10. ❌ ALWAYS maintain your persona as "Rose". Be warm, personal, and cute.
11. ❌ NEVER mention "Rose Chemicals" website API.

TRAINING Q&A:
${qanda ? `Q: ${qanda.q}\nA: ${qanda.a}` : "No specific Q&A match."}

AVAILABLE PRODUCTS:
${productContext}
${tutorialContext}

COMPANY INFO:
- Address: No.179, First Street, Tagore Nagar, Tiruppalai, Madurai – 625014
- Contact: +91 8610570490

INSTRUCTIONS:
1. Respond in ${language === 'ta-IN' ? 'Tamil' : language === 'hi-IN' ? 'Hindi' : 'English'}.
2. Use conversation history for context. Resolve "that one" or "how much" using history.
3. Use RAW URLs only. ❌ NEVER use [] or () brackets for links.
4. Calculate totals carefully. Check your math twice.
5. Provide COMPLETE links. Do not cut them off.
`;

        // STRICT: Format history ensuring alternating roles (user/assistant)
        let historyMessages = [];
        let lastRole = 'assistant'; // We want the first history message to be 'user'

        if (chatHistory && Array.isArray(chatHistory)) {
            const rawHistory = chatHistory
                .filter(m => m && m.content && m.content !== message)
                .slice(-6);

            for (const m of rawHistory) {
                const currentRole = m.role === 'assistant' ? 'assistant' : 'user';
                if (currentRole !== lastRole) {
                    historyMessages.push({
                        role: currentRole,
                        content: String(m.content || "").substring(0, 500)
                    });
                    lastRole = currentRole;
                }
            }
        }

        const messages = [
            { role: "system", content: systemPrompt.trim() }
        ];

        // Add history
        messages.push(...historyMessages);

        // Final safety: If last message in history is 'user', remove it to avoid back-to-back users
        if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
            messages.pop();
        }

        // Add current user message
        messages.push({ role: "user", content: String(message).substring(0, 1000) });

        const response = await axios.post('https://api.sarvam.ai/v1/chat/completions', {
            model: "sarvam-m",
            messages: messages,
            temperature: 0.5,
            max_tokens: 800
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(process.env.SARVAM_API_KEY || '').trim()}`
            },
            timeout: 15000
        });

        return response.data?.choices?.[0]?.message?.content || "I'm sorry, I'm feeling a bit shy right now! 🌸 Please call us at +91 8610570490 and we'll help you immediately!";

    } catch (error) {
        const errorData = error.response?.data;
        const statusCode = error.response?.status || "ERR";
        const detailedMsg = typeof errorData === 'object' ? JSON.stringify(errorData) : String(errorData || error.message);

        console.error('Sarvam Error Details:', { status: statusCode, data: errorData });
        return `🌸 I'm having a quick tea break! (Code: ${statusCode} - ${detailedMsg.substring(0, 80)}...). Please contact our team at +91 8610570490 for any assistance. ✨`;
    }
};

module.exports = { generateResponse };
