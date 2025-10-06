// Enhanced WhatsApp Bot with OpenAI for Product Conversations
// Install: npm install openai

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

/**
 * Enhanced intent detection that can handle complex product questions
 */
async function detectIntentWithAI(message, context = '') {
  try {
    const prompt = `
You are an AI assistant for Rose Chemicals, an e-commerce WhatsApp bot selling:
- Chemicals & Raw Materials (acids, solvents, etc.)
- Cleaning Products (detergents, soaps, etc.) 
- Perfumes & Fragrances
- Brushes & Equipment

Analyze this customer message and determine the intent and response strategy.

Customer message: "${message}"
Context: ${context}

Respond with ONLY a JSON object:
{
  "intent": "search|product_question|price|greeting|help|thanks|unknown",
  "needs_product_info": true/false,
  "suggested_response": "response text or null if search needed",
  "product_keywords": ["keyword1", "keyword2"] or null,
  "question_type": "color|quantity|usage|compatibility|specifications|availability" or null
}

Intent definitions:
- search: looking for products ("show me brushes", "do you have acids")
- product_question: specific questions about products ("does it come in blue?", "how much water to add?")
- price: asking about cost/pricing
- greeting: hello, hi, good morning
- help: asking for assistance
- thanks: gratitude expressions
- unknown: unclear intent

If it's a product_question, analyze what type of information they need and provide a helpful response.

Examples:
"does it come in blue color?" → {"intent": "product_question", "needs_product_info": true, "question_type": "color", "suggested_response": "I'd be happy to help you with color options! Could you please specify which product you're asking about? You can search for the product first, and then I can provide detailed information about available colors."}

"what amount of water to add in this kit?" → {"intent": "product_question", "needs_product_info": true, "question_type": "usage", "suggested_response": "For usage instructions and mixing ratios, I'll need to know which specific kit you're referring to. Could you please tell me the product name or search for it first?"}

"show me cleaning products" → {"intent": "search", "product_keywords": ["cleaning", "products"], "needs_product_info": false}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.3
    });

    const response = completion.choices[0].message.content.trim();
    return JSON.parse(response);
    
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Fallback to simple detection
    return detectIntentSimple(message);
  }
}

/**
 * Answer specific product questions using AI
 */
async function answerProductQuestion(question, productName = null, productDetails = null) {
  try {
    const prompt = `
You are a helpful assistant for Rose Chemicals. Answer this customer question about our products.

Customer Question: "${question}"
${productName ? `Product: ${productName}` : ''}
${productDetails ? `Product Details: ${JSON.stringify(productDetails)}` : ''}

Product Categories we sell:
- Chemicals & Raw Materials (acids, solvents, industrial chemicals)
- Cleaning Products (detergents, soaps, sanitizers)
- Perfumes & Fragrances (essential oils, perfume bases)
- Brushes & Equipment (cleaning brushes, industrial brushes)

Guidelines:
1. Be helpful and informative
2. If you don't have specific product details, suggest they contact for more info
3. For technical questions, provide general guidance but recommend consulting product specifications
4. Keep responses concise but complete
5. Always maintain a professional, friendly tone

Provide a helpful response (max 150 words):
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7
    });

    return completion.choices[0].message.content.trim();
    
  } catch (error) {
    console.error('OpenAI Error:', error);
    return "I'd be happy to help with your question! For specific product details, please contact our team or search for the product first to get detailed information.";
  }
}

module.exports = {
  detectIntentWithAI,
  answerProductQuestion
};