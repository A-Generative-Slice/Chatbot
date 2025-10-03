// Enhanced pattern-based intent detection
// Much more flexible than current implementation

/**
 * Advanced intent detection with flexible pattern matching
 * @param {string} message - User's raw message
 * @returns {Object} - { intent, entity, confidence, reasoning }
 */
function detectIntentAdvanced(message) {
  const msg = message.toLowerCase().trim();
  const words = msg.split(/\s+/);
  
  // Keywords for different intents
  const greetingKeywords = ['hi', 'hello', 'hey', 'hii', 'helo', 'good', 'morning', 'afternoon', 'evening', 'namaste', 'vanakkam', 'adaab', 'salaam'];
  const searchKeywords = ['have', 'show', 'find', 'get', 'need', 'want', 'looking', 'search', 'browse', 'available'];
  const priceKeywords = ['price', 'cost', 'rate', 'much', 'expensive', 'cheap', 'value', 'amount'];
  const helpKeywords = ['help', 'assist', 'guide', 'support', 'how', 'what', 'can'];
  const thanksKeywords = ['thank', 'thanks', 'appreciate', 'great', 'good', 'nice', 'excellent', 'perfect'];
  
  // Function to check if any keyword exists in message
  const hasKeyword = (keywords) => keywords.some(keyword => msg.includes(keyword));
  
  // Greeting Detection
  if (hasKeyword(greetingKeywords) || /^(start|begin|menu)$/i.test(msg)) {
    return {
      intent: 'greeting',
      entity: null,
      confidence: 0.9,
      reasoning: 'greeting keywords detected'
    };
  }
  
  // Price Detection
  if (hasKeyword(priceKeywords)) {
    let entity = extractProductName(msg, priceKeywords.concat(['what', 'is', 'the', 'of', 'for', 'tell', 'me']));
    return {
      intent: 'price',
      entity: entity,
      confidence: 0.85,
      reasoning: 'price keywords detected'
    };
  }
  
  // Search Detection (most flexible)
  if (hasKeyword(searchKeywords) || isQuestionFormat(msg) || hasProductIndicators(msg)) {
    let entity = extractProductName(msg, searchKeywords.concat(['do', 'you', 'me', 'any', 'some']));
    return {
      intent: 'search',
      entity: entity,
      confidence: 0.8,
      reasoning: 'search pattern or product indicators detected'
    };
  }
  
  // Help Detection
  if (hasKeyword(helpKeywords) && (msg.includes('can') || msg.includes('how') || msg.includes('what'))) {
    return {
      intent: 'help',
      entity: null,
      confidence: 0.8,
      reasoning: 'help keywords detected'
    };
  }
  
  // Thanks Detection
  if (hasKeyword(thanksKeywords)) {
    return {
      intent: 'thanks',
      entity: null,
      confidence: 0.9,
      reasoning: 'gratitude keywords detected'
    };
  }
  
  // If message contains product-related words, assume search
  if (hasProductRelatedWords(msg)) {
    return {
      intent: 'search',
      entity: msg,
      confidence: 0.6,
      reasoning: 'product-related terms detected'
    };
  }
  
  // Default to unknown
  return {
    intent: 'unknown',
    entity: null,
    confidence: 0.3,
    reasoning: 'no clear pattern match'
  };
}

/**
 * Extract product name by removing common words
 */
function extractProductName(message, wordsToRemove) {
  let words = message.toLowerCase().split(/\s+/);
  
  // Remove common words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
    .concat(wordsToRemove);
  
  words = words.filter(word => !stopWords.includes(word) && word.length > 1);
  
  return words.length > 0 ? words.join(' ') : null;
}

/**
 * Check if message is in question format
 */
function isQuestionFormat(message) {
  return message.includes('?') || 
         message.startsWith('do ') || 
         message.startsWith('can ') || 
         message.startsWith('is ') || 
         message.startsWith('are ') ||
         message.startsWith('what ') ||
         message.startsWith('where ') ||
         message.startsWith('how ');
}

/**
 * Check if message has product indicators
 */
function hasProductIndicators(message) {
  const productTerms = [
    'acid', 'chemical', 'brush', 'cleaner', 'perfume', 'oil', 'powder', 
    'soap', 'detergent', 'fragrance', 'bottle', 'container', 'solution',
    'liquid', 'spray', 'cream', 'gel', 'paste'
  ];
  
  return productTerms.some(term => message.includes(term));
}

/**
 * Check for product-related words
 */
function hasProductRelatedWords(message) {
  const businessTerms = [
    'buy', 'purchase', 'order', 'deliver', 'available', 'stock', 
    'quality', 'brand', 'size', 'quantity', 'bulk', 'wholesale',
    'retail', 'discount', 'offer', 'deal'
  ];
  
  return businessTerms.some(term => message.includes(term));
}

/**
 * Enhanced fallback search for products
 */
function intelligentProductSearch(query) {
  // Expand search with synonyms and variations
  const synonyms = {
    'brush': ['brushes', 'scrubber', 'scrub', 'cleaning brush'],
    'acid': ['acids', 'acidic', 'chemical acid'],
    'cleaner': ['cleaning', 'cleaners', 'detergent', 'soap'],
    'perfume': ['perfumes', 'fragrance', 'scent', 'cologne'],
    'oil': ['oils', 'liquid oil', 'essential oil'],
    'powder': ['powders', 'dust', 'granules']
  };
  
  let expandedQuery = query;
  
  // Add synonyms to search
  for (const [word, syns] of Object.entries(synonyms)) {
    if (query.includes(word)) {
      expandedQuery += ' ' + syns.join(' ');
    }
  }
  
  return expandedQuery;
}

module.exports = {
  detectIntentAdvanced,
  intelligentProductSearch,
  extractProductName
};