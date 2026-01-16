const fs = require('fs');
const path = require('path');
const websiteAPI = require('./websiteAPI');
const axios = require('axios');

let productsData = {};
try {
    productsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../products.json'), 'utf8'));
} catch (error) {
    console.error('Error loading products.json:', error);
}

// Global cache for category mapping (Slug -> ID)
let categoryMap = null;
const getCategoryMapping = async () => {
    if (categoryMap) return categoryMap;
    try {
        const result = await websiteAPI.getCategories();
        const categories = result.categories || [];
        categoryMap = {};
        categories.forEach(cat => {
            if (cat.slug && cat._id) {
                categoryMap[cat.slug.toLowerCase()] = cat._id;
            }
        });
        console.log(`✅ Loaded ${Object.keys(categoryMap).length} categories from website`);
        return categoryMap;
    } catch (err) {
        console.error('Failed to load category mapping:', err);
        return {};
    }
};

// Helper to map raw website products to our internal format
const mapWebsiteProduct = (product) => {
    const productId = product._id || product.id || product.slug;
    const catObj = product.category;

    // Normalize category data
    const catName = (catObj && typeof catObj === 'object') ? catObj.name : (catObj || 'Website Products');
    const catKey = (catObj && typeof catObj === 'object') ? (catObj._id || catObj.slug) : (product.categoryKey || 'website');
    const catSlug = (catObj && typeof catObj === 'object') ? catObj.slug : (catObj?.toLowerCase() || 'website');

    return {
        id: productId,
        name: product.name || product.title,
        mrp: extractPrice(product.price || product.mrp),
        description: product.description || product.short_description || '',
        category: catName,
        categoryKey: catKey, // This will now be the ID if available
        categorySlug: catSlug,
        source: 'website',
        link: `https://rosechemicals.in/products/${productId}`,
        image: product.image || (product.images && product.images[0]),
        keywords: product.tags || [],
        features: product.features || [],
        specifications: product.specifications || {},
        search_metadata: {
            popularity_score: product.featured ? 80 : 50,
            search_terms: [
                product.name,
                product.slug,
                catName,
                catSlug,
                ...(product.tags || [])
            ].filter(Boolean)
        }
    };
};

