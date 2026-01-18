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
2. ❌ ALWAYS use RAW URLs. NO Markdown links.
3. ❌ NEVER mention "Rose Chemicals" website API.

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
3. Provide raw URLs from context. Keep it professional.
`;

        const historyMessages = (chatHistory || [])
            .filter(m => m && m.content && m.content !== message)
            .slice(-3) // Reduce from 5 to 3
            .map(m => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: String(m.content || "").substring(0, 500) // Truncate long history items
            }));

        const response = await axios.post('https://api.sarvam.ai/v1/chat/completions', {
            model: "sarvam-m",
            messages: [
                { role: "system", content: systemPrompt.trim() },
                ...historyMessages,
                { role: "user", content: String(message).substring(0, 1000) }
            ],
            temperature: 0.5,
            max_tokens: 400 // Reduce from 500 to 400
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(process.env.SARVAM_API_KEY || '').trim()}`
            },
            timeout: 15000 // 15s timeout
        });

        return response.data?.choices?.[0]?.message?.content || "I'm sorry, I'm feeling a bit shy right now! 🌸 Please call us at +91 8610570490 and we'll help you immediately!";

    } catch (error) {
        const errorData = error.response?.data;
        const statusCode = error.response?.status || "ERR";
        const detailedMsg = typeof errorData === 'object' ? JSON.stringify(errorData).substring(0, 50) : String(errorData || error.message).substring(0, 50);

        console.error('Sarvam Error Details:', { status: statusCode, data: errorData });

        return `🌸 I'm having a quick tea break! (Code: ${statusCode} - ${detailedMsg}...). Please contact our team at +91 8610570490 for any assistance. ✨`;
    }
};

module.exports = { generateResponse };
