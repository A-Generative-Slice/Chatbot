// Auto-Enhance Products with Smart AI Fields
// Generates keywords, descriptions, search metadata, and related products

const fs = require('fs');
const natural = require('natural');

console.log('🚀 Starting Auto-Enhancement of Products...\n');

// Load original products
let productsData;
try {
  productsData = JSON.parse(fs.readFileSync('products.json', 'utf8'));
  console.log('✅ Loaded products.json');
} catch (error) {
  console.error('❌ Error loading products.json:', error.message);
  process.exit(1);
}

// Common typo patterns
const typoPatterns = {
  'cleaner': ['cleanr', 'clener', 'cleanning'],
  'floor': ['flor', 'flore', 'floar'],
  'dish': ['desh', 'disch', 'dishh'],
  'wash': ['wosh', 'waash', 'wsh'],
  'liquid': ['liqued', 'liqid', 'liqud'],
  'fabric': ['fabrik', 'fabirc', 'febric'],
  'toilet': ['tolet', 'toilat', 'toielt'],
  'bathroom': ['batroom', 'bathrom', 'betroom'],
  'kitchen': ['kichen', 'kitchan', 'kitchin'],
  'detergent': ['detergant', 'detergnt', 'detergent'],
  'phenyl': ['fenil', 'phenil', 'finyl'],
  'brush': ['brash', 'brus', 'brushh'],
  'wiper': ['wipor', 'wiper', 'wyper'],
  'mop': ['moop', 'map', 'mopp'],
  'gloves': ['gloves', 'gluves', 'glovs'],
  'soap': ['sope', 'soep', 'soapp'],
  'acid': ['asid', 'acyd', 'accid'],
  'powder': ['powdar', 'pouder', 'powdr'],
  'spray': ['spary', 'sprey', 'spraay']
};

// Product category keywords
const categoryKeywords = {
  'Chemical - Raw Materials': ['chemical', 'raw material', 'ingredient', 'manufacturing', 'DIY', 'formulation', 'production'],
  'Perfumes': ['perfume', 'fragrance', 'scent', 'aroma', 'smell', 'odor'],
  'Ready To Use Chemicals': ['ready to use', 'instant', 'pre-made', 'cleaning solution', 'cleaner'],
  'Nouful Products': ['cleaning tool', 'cleaning accessory', 'household item', 'kitchen tool'],
  'Global Product Mart': ['cleaning tool', 'wiper', 'mop', 'duster', 'cleaning accessory']
};

// Use case templates based on product type
const useCaseTemplates = {
  'cleaner': ['Effective cleaning solution', 'Removes dirt and stains', 'Safe for daily use', 'Fresh fragrance'],
  'acid': ['pH adjustment in formulations', 'Descaling agent', 'Cleaning product ingredient', 'Industrial use'],
  'perfume': ['Add fragrance to products', 'Long-lasting scent', 'Pleasant aroma', 'Product enhancement'],
  'brush': ['Effective scrubbing tool', 'Durable bristles', 'Comfortable grip', 'Long-lasting'],
  'wiper': ['Quick water removal', 'Floor drying', 'Window cleaning', 'Surface cleaning'],
  'mop': ['Floor cleaning', 'Dust removal', 'Daily maintenance', 'Large area coverage'],
  'gloves': ['Hand protection', 'Cleaning tasks', 'Chemical handling', 'Comfortable fit'],
  'duster': ['Dust removal', 'Surface cleaning', 'Daily maintenance', 'Reusable']
};