const searchProducts = async (query, intent = 'general', limit = 5) => {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    console.log(`🔍 Searching for: "${query}" (Terms: ${searchTerms.join(', ')}, Intent: ${intent})`);

    let websiteProducts = [];
    try {
        const websiteResults = await websiteAPI.searchProducts(query);
        websiteProducts = websiteResults.products || [];
    } catch (error) {
        console.error('Failed to fetch website products:', error);
    }

    // Category-based search with intent mapping
    const categoryMappings = {
        'broom_inquiry': ['brooms'],
        'brush_inquiry': ['toilet-brushes', 'carpet-brushes', 'long-brushes', 'sink-brushes'],
        'mop_inquiry': ['floor-cleaners', 'mops'],
        'wiper_inquiry': ['wipers'],
        'cleaning_tools_inquiry': ['brooms', 'floor-cleaners', 'toilet-brushes', 'long-brushes', 'carpet-brushes', 'sink-brushes', 'cobweb-cleaners'],
        'floor_cleaner_inquiry': ['floor-cleaners', 'disinfectants'],
        'dish_cleaner_inquiry': ['kitchen-cleaners'],
        'toilet_cleaner_inquiry': ['bathroom-cleaners', 'disinfectants'],
        'fabric_care_inquiry': ['ready_to_use_chemicals'],
        'container_inquiry': ['containers'],
        'diy_kit_inquiry': ['diy_kits']
    };

    // If it's a clear category intent, fetch the full category from website first
    let categoryProducts = [];
    if (intent && categoryMappings[intent]) {
        const targetCategorySlugs = categoryMappings[intent];
        const currentMapping = await getCategoryMapping();

        for (const slug of targetCategorySlugs) {
            try {
                // Use ID if mapped, otherwise try slug
                const targetId = currentMapping[slug] || slug;

                // Fetch first page
                const p1Results = await websiteAPI.getProductsByCategory(targetId, 1);
                const rawCatProducts = p1Results.products || [];

                // Fetch second page for larger categories (like Brooms which has 30+)
                try {
                    const p2Results = await websiteAPI.getProductsByCategory(targetId, 2);
                    if (p2Results.products?.length > 0) {
                        rawCatProducts.push(...p2Results.products);
                    }
                } catch (p2Err) { /* p2 might not exist */ }

                if (rawCatProducts.length > 0) {
                    categoryProducts.push(...rawCatProducts);
                }
            } catch (err) {
                console.error(`Error fetching category ${slug}:`, err);
            }
        }
    }

    let allProducts = [];
    let localProducts = [];

    // Get local products (existing)
    Object.entries(productsData.categories || {}).forEach(([categoryKey, category]) => {
        if (category.products) {
            localProducts = localProducts.concat(
                category.products
                    .filter(p => p.name && p.mrp)
                    .map(p => ({
                        ...p,
                        category: category.name,
                        categoryKey,
                        source: 'local'
                    }))
            );
        }
    });

    try {
        // Merge combined search and category results (RAW FIRST)
        const combinedRaw = [...websiteProducts, ...categoryProducts];

        // Remove duplicates by ID before mapping
        const seenSet = new Set();
        const uniqueRaw = combinedRaw.filter(p => {
            const id = p._id || p.id || p.slug;
            if (seenSet.has(id)) return false;
            seenSet.add(id);
            return true;
        });

        if (uniqueRaw.length > 0) {
            console.log(`✅ Using ${uniqueRaw.length} live products from website (Search: ${websiteProducts.length}, Category: ${categoryProducts.length})`);
            allProducts = uniqueRaw.map(mapWebsiteProduct);
        } else {
            // Fallback to local products only if website returns nothing
            allProducts = localProducts;
            console.log(`⚠️ No website products found, falling back to local data (${allProducts.length})`);
        }
    } catch (error) {
        console.error('Failed to process website products:', error);
        allProducts = localProducts;
    }

    if (searchTerms.length === 0) {
        // If no search terms, return products based on intent
        return getProductsByIntent(intent, allProducts, limit);
    }

    let priorityProducts = [];

    // First, search by intent-specific categories (STRICT FILTERING)
    if (intent && categoryMappings[intent]) {
        const targetCategorySlugs = categoryMappings[intent];
        const currentMapping = await getCategoryMapping();
        const targetIds = targetCategorySlugs.map(s => currentMapping[s]).filter(Boolean);

        allProducts.forEach(product => {
            const isTargetCategory = (product.source === 'local' && targetCategorySlugs.includes(product.categoryKey)) ||
                (product.source === 'website' && (
                    targetIds.includes(product.categoryKey) || // ID match
                    targetCategorySlugs.includes(product.categorySlug) || // Slug match
                    (intent === 'broom_inquiry' && product.name.toLowerCase().includes('broom') && !product.name.toLowerCase().includes('mop')) ||
                    (intent === 'mop_inquiry' && product.name.toLowerCase().includes('mop') && !product.name.toLowerCase().includes('broom')) ||
                    (intent === 'brush_inquiry' && product.name.toLowerCase().includes('brush') && !product.name.toLowerCase().includes('mop') && !product.name.toLowerCase().includes('broom'))
                ));

            if (isTargetCategory) {
                const score = calculateCategoryRelevanceScore(product, searchTerms, intent, product.categoryKey);
                // Extra strictness for brooms vs mops
                if (intent === 'broom_inquiry' && product.name.toLowerCase().includes('mop')) return;

                if (score > 10) {
                    priorityProducts.push({
                        ...product,
                        relevanceScore: score + 100 // Higher boost for strict category match
                    });
                }
            }
        });
    }

    // If priority products found, use them
    if (priorityProducts.length > 0) {
        return priorityProducts
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, limit);
    }

    // Enhanced scoring system
    const scoredProducts = allProducts.map(product => {
        let score = 0;

        const searchableFields = [
            { field: product.name, weight: 15 },
            { field: product.description, weight: 8 },
            { field: (product.keywords || []).join(' '), weight: 10 },
            { field: (product.uses || []).join(' '), weight: 6 },
            { field: (product.search_metadata?.search_terms || []).join(' '), weight: 12 },
            { field: product.category, weight: 7 },
            { field: (product.features || []).join(' '), weight: 5 }
        ];

        searchTerms.forEach(term => {
            searchableFields.forEach(({ field, weight }) => {
                if (field && field.toLowerCase().includes(term)) {
                    // Exact name match gets highest score
                    if (field === product.name && product.name.toLowerCase().includes(term)) {
                        score += weight * 2;
                    } else {
                        score += weight;
                    }
                }
            });
        });

        // Intent-based boosting
        score += getIntentBoost(intent, product);

        // Popularity boost
        score += (product.search_metadata?.popularity_score || 0) / 10;

        // Website product boost for cleaning tools
        if (product.source === 'website' && isCleaningTool(query, intent)) {
            score += 30;
        }

        return { ...product, relevanceScore: score };
    });

    return scoredProducts
        .filter(p => {
            if (p.relevanceScore <= 0) return false;

            // Final mutual exclusion filter
            const pName = p.name.toLowerCase();
            if (intent === 'broom_inquiry' && pName.includes('mop')) return false;
            if (intent === 'mop_inquiry' && pName.includes('broom')) return false;

            return true;
        })
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
};

