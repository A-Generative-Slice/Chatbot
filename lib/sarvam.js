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
    const searchTerms = msg.split(/[\s,]+/).filter(word => word.length > 2);

    let filtered = tutorialsData.filter(t => {
        const title = t.title.toLowerCase();
        return searchTerms.some(term => title.includes(term));
    });

    // GENEROUS FALLBACK for official Rose Chemicals content
    if (filtered.length === 0 && (msg.includes('tutorial') || msg.includes('video') || msg.includes('youtube') || msg.includes('yputube') || msg.includes('link'))) {
        // Return 8 random/diverse videos FROM THE OFFICIAL LIST
        return tutorialsData.sort(() => 0.5 - Math.random()).slice(0, 8);
    }

    return filtered.slice(0, 5);
};

const generateResponse = async (message, language = 'en-IN', chatHistory = [], userPhoneNumber = '') => {
    try {
        const intent = detectIntent(message);
        const relevantProducts = await searchProducts(message, intent, 10);
        const relevantTutorials = findRelevantTutorials(message);

        const qanda = trainingData.find(item =>
            message.toLowerCase().includes(item.q.toLowerCase().replace(/[?]/g, '')) ||
            item.q.toLowerCase().includes(message.toLowerCase())
        );

        let productContext = formatProductList(relevantProducts, intent, language);
        let tutorialContext = relevantTutorials.length > 0
            ? "\n\nOFFICIAL TUTORIAL VIDEOS (CRITICAL: ONLY use these links!):\n" + relevantTutorials.map(t => `- ${t.title}: ${t.link}`).join('\n')
            : "";

        const systemPrompt = `
You are "Rose", a cute, smart, and attractive Sales Person for "Rose Chemicals". 🌸
Your goal is to CLOSE SALES and provide EXPERT chemical manufacturing advice.

PERSONALITY: Warm, professional, energetic. 

STRICT GUARDRAILS (ZERO TOLERANCE):
1. ❌ NEVER USE MARKDOWN LINKS like [text](url). WhatsApp DOES NOT support them.
2. ❌ ALWAYS provide URLs as RAW PLAIN TEXT (e.g., "Link: https://youtube.com/...").
3. ❌ NEVER WRAP LINKS IN BRACKETS like [url] or (url). ONLY raw text.
4. ❌ NEVER REPEAT the product link if it is already provided in the list.
5. ❌ ONLY suggest products and prices listed in "AVAILABLE PRODUCTS".
6. ❌ ONLY provide a YouTube link if it is explicitly listed in "OFFICIAL TUTORIAL VIDEOS".
7. ❌ Respond in ${language === 'ta-IN' ? 'Tamil' : language === 'hi-IN' ? 'Hindi' : 'English'}.

AVAILABLE PRODUCTS:
${productContext}

${tutorialContext}

COMPANY INFO:
- Address: No.179, First Street, Tagore Nagar, Tiruppalai, Madurai – 625014
- Contact: +91 8610570490
- YouTube Channel: https://www.youtube.com/@rosechemicals126

INSTRUCTIONS:
1. USE THE "AVAILABLE PRODUCTS" LIST EXACTLY AS FORMATTED. ❌ DO NOT add your own brackets or repeat links.
2. If the user asks for "video", "youtube", or "tutorial", list AT LEAST 5 official tutorial links from the context below.
3. Mention our YouTube Channel: https://www.youtube.com/@rosechemicals126 for all tutorials.
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

        let rawContent = response.data?.choices?.[0]?.message?.content || "I'm sorry, I'm feeling a bit shy right now! 🌸 Please call us at +91 8610570490 and we'll help you immediately!";
        return rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    } catch (error) {
        const errorData = error.response?.data;
        const statusCode = error.response?.status || "ERR";
        const detailedMsg = typeof errorData === 'object' ? JSON.stringify(errorData) : String(errorData || error.message);

        console.error('Sarvam Error Details:', { status: statusCode, data: errorData });
        return `🌸 I'm having a quick tea break! (Code: ${statusCode} - ${detailedMsg.substring(0, 80)}...). Please contact our team at +91 8610570490 for any assistance. ✨`;
    }
};

module.exports = { generateResponse };