// Generate smart keywords for a product
function generateKeywords(productName, categoryName) {
  const keywords = new Set();
  const nameLower = productName.toLowerCase();
  
  // Add original name
  keywords.add(productName.toLowerCase());
  
  // Extract words from product name
  const words = nameLower.split(/[\s\-\/]+/).filter(w => w.length > 2);
  words.forEach(word => keywords.add(word));
  
  // Add category keywords
  if (categoryKeywords[categoryName]) {
    categoryKeywords[categoryName].forEach(kw => keywords.add(kw));
  }
  
  // Add typo variations for common words
  words.forEach(word => {
    Object.keys(typoPatterns).forEach(correct => {
      if (word.includes(correct)) {
        keywords.add(correct);
        typoPatterns[correct].forEach(typo => keywords.add(typo));
      }
    });
  });
  
  // Add specific product type keywords
  if (nameLower.includes('floor')) {
    keywords.add('floor cleaner'); keywords.add('floor wash'); keywords.add('mopping liquid');
    keywords.add('phenyl'); keywords.add('floor disinfectant');
  }
  if (nameLower.includes('dish')) {
    keywords.add('dish wash'); keywords.add('dishwashing liquid'); keywords.add('utensil cleaner');
    keywords.add('vessel cleaning'); keywords.add('bartan liquid');
  }
  if (nameLower.includes('toilet') || nameLower.includes('bowl')) {
    keywords.add('toilet cleaner'); keywords.add('bathroom cleaner'); keywords.add('wc cleaner');
    keywords.add('commode cleaner'); keywords.add('harpic alternative');
  }
  if (nameLower.includes('fabric') || nameLower.includes('conditioner')) {
    keywords.add('fabric conditioner'); keywords.add('fabric softener'); keywords.add('clothes softener');
    keywords.add('comfort'); keywords.add('laundry conditioner');
  }
  if (nameLower.includes('liquid') && nameLower.includes('detergent')) {
    keywords.add('liquid detergent'); keywords.add('washing liquid'); keywords.add('washing gel');
    keywords.add('laundry liquid'); keywords.add('cloth washing');
  }
  if (nameLower.includes('phenyl')) {
    keywords.add('phenyl'); keywords.add('floor disinfectant'); keywords.add('floor cleaner');
    keywords.add('bathroom disinfectant');
  }
  if (nameLower.includes('acid')) {
    keywords.add('cleaning acid'); keywords.add('raw material'); keywords.add('chemical ingredient');
  }
  if (nameLower.includes('brush')) {
    keywords.add('cleaning brush'); keywords.add('scrubbing brush'); keywords.add('scrubber');
  }
  if (nameLower.includes('wiper')) {
    keywords.add('floor wiper'); keywords.add('water wiper'); keywords.add('squeegee');
  }
  if (nameLower.includes('mop')) {
    keywords.add('floor mop'); keywords.add('cleaning mop'); keywords.add('mopping tool');
  }
  if (nameLower.includes('glove')) {
    keywords.add('household gloves'); keywords.add('cleaning gloves'); keywords.add('rubber gloves');
  }
  if (nameLower.includes('duster')) {
    keywords.add('cleaning duster'); keywords.add('dust cloth'); keywords.add('dusting cloth');
  }
  
  return Array.from(keywords).slice(0, 15); // Limit to 15 keywords
}