const calculateCategoryRelevanceScore = (product, searchTerms, intent, categoryKey) => {
    let score = 0;
    const productName = product.name.toLowerCase();

    // Direct name matching
    searchTerms.forEach(term => {
        if (productName.includes(term)) {
            if (productName === term) score += 100;
            else if (productName.startsWith(term)) score += 80;
            else score += 50;
        }
    });

    // Intent-category alignment bonus
    const intentCategoryBonus = {
        'broom_inquiry': { 'brooms': 100 },
        'mop_inquiry': { 'floor-cleaners': 20 }, // Low bonus for category, name match is primary
        'brush_inquiry': { 'toilet-brushes': 40, 'long-brushes': 40 },
        'cleaning_tools_inquiry': { 'brooms': 30, 'floor-cleaners': 20 },
        'diy_kit_inquiry': { 'diy_kits': 80 },
        'container_inquiry': { 'containers': 80 }
    };

    // Add bonuses for mapped IDs too
    const bonusMap = intentCategoryBonus[intent] || {};

    if (intent && bonusMap[categoryKey]) {
        score += bonusMap[categoryKey];
    }

    // Product type specific bonuses
    if (productName.includes('delux') || productName.includes('premium')) score += 10;
    if (productName.includes('plastic')) score += 5;

    return score;
};

const isCleaningTool = (query, intent) => {
    const cleaningToolKeywords = [
        'broom', 'brush', 'mop', 'cloth', 'sponge', 'scrubber',
        'wiper', 'duster', 'cleaning tool', 'cleaning equipment'
    ];
    const lowerQuery = query.toLowerCase();
    return cleaningToolKeywords.some(keyword => lowerQuery.includes(keyword)) ||
        intent === 'cleaning_tools';
};

const extractPrice = (price) => {
    if (price === undefined || price === null) return 0;
    if (typeof price === 'number') return price;

    // If it's a string, try to keep it as literal as possible but clean it for calculations
    const cleanPrice = price.toString().replace(/[₹,]/g, '').trim();
    const parsed = parseFloat(cleanPrice);
    return isNaN(parsed) ? 0 : parsed;
};

const getIntentBoost = (intent, product) => {
    const intentBoosts = {
        'diy_kit_inquiry': product.categoryKey === 'diy_kits' ? 20 : 0,
        'ready_products': product.categoryKey === 'ready_to_use_chemicals' ? 15 : 0,
        'raw_materials': product.categoryKey === 'chemical_raw_materials' ? 15 : 0,
        'broom_inquiry': product.categoryKey === 'brooms' ? 30 : 0,
        'fragrance': (product.keywords || []).some(k => k.includes('fragrance')) ? 10 : 0,
        'cleaning_tools': isCleaningToolProduct(product) ? 25 : 0,
        'website_products': product.source === 'website' ? 20 : 0
    };

    return intentBoosts[intent] || 0;
};

