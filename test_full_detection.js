// Test simulate webhook message processing
const message = "fabric conditioner";

// Simulate detectIntent function
function detectIntent(message) {
  const msg = message.toLowerCase().trim();
  const words = msg.split(/\s+/);
  
  // DIY Kit specific terms
  const diyKitTerms = [
    'fabric conditioner', 'liquid detergent', 'dish wash', 'floor cleaner',
    'soap oil', 'phenyl compound', 'washing gel', 'cleaning kit'
  ];
  
  // Enhanced product terms
  const productTerms = [
    'acid', 'chemical', 'brush', 'cleaner', 'perfume', 'oil', 'powder', 
    'soap', 'detergent', 'fragrance', 'bottle', 'container', 'solution',
    'liquid', 'spray', 'cream', 'gel', 'paste', 'thinner', 'solvent',
    'fabric', 'conditioner', 'softener', 'dish', 'wash', 'floor', 
    'phenyl', 'compound', 'kit', 'ultra', 'smart'
  ];
  
  const hasDIYKitTerms = diyKitTerms.some(term => msg.includes(term));
  const hasProductTerms = productTerms.some(term => msg.includes(term));
  
  console.log(`🔍 Analyzing: "${msg}"`);
  console.log(`- Has DIY Kit Terms: ${hasDIYKitTerms}`);
  console.log(`- Has Product Terms: ${hasProductTerms}`);
  console.log(`- Words: ${words.length}`);
  
  // DIRECT DIY KIT DETECTION
  if (hasDIYKitTerms) {
    console.log(`✅ DETECTED: SEARCH intent with entity: "${msg}"`);
    return { intent: 'search', entity: msg };
  }
  
  // Enhanced fallback logic for product names
  if (words.length >= 1) {
    if (hasProductTerms || words.length === 2) {
      console.log(`✅ DETECTED: SEARCH intent (fallback) with entity: "${msg}"`);
      return { intent: 'search', entity: msg };
    }
  }
  
  console.log(`❌ DETECTED: UNKNOWN intent`);
  return { intent: 'unknown', entity: null };
}

// Test the message
console.log(`\n🧪 Testing message: "${message}"`);
const result = detectIntent(message);
console.log(`\n📊 Final Result:`, result);

if (result.intent === 'search') {
  console.log(`\n✅ SUCCESS: Should trigger knowledge base search for "${result.entity}"`);
} else {
  console.log(`\n❌ PROBLEM: Will show fallback/unknown response instead of product info`);
}