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
        const relevantProducts = await searchProducts(message, intent, 4); // Reduce from 6 to 4
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
1. ❌ ONLY talk about products in "AVAILABLE PRODUCTS", info in "TRAINING Q&A", or "RELEVANT TUTORIAL VIDEOS".
2. ❌ NEVER USE MARKDOWN LINKS like [text](url). WhatsApp DOES NOT support them.
3. ❌ ALWAYS provide URLs as PLAIN RAW TEXT. (e.g., "Link: http://youtube.com/...")
4. ❌ NEVER invent channel links like "UCG" or "youtube.com/channel/". Only use watch links from context.
5. ❌ NEVER mention "Rose Chemicals" website API.

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
2. Use conversation history to resolve pronouns like "that one" or "it".
3. Provide raw URLs from context. NEVER use brackets [] or parentheses () for links. This is CRITICAL for WhatsApp compatibility.
4. Keep it professional.
5. ❌ YOUR OUTPUT MUST NEVER CONTAIN "[" or "]" or "(" or ")" character around a URL.
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
            max_tokens: 400
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