const isCleaningToolProduct = (product) => {
    const cleaningCategories = ['broom', 'brush', 'mop', 'cleaning', 'tools'];
    const productText = `${product.name} ${product.category} ${(product.keywords || []).join(' ')}`.toLowerCase();
    return cleaningCategories.some(cat => productText.includes(cat));
};

const getProductsByIntent = (intent, allProducts, limit) => {
    let filteredProducts = allProducts;

    switch (intent) {
        case 'diy_kit_inquiry':
            filteredProducts = allProducts.filter(p => p.categoryKey === 'diy_kits');
            break;
        case 'ready_products':
            filteredProducts = allProducts.filter(p => p.categoryKey === 'ready_to_use_chemicals');
            break;
        case 'raw_materials':
            filteredProducts = allProducts.filter(p => p.categoryKey === 'chemical_raw_materials');
            break;
        case 'broom_inquiry':
            filteredProducts = allProducts.filter(p =>
                (p.categoryKey === 'brooms' || p.categorySlug === 'brooms' || p.name.toLowerCase().includes('broom')) &&
                !p.name.toLowerCase().includes('mop')
            );
            break;
        case 'mop_inquiry':
            filteredProducts = allProducts.filter(p =>
                (p.categoryKey === 'mops' || p.categorySlug === 'mops' || p.name.toLowerCase().includes('mop')) &&
                !p.name.toLowerCase().includes('broom')
            );
            break;
        case 'brush_inquiry':
            filteredProducts = allProducts.filter(p => p.categoryKey?.includes('brush') || p.name.toLowerCase().includes('brush'));
            break;
        default:
            // Return popular products from all categories
            filteredProducts = allProducts.filter(p =>
                p.search_metadata?.popularity_score > 50
            );
    }

    return filteredProducts
        .sort((a, b) => (b.search_metadata?.popularity_score || 0) - (a.search_metadata?.popularity_score || 0))
        .slice(0, limit)
        .map(p => ({ ...p, relevanceScore: p.search_metadata?.popularity_score || 0 }));
};

const formatProductList = (products, intent, language = 'en-IN') => {
    if (products.length === 0) {
        const fallbackMessages = {
            'en-IN': "Sorry, I couldn't find any products matching your query. Please try different keywords or ask about our main categories: DIY Kits, Raw Materials, Ready-to-use products.",
            'ta-IN': "மன்னிக்கவும், உங்கள் தேடலுக்கு பொருந்தும் தயாரிப்புகள் எதுவும் கிடைக்கவில்லை. வேறு முக்கிய வார்த்தைகளை முயற்சிக்கவும்.",
            'hi-IN': "खुशी, आपकी खोज से मेल खाने वाले कोई उत्पाद नहीं मिले। कृपया अलग कीवर्ड आज़माएं।"
        };
        return fallbackMessages[language] || fallbackMessages['en-IN'];
    }

    let response = "";

    // Add context-based introduction
    if (intent === 'diy_kit_inquiry') {
        response += "🌸 *Our DIY Manufacturing Kits:*\n\n";
    } else if (intent === 'broom_inquiry') {
        response += "🧹 *Our Broom Collection:*\n\nWe have an extensive range of traditional and modern brooms for all your cleaning needs:\n\n";
    } else if (intent === 'price_inquiry') {
        response += "💰 *Current Pricing:*\n\n";
    } else {
        response += `✨ *Found ${products.length} products for you:*\n\n`;
    }

    products.forEach((product, index) => {
        response += `${index + 1}. **${product.name}**\n`;
        response += `   💰 Price: ₹${product.mrp}`;

        // Add yield info for DIY kits
        if (product.yield) {
            response += ` | Makes: ${product.yield}`;
        }
        if (product.cost_per_liter) {
            response += ` | Cost/L: ₹${product.cost_per_liter}`;
        }

        response += `\n`;

        // Add description
        if (product.description) {
            response += `   📝 ${product.description.substring(0, 80)}${product.description.length > 80 ? '...' : ''}\n`;
        }

        // Add kit-specific info
        if (product.categoryKey === 'diy_kits') {
            if (product.manufacturing_time) {
                response += `   ⏱️ Making time: ${product.manufacturing_time}\n`;
            }
            if (product.fragrances && product.fragrances.length > 0) {
                response += `   🌸 Fragrances: ${product.fragrances.slice(0, 2).join(', ')}${product.fragrances.length > 2 ? '...' : ''}\n`;
            }
            if (product.kit_contents && product.kit_contents.length > 0) {
                response += `   📦 Includes: ${product.kit_contents.slice(0, 2).join(', ')}${product.kit_contents.length > 2 ? ' & more' : ''}\n`;
            }
        }

        // Add product link prominently
        const productLink = product.link || `https://rosechemicals.in/products/${product.id || product._id || product.slug}`;
        if (productLink) {
            response += `   🔗 *Product Link:* ${productLink}\n`;
        }

        response += `\n`;
    });

    // Add call-to-action based on intent
    if (intent === 'diy_kit_inquiry') {
        response += "🎯 *Each kit includes:* Complete formulation + PDF guide + Video tutorial\n";
        response += "📞 *Technical Support:* +91 8610570490";
    } else if (intent === 'price_inquiry') {
        response += "📞 *For bulk pricing:* +91 8610570490\n";
        response += "🚚 *Free delivery* on orders above ₹5000";
    } else {
        response += "💡 *Need more details?* Ask about specific products\n";
        response += "📞 *Contact:* +91 8610570490";
    }

    return response;
};