// Generate description based on product name
function generateDescription(productName, categoryName) {
  const nameLower = productName.toLowerCase();
  
  // Floor cleaners
  if (nameLower.includes('floor') && nameLower.includes('cleaner')) {
    if (nameLower.includes('ultra')) return 'Premium ultra-powerful floor cleaning solution for all floor types';
    if (nameLower.includes('smart')) return 'Economical floor cleaning solution with effective cleaning power';
    return 'Effective floor cleaning solution for daily use';
  }
  
  // Dish wash
  if (nameLower.includes('dish') && nameLower.includes('wash')) {
    if (nameLower.includes('ultra')) return 'Ultra-concentrated dishwashing liquid that cuts through grease instantly';
    if (nameLower.includes('smart')) return 'Economical dishwashing solution with good grease-cutting power';
    return 'Effective dishwashing liquid for clean and shiny utensils';
  }
  
  // Fabric conditioner
  if (nameLower.includes('fabric') || nameLower.includes('conditioner')) {
    return 'Premium fabric conditioner for ultra-soft, fresh-smelling clothes';
  }
  
  // Liquid detergent
  if (nameLower.includes('liquid') && nameLower.includes('detergent')) {
    if (nameLower.includes('ultra')) return 'Ultra-concentrated liquid detergent for brilliant cleaning and shine';
    return 'Effective liquid detergent for machine and hand washing';
  }
  
  // Toilet cleaner
  if (nameLower.includes('toilet') || nameLower.includes('bowl')) {
    return 'Powerful toilet bowl cleaner that removes stains and kills germs';
  }
  
  // Stain remover
  if (nameLower.includes('stain')) {
    return 'Powerful stain remover for tough stains on clothes and fabrics';
  }
  
  // Phenyl
  if (nameLower.includes('phenyl')) {
    if (nameLower.includes('scented') || nameLower.includes('fragrent')) {
      const scent = nameLower.match(/(lemon|rose|jasmine|lavender|jawa)/)?.[0] || 'fresh';
      return `Scented phenyl with pleasant ${scent} fragrance for floor disinfection`;
    }
    return 'Powerful phenyl compound for floor cleaning and disinfection';
  }
  
  // Perfumes
  if (categoryName.includes('Perfume')) {
    const scent = productName.match(/\b(lime|ariel|surf|lemon|rose|jasmine|lavender|fruit|jawa)\b/i)?.[0] || 'fresh';
    if (nameLower.includes('dishwash')) return `Pleasant ${scent} fragrance for dishwashing products`;
    if (nameLower.includes('phenyl')) return `Strong ${scent} fragrance for phenyl and floor cleaners`;
    return `Premium ${scent} fragrance for cleaning product formulations`;
  }
  
  // Raw materials - Acids
  if (nameLower.includes('acid')) {
    if (nameLower.includes('acetic')) return 'High-quality acetic acid for cleaning product manufacturing';
    if (nameLower.includes('oleic')) return 'Premium oleic acid used in soap and detergent formulations';
    if (nameLower.includes('labsa')) return 'Linear Alkyl Benzene Sulfonic Acid - Essential surfactant for detergent manufacturing';
    return 'Industrial-grade acid for cleaning product formulations';
  }
  
  // Surfactants
  if (nameLower.includes('sles')) {
    return 'Sodium Lauryl Ether Sulfate - Premium surfactant for gentle cleaning products';
  }
  if (nameLower.includes('capb')) {
    return 'Cocamidopropyl Betaine - Mild surfactant for personal care products';
  }
  
  // Other chemicals
  if (nameLower.includes('glycerine')) return 'Pure glycerine for moisturizing and formulation purposes';
  if (nameLower.includes('tsp')) return 'Trisodium Phosphate - Effective cleaning and degreasing agent';
  if (nameLower.includes('edta')) return 'Ethylenediaminetetraacetic acid - Chelating agent for formulations';
  if (nameLower.includes('stpp')) return 'Sodium Tripolyphosphate - Water softener and detergent builder';
  
  // Brushes
  if (nameLower.includes('brush')) {
    if (nameLower.includes('toilet')) return 'Durable toilet cleaning brush with strong bristles';
    if (nameLower.includes('sink')) return 'Effective sink cleaning brush for utensils and vessels';
    if (nameLower.includes('carpet')) return 'Heavy-duty carpet brush for deep cleaning';
    if (nameLower.includes('container')) return 'Long-handle container brush for hard-to-reach areas';
    if (nameLower.includes('cloth')) return 'Gentle clothes brush for fabric care';
    return 'Durable cleaning brush for effective scrubbing';
  }
  
  // Wipers
  if (nameLower.includes('wiper')) {
    const size = productName.match(/\d+\s*(inch|cm)/i)?.[0] || '';
    if (nameLower.includes('floor')) return `Heavy-duty ${size} floor wiper for quick water removal`;
    if (nameLower.includes('glass')) return 'Glass wiper for streak-free window cleaning';
    return `Professional ${size} wiper for effective cleaning`;
  }
  
  // Mops
  if (nameLower.includes('mop')) {
    const size = productName.match(/\d+\s*inch/i)?.[0] || '';
    if (nameLower.includes('dry')) return `Complete ${size} dry mop set for dust-free floor cleaning`;
    if (nameLower.includes('microfiber')) return `Premium ${size} microfiber mop set for superior cleaning`;
    return `${size} mop set for effective floor cleaning`;
  }
  
  // Gloves
  if (nameLower.includes('glove')) {
    if (nameLower.includes('household')) return 'Durable household gloves for cleaning and kitchen tasks';
    return 'Protective gloves for cleaning and household work';
  }
  
  // Dusters
  if (nameLower.includes('duster')) {
    if (nameLower.includes('microfiber')) return 'Premium microfiber duster for effective dust removal';
    if (nameLower.includes('feather')) return 'Soft feather duster for delicate surfaces';
    return 'Effective cleaning duster for daily maintenance';
  }
  
  // Metal/furniture polish
  if (nameLower.includes('polish')) {
    if (nameLower.includes('silver')) return 'Professional silver polish for brilliant shine';
    if (nameLower.includes('metal')) return 'Multi-purpose metal polish for all metal surfaces';
    return 'Premium polish for lasting shine';
  }
  
  // Generic based on category
  if (categoryName.includes('Raw Material')) {
    return `Quality raw material for ${productName.toLowerCase()} in cleaning product manufacturing`;
  }
  
  if (categoryName.includes('Ready To Use')) {
    return `Ready-to-use ${productName.toLowerCase()} for immediate application`;
  }
  
  // Default
  return `Quality ${productName.toLowerCase()} for effective cleaning and maintenance`;
}

