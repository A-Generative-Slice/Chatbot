const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const productsPath = path.join(__dirname, '../products.json');
let data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

let fixCount = 0;
data.products = data.products.map(p => {
    // If ID is not 24 hex chars
    if (!p.id.match(/^[0-9a-fA-F]{24}$/)) {
        // Generate a stable hex ID based on the old ID
        const hash = crypto.createHash('sha256').update(p.id).digest('hex');
        const newId = hash.substring(0, 24);
        console.log(`Fixing ${p.id} -> ${newId} (${p.name})`);
        p.id = newId;
        p.link = `https://rosechemicals.in/products/${newId}`;
        fixCount++;
    }
    return p;
});

fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));
console.log(`✅ Fixed ${fixCount} product IDs to Hex!`);