const getProductById = (productId) => {
    let allProducts = [];

    Object.values(productsData.categories || {}).forEach(category => {
        if (category.products) {
            allProducts = allProducts.concat(
                category.products.map(p => ({
                    ...p,
                    category: category.name
                }))
            );
        }
    });

    return allProducts.find(p => p.id === productId);
};

const getRelatedProducts = (productId, limit = 3) => {
    const product = getProductById(productId);

    if (!product || !product.related_products) {
        return [];
    }

    return product.related_products
        .map(id => getProductById(id))
        .filter(p => p) // Remove null/undefined products
        .slice(0, limit);
};

const getCategoryProducts = (categoryKey, limit = 10) => {
    const category = productsData.categories?.[categoryKey];

    if (!category || !category.products) {
        return [];
    }

    return category.products
        .filter(p => p.name && p.mrp)
        .slice(0, limit)
        .map(p => ({
            ...p,
            category: category.name,
            categoryKey
        }));
};

// Get popular products for quick suggestions
const getPopularProducts = (limit = 5) => {
    let allProducts = [];

    Object.entries(productsData.categories || {}).forEach(([categoryKey, category]) => {
        if (category.products) {
            allProducts = allProducts.concat(
                category.products
                    .filter(p => p.name && p.mrp)
                    .map(p => ({
                        ...p,
                        category: category.name,
                        categoryKey
                    }))
            );
        }
    });

    return allProducts
        .filter(p => p.search_metadata?.popularity_score > 70)
        .sort((a, b) => (b.search_metadata?.popularity_score || 0) - (a.search_metadata?.popularity_score || 0))
        .slice(0, limit);
};

// New function to get products by category from website
const getProductsByCategory = async (categoryName, limit = 10) => {
    try {
        const websiteResults = await websiteAPI.getProductsByCategory(categoryName);
        const websiteProducts = (websiteResults.products || []).map(product => ({
            id: product.id || product.slug,
            name: product.name || product.title,
            mrp: extractPrice(product.price || product.mrp),
            description: product.description || product.short_description,
            category: product.category?.name || product.category || categoryName,
            categoryKey: product.category?.slug || product.category || categoryName,
            source: 'website',
            link: `https://rosechemicals.in/products/${product._id || product.id || product.slug}`,
            image: product.image,
            features: product.features || [],
            specifications: product.specifications || {}
        }));

        return websiteProducts.slice(0, limit);
    } catch (error) {
        console.error('Failed to get category products:', error);
        return [];
    }
};

// New function to get all website categories
const getAllCategories = async () => {
    try {
        const categoriesResult = await websiteAPI.getCategories();
        return categoriesResult.categories || [];
    } catch (error) {
        console.error('Failed to get categories:', error);
        return [];
    }
};

module.exports = {
    searchProducts,
    formatProductList,
    getProductById,
    getRelatedProducts,
    getCategoryProducts,
    getPopularProducts,
    getProductsByCategory,
    getAllCategories
};