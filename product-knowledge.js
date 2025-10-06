// Enhanced Product Knowledge Base for Detailed Questions
// Add this to your server.js

// Expanded product information with detailed specifications
const productKnowledgeBase = {
  // Cleaning Products
  "toilet cleaner": {
    colors: ["blue", "green", "clear"],
    usage: "Mix 1:10 ratio with water. Use 50ml per toilet cleaning.",
    specifications: "500ml bottle, biodegradable formula",
    compatibility: "Safe for ceramic, porcelain surfaces",
    ingredients: "Hydrochloric acid 5%, surfactants, fragrance"
  },
  "detergent powder": {
    colors: ["white", "blue crystals"],
    usage: "Use 30g per kg of clothes. Dissolve in water before adding clothes.",
    specifications: "1kg, 5kg packages available",
    compatibility: "All fabric types except silk",
    ingredients: "Sodium carbonate, surfactants, optical brighteners"
  },
  
  // Chemicals
  "acetic acid": {
    colors: ["clear", "colorless"],
    usage: "Industrial grade - dilute as per requirement. Food grade - follow food safety guidelines.",
    specifications: "Available in 1L, 5L, 25L containers. Purity: 99.5%",
    compatibility: "Compatible with most materials except metals",
    safety: "Use gloves and eye protection. Store in cool, dry place"
  },
  
  // Brushes
  "carpet brush": {
    colors: ["brown", "black", "natural"],
    usage: "Use with carpet cleaning solutions. Apply gentle pressure in circular motions.",
    specifications: "Length: 30cm, Width: 15cm, Bristle material: Natural/Synthetic",
    compatibility: "All carpet types, upholstery cleaning"
  }
};

/**
 * Enhanced function to answer specific product questions
 */
function answerProductQuestion(question, productName = null) {
  const questionLower = question.toLowerCase();
  
  // Find relevant product
  let product = null;
  let matchedProductName = productName;
  
  if (productName) {
    // Look for exact or partial matches
    for (const [key, value] of Object.entries(productKnowledgeBase)) {
      if (productName.toLowerCase().includes(key) || key.includes(productName.toLowerCase())) {
        product = value;
        matchedProductName = key;
        break;
      }
    }
  } else {
    // Try to identify product from question
    for (const [key, value] of Object.entries(productKnowledgeBase)) {
      if (questionLower.includes(key)) {
        product = value;
        matchedProductName = key;
        break;
      }
    }
  }
  
  if (!product) {
    return {
      response: "I'd be happy to help with your question! Could you please specify which product you're asking about? You can search for the product first, and then I can provide detailed information.",
      needsMoreInfo: true
    };
  }
  
  // Answer based on question type
  if (questionLower.includes('color') || questionLower.includes('colour')) {
    const colors = product.colors || ["Please contact us for color options"];
    return {
      response: `${matchedProductName} is available in: ${colors.join(', ')}. ${colors.length > 1 ? 'Please specify your preferred color when ordering.' : ''}`,
      needsMoreInfo: false
    };
  }
  
  if (questionLower.includes('water') || questionLower.includes('mix') || questionLower.includes('dilute') || questionLower.includes('ratio')) {
    const usage = product.usage || "Please refer to product label for mixing instructions";
    return {
      response: `For ${matchedProductName}: ${usage}`,
      needsMoreInfo: false
    };
  }
  
  if (questionLower.includes('how to use') || questionLower.includes('instructions')) {
    const usage = product.usage || "Please refer to product manual for detailed usage instructions";
    return {
      response: `Usage instructions for ${matchedProductName}: ${usage}`,
      needsMoreInfo: false
    };
  }
  
  if (questionLower.includes('size') || questionLower.includes('weight') || questionLower.includes('specification')) {
    const specs = product.specifications || "Please contact us for detailed specifications";
    return {
      response: `${matchedProductName} specifications: ${specs}`,
      needsMoreInfo: false
    };
  }
  
  if (questionLower.includes('safe') || questionLower.includes('compatible')) {
    const compatibility = product.compatibility || product.safety || "Please refer to safety data sheet";
    return {
      response: `${matchedProductName} safety/compatibility: ${compatibility}`,
      needsMoreInfo: false
    };
  }
  
  // General information
  return {
    response: `Here's what I know about ${matchedProductName}:\n\n` +
             `📋 Specifications: ${product.specifications || 'Contact for details'}\n` +
             `🎨 Available colors: ${product.colors ? product.colors.join(', ') : 'Contact for details'}\n` +
             `📖 Usage: ${product.usage || 'Refer to product label'}\n\n` +
             `For more specific information, please contact our team!`,
    needsMoreInfo: false
  };
}

/**
 * Smart product question handler
 */
function handleProductQuestion(message, userSession) {
  // Check if user recently searched for a product
  const recentProduct = userSession.lastSearchedProduct;
  
  const result = answerProductQuestion(message, recentProduct);
  
  if (result.needsMoreInfo && !recentProduct) {
    return result.response + "\n\n💡 *Tip*: Search for a product first, then ask specific questions about it!";
  }
  
  return result.response;
}

module.exports = {
  productKnowledgeBase,
  answerProductQuestion,
  handleProductQuestion
};