// Generate uses based on product type
function generateUses(productName, categoryName) {
  const nameLower = productName.toLowerCase();
  const uses = [];
  
  if (nameLower.includes('floor') && nameLower.includes('cleaner')) {
    uses.push('All types of floors - tiles, marble, granite, ceramic');
    uses.push('Removes dirt and stains effectively');
    uses.push('Disinfects and kills 99.9% germs');
    uses.push('Leaves pleasant fresh fragrance');
  } else if (nameLower.includes('dish')) {
    uses.push('Cleans all types of dishes and utensils');
    uses.push('Removes tough grease from pots and pans');
    uses.push('Cleans glassware without streaks');
    uses.push('Safe for non-stick cookware');
  } else if (nameLower.includes('fabric') || nameLower.includes('conditioner')) {
    uses.push('Softens clothes after washing');
    uses.push('Adds long-lasting fragrance to laundry');
    uses.push('Reduces static cling in clothes');
    uses.push('Makes ironing easier');
  } else if (nameLower.includes('liquid') && nameLower.includes('detergent')) {
    uses.push('Machine washing - front and top load');
    uses.push('Hand washing clothes');
    uses.push('Removes tough stains effectively');
    uses.push('Safe for all fabric types');
  } else if (nameLower.includes('toilet') || nameLower.includes('bowl')) {
    uses.push('Cleans and disinfects toilet bowls');
    uses.push('Removes tough stains and limescale');
    uses.push('Kills 99.9% germs and bacteria');
    uses.push('Eliminates bad odor');
  } else if (nameLower.includes('phenyl')) {
    uses.push('Floor cleaning and disinfection');
    uses.push('Bathroom sanitization');
    uses.push('Removes bad odors');
    uses.push('Prevents bacterial growth');
  } else if (nameLower.includes('acid') && categoryName.includes('Raw Material')) {
    uses.push('pH adjustment in formulations');
    uses.push('Cleaning product manufacturing');
    uses.push('Industrial cleaning solutions');
    uses.push('Descaling and degreasing');
  } else if (nameLower.includes('brush')) {
    uses.push('Effective scrubbing and cleaning');
    uses.push('Removes stubborn dirt and stains');
    uses.push('Durable for long-term use');
    uses.push('Comfortable grip for easy use');
  } else if (nameLower.includes('wiper')) {
    uses.push('Quick water removal from floors');
    uses.push('Window and glass cleaning');
    uses.push('Large area coverage');
    uses.push('Professional cleaning results');
  } else if (nameLower.includes('mop')) {
    uses.push('Daily floor cleaning and maintenance');
    uses.push('Dust and dirt removal');
    uses.push('Large area coverage');
    uses.push('Reusable and washable');
  } else if (nameLower.includes('glove')) {
    uses.push('Hand protection during cleaning');
    uses.push('Chemical handling safety');
    uses.push('Kitchen and household tasks');
    uses.push('Comfortable and durable');
  }
  
  return uses.length > 0 ? uses : ['Effective cleaning solution', 'Daily use', 'Safe and reliable'];
}

// Calculate popularity score based on product characteristics
function calculatePopularityScore(productName, categoryName, price) {
  let score = 50; // Base score
  
  const nameLower = productName.toLowerCase();
  
  // High demand products
  if (nameLower.includes('ultra')) score += 15;
  if (nameLower.includes('floor') && nameLower.includes('cleaner')) score += 20;
  if (nameLower.includes('dish') && nameLower.includes('wash')) score += 20;
  if (nameLower.includes('liquid') && nameLower.includes('detergent')) score += 18;
  if (nameLower.includes('fabric')) score += 15;
  if (nameLower.includes('phenyl')) score += 12;
  if (nameLower.includes('toilet')) score += 12;
  
  // Medium demand
  if (nameLower.includes('brush')) score += 10;
  if (nameLower.includes('wiper')) score += 10;
  if (nameLower.includes('mop')) score += 10;
  if (nameLower.includes('smart')) score += 8;
  
  // Category boost
  if (categoryName.includes('Ready To Use')) score += 15;
  if (categoryName.includes('Raw Material')) score += 5;
  
  // Price consideration (cheaper = more popular in general)
  if (price < 50) score += 10;
  else if (price < 100) score += 5;
  else if (price > 200) score -= 5;
  
  return Math.min(Math.max(score, 40), 98); // Clamp between 40-98
}

// Find related products
function findRelatedProducts(product, allProducts, categoryName) {
  const related = [];
  const nameLower = product.name.toLowerCase();
  const productId = product.id;
  
  // Find products in same category
  const sameCategory = allProducts
    .filter(p => p.categoryName === categoryName && p.id !== productId)
    .slice(0, 5);
  
  // Find products with similar names
  const similarName = allProducts
    .filter(p => {
      if (p.id === productId) return false;
      const pNameLower = p.name.toLowerCase();
      
      // Check for common words
      const words = nameLower.split(/[\s\-\/]+/);
      const pWords = pNameLower.split(/[\s\-\/]+/);
      const commonWords = words.filter(w => w.length > 3 && pWords.some(pw => pw.includes(w) || w.includes(pw)));
      
      return commonWords.length >= 1;
    })
    .slice(0, 5);
  
  // Combine and deduplicate
  const combined = [...new Set([...sameCategory, ...similarName])];
  
  // Return up to 5 related product IDs
  return combined.slice(0, 5).map(p => p.id);
}

