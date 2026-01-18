const fs = require('fs');
const path = require('path');

let productsData = { products: [], categories: [] };
try {
    productsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../products.json'), 'utf8'));
} catch (error) {
    console.error('Error loading products.json:', error);
}

const allProducts = productsData.products || [];

/**
 * Searches for products in the local dataset.
 * 100% Offline/Local - Zero hitting the live website VPS.
 */
const searchProducts = async (query, intent = 'general', limit = 6) => {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1);
    const intentLower = (intent || 'general').toLowerCase();

    console.log(`🔍 Local Search: "${query}" (Intent: ${intent})`);

    // 1. Mutual Exclusion Rules
    const isBroomQuery = intentLower === 'broom_inquiry' || searchTerms.includes('broom') || searchTerms.includes('brush');
    const isMopQuery = intentLower === 'mop_inquiry' || searchTerms.includes('mop');

    // 2. Initial Filtering & Scoring
    let scored = allProducts.map(p => {
        let score = 0;
        const pName = p.name.toLowerCase();
        const pDesc = p.description.toLowerCase();
        const pCat = p.category.toLowerCase();

        // High priority: Name matches
        for (const term of searchTerms) {
            if (pName === term) score += 100;
            else if (pName.startsWith(term)) score += 60;
            else if (pName.includes(term)) score += 30;

            if (pCat.includes(term)) score += 40;
            if (pDesc.includes(term)) score += 10;
        }

        // Intent Bonus
        if (intentLower === 'broom_inquiry' && p.categoryKey === 'brooms') score += 50;
        if (intentLower === 'mop_inquiry' && p.categoryKey === 'floor-cleaners') score += 50;
        if (intentLower === 'diy_kit_inquiry' && p.categoryKey === 'diy_kits') score += 80;

        // Mutual Exclusion (Hard Filter)
        if (isMopQuery && pName.includes('broom')) score = -1;
        if (isBroomQuery && pName.includes('mop')) score = -1;

        return { ...p, relevanceScore: score };
    });

    // 3. Sort and Filter
    let results = scored
        .filter(p => p.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

    // 4. Smart Alternative Suggestions (Sales Person Brain)
    if (results.length === 0 && searchTerms.length > 0) {
        console.log("💡 Suggesting alternatives...");
        results = allProducts
            .filter(p => {
                const pCat = p.category.toLowerCase();
                // Suggest items in same category as intent or first search term
                return pCat.includes(searchTerms[0]) || (intentLower !== 'general' && p.categoryKey === intentLower.split('_')[0]);
            })
            .slice(0, limit)
            .map(p => ({ ...p, isAlternative: true }));
    }

    return results.slice(0, limit);
};

const formatProductList = (products, intent, language = 'en-IN') => {
    if (products.length === 0) {
        return "I'm sorry, I couldn't find exactly what you were looking for. 🌸\n\nBut we have amazing DIY Kits and Cleaning Tools! Would you like to see our best-sellers? ✨";
    }

    let response = "";
    const isAlternative = products.some(p => p.isAlternative);

    if (isAlternative) {
        response += "🌸 *I couldn't find the exact match, but you'll love these:* \n\n";
    } else if (intent === 'diy_kit_inquiry') {
        response += "✨ *Our Professional DIY Kits:* \n\n";
    } else if (intent === 'broom_inquiry') {
        response += "🧹 *Our Premium Brooms & Brushes:* \n\n";
    } else {
        response += "✨ *Here are the best products for you:* \n\n";
    }

    products.forEach((p, i) => {
        response += `${i + 1}. *${p.name}*\n`;
        response += `   💰 Price: *₹${p.mrp}*`;
        if (p.yield) response += ` | Makes: ${p.yield}`;
        response += `\n   🔗 Link: ${p.link}\n\n`;
    });

    response += "_Need more details? I'm here to help!_ 🌸";
    return response;
};

const getProductById = (productId) => {
    return allProducts.find(p => p.id === productId || p._id === productId);
};

const getCategoryProducts = (categoryKey, limit = 10) => {
    return allProducts
        .filter(p => p.categoryKey === categoryKey || p.categorySlug === categoryKey)
        .slice(0, limit);
};

const getAllCategories = async () => productsData.categories || [];

module.exports = {
    searchProducts,
    formatProductList,
    getProductById,
    getCategoryProducts,
    getAllCategories
};