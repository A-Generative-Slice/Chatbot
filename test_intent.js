// Quick test for intent detection
const message = "fabric conditioner";
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

console.log(`Testing "${message}":`);
console.log(`- Has DIY Kit Terms: ${hasDIYKitTerms}`);
console.log(`- Has Product Terms: ${hasProductTerms}`);
console.log(`- Words: ${words.length}`);

if (hasDIYKitTerms) {
  console.log(`✅ Should detect as SEARCH intent with entity: "${msg}"`);
} else if (hasProductTerms) {
  console.log(`✅ Should detect as SEARCH intent with product terms`);
} else {
  console.log(`❌ May not be detected properly`);
}