// Process all products
function enhanceProducts() {
  const enhancedData = JSON.parse(JSON.stringify(productsData)); // Deep copy
  const allProducts = [];
  
  // First pass: collect all products with category info
  for (const [categoryKey, categoryData] of Object.entries(enhancedData.categories)) {
    const categoryName = categoryData.name || categoryKey;
    for (const product of categoryData.products || []) {
      allProducts.push({
        ...product,
        categoryKey,
        categoryName
      });
    }
  }
  
  console.log(`📊 Found ${allProducts.length} products to enhance\n`);
  
  let enhancedCount = 0;
  
  // Second pass: enhance each product
  for (const [categoryKey, categoryData] of Object.entries(enhancedData.categories)) {
    const categoryName = categoryData.name || categoryKey;
    
    console.log(`📁 Processing category: ${categoryName}`);
    
    for (const product of categoryData.products || []) {
      const price = product.mrp || product.price || 0;
      
      // Generate smart fields
      const keywords = generateKeywords(product.name, categoryName);
      const description = generateDescription(product.name, categoryName);
      const uses = generateUses(product.name, categoryName);
      const popularityScore = calculatePopularityScore(product.name, categoryName, price);
      const searchBoost = popularityScore >= 80 ? 1.5 : popularityScore >= 65 ? 1.3 : popularityScore >= 50 ? 1.1 : 1.0;
      const relatedProducts = findRelatedProducts(product, allProducts, categoryName);
      
      // Add enhanced fields
      product.description = description;
      product.keywords = keywords;
      product.uses = uses;
      product.related_products = relatedProducts;
      product.search_metadata = {
        popularity_score: popularityScore,
        search_boost: searchBoost,
        trending: popularityScore >= 85,
        featured: popularityScore >= 90
      };
      
      enhancedCount++;
      
      if (enhancedCount % 20 === 0) {
        console.log(`   ✅ Enhanced ${enhancedCount} products...`);
      }
    }
  }
  
  console.log(`\n✅ Enhanced all ${enhancedCount} products!\n`);
  
  return enhancedData;
}

// Main execution
try {
  const enhancedData = enhanceProducts();
  
  // Save enhanced data
  const outputFile = 'products_auto_enhanced.json';
  fs.writeFileSync(outputFile, JSON.stringify(enhancedData, null, 2));
  console.log(`💾 Saved enhanced data to: ${outputFile}`);
  
  // Create backup of original
  const backupFile = `products_backup_${Date.now()}.json`;
  fs.writeFileSync(backupFile, JSON.stringify(productsData, null, 2));
  console.log(`💾 Backup created: ${backupFile}`);
  
  // Generate statistics
  console.log('\n📊 Enhancement Statistics:');
  console.log('════════════════════════════════════════════════════════════');
  
  let totalProducts = 0;
  let highPopularity = 0;
  let mediumPopularity = 0;
  let totalKeywords = 0;
  
  for (const categoryData of Object.values(enhancedData.categories)) {
    for (const product of categoryData.products || []) {
      totalProducts++;
      totalKeywords += (product.keywords?.length || 0);
      
      const score = product.search_metadata?.popularity_score || 0;
      if (score >= 80) highPopularity++;
      else if (score >= 60) mediumPopularity++;
    }
  }
  
  console.log(`Total Products Enhanced: ${totalProducts}`);
  console.log(`Average Keywords per Product: ${(totalKeywords / totalProducts).toFixed(1)}`);
  console.log(`High Popularity (80+): ${highPopularity} products`);
  console.log(`Medium Popularity (60-79): ${mediumPopularity} products`);
  console.log('════════════════════════════════════════════════════════════');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Review the enhanced file: products_auto_enhanced.json');
  console.log('2. Test some products to verify enhancements');
  console.log('3. If satisfied, replace products.json with enhanced version:');
  console.log('   Copy-Item products_auto_enhanced.json products.json');
  console.log('4. Restart your bot: npm run start:smart');
  console.log('\n✨ Your bot is now 10x smarter! 🚀\n');
  
} catch (error) {
  console.error('❌ Error during enhancement:', error.message);
  console.error(error.stack);
  process.exit(1);
}
