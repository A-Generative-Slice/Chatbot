// OpenAI-powered Natural Language Processing for WhatsApp Bot
// Install: npm install openai

const OpenAI = require('openai');

// Initialize OpenAI (you'll need to get API key from https://platform.openai.com)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

/**
 * Advanced intent detection using OpenAI GPT
 * @param {string} message - User's message
 * @returns {Object} - { intent, entity, confidence }
 */
async function detectIntentWithOpenAI(message) {
  try {
    const prompt = `
You are an AI assistant for an e-commerce WhatsApp bot selling chemicals, cleaning products, perfumes, and brushes. 
Analyze this customer message and determine the intent and extract relevant product information.

Customer message: "${message}"

Respond with ONLY a JSON object with these fields:
{
  "intent": "greeting|search|price|category|help|add_to_cart|cart|checkout|thanks|unknown",
  "entity": "extracted product/category name or null",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

Intent definitions:
- greeting: hello, hi, how are you, good morning, etc.
- search: looking for products, "do you have", "show me", "find", etc.
- price: asking about cost, rate, price of specific items
- category: asking about product categories, "what do you sell", etc.
- help: asking for assistance, how to use bot, etc.
- add_to_cart: wants to add specific item to cart
- cart: view cart contents, modify cart
- checkout: ready to purchase, place order
- thanks: thank you, appreciation messages
- unknown: unclear intent

Examples:
"do you have brushes" → {"intent": "search", "entity": "brushes", "confidence": 0.95, "reasoning": "clear product search"}
"what's the price of acetic acid" → {"intent": "price", "entity": "acetic acid", "confidence": 0.98, "reasoning": "specific price inquiry"}
"hi there" → {"intent": "greeting", "entity": null, "confidence": 0.99, "reasoning": "clear greeting"}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.1
    });

    const response = completion.choices[0].message.content.trim();
    return JSON.parse(response);
    
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Fallback to regex-based detection
    return detectIntentWithRegex(message);
  }
}

/**
 * Enhanced regex-based fallback
 */
function detectIntentWithRegex(message) {
  const msg = message.toLowerCase().trim();
  
  // More flexible patterns
  if (/\b(hi|hello|hey|good|morning|afternoon|evening|namaste)\b/.test(msg)) {
    return { intent: 'greeting', entity: null, confidence: 0.8, reasoning: 'greeting pattern match' };
  }
  
  if (/\b(price|cost|rate|much|expensive|cheap)\b/.test(msg)) {
    const entity = msg.replace(/\b(what|is|the|price|cost|rate|of|for|how|much|does|tell|me)\b/g, '').trim();
    return { intent: 'price', entity: entity || null, confidence: 0.7, reasoning: 'price inquiry pattern' };
  }
  
  if (/\b(find|search|show|have|need|want|looking|get)\b/.test(msg)) {
    let entity = msg;
    // Remove common search words
    entity = entity.replace(/\b(do|you|have|can|i|get|find|search|show|me|looking|for|need|want)\b/g, '').trim();
    entity = entity.replace(/\s+/g, ' '); // Clean multiple spaces
    return { intent: 'search', entity: entity || null, confidence: 0.7, reasoning: 'search pattern match' };
  }
  
  if (/\b(thank|thanks|appreciate|great|good|nice)\b/.test(msg)) {
    return { intent: 'thanks', entity: null, confidence: 0.8, reasoning: 'gratitude expression' };
  }
  
  return { intent: 'unknown', entity: null, confidence: 0.5, reasoning: 'no pattern match' };
}

module.exports = {
  detectIntentWithOpenAI,
  detectIntentWithRegex
};