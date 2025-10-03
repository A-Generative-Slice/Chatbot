#!/usr/bin/env python3
"""
AI-Powered Search Service for WhatsApp Bot
Uses sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 for semantic search
"""

import json
import numpy as np
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import logging
from typing import List, Dict, Tuple
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Global variables
model = None
products_data = None
product_embeddings = None
product_list = []

def load_model():
    """Load the sentence transformer model"""
    global model
    # Better options for Indian languages:
    # Option 1: AI4Bharat model (specifically for Indian languages)
    logger.info("🤖 Loading AI4Bharat model: ai4bharat/indic-bert")
    model = SentenceTransformer('sentence-transformers/LaBSE')  # Better multilingual
    
    # Option 2: Use LaBSE for better multilingual support
    # model = SentenceTransformer('sentence-transformers/LaBSE')
    
    # Option 3: Use multilingual-e5 (very good for Indian languages)
    # model = SentenceTransformer('intfloat/multilingual-e5-large')
    try:
        model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        logger.info("✅ Model loaded successfully!")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        return False

def load_products():
    """Load products from JSON file and create embeddings"""
    global products_data, product_embeddings, product_list
    
    try:
        # Load products.json
        with open('products.json', 'r', encoding='utf-8') as f:
            products_data = json.load(f)
        
        # Extract all products into a flat list
        product_list = []
        for category_key, category_data in products_data['categories'].items():
            category_name = category_data['name']
            for product in category_data['products']:
                product_info = {
                    'id': product['id'],
                    'name': product['name'],
                    'mrp': product['mrp'],
                    'category': category_name,
                    'category_key': category_key
                }
                product_list.append(product_info)
        
        logger.info(f"📦 Loaded {len(product_list)} products from {len(products_data['categories'])} categories")
        
        # Create embeddings for all product names
        logger.info("🧠 Creating semantic embeddings for all products...")
        product_names = [product['name'] for product in product_list]
        product_embeddings = model.encode(product_names, convert_to_tensor=False)
        
        logger.info("✅ Product embeddings created successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to load products: {e}")
        return False

def semantic_search(query: str, top_k: int = 10, similarity_threshold: float = 0.3) -> List[Dict]:
    """
    Perform semantic search using the AI model
    
    Args:
        query: User's search query
        top_k: Number of top results to return
        similarity_threshold: Minimum similarity score to include a result
    
    Returns:
        List of matching products with similarity scores
    """
    if model is None or product_embeddings is None or len(product_list) == 0:
        return []
    
    try:
        # Create embedding for the query
        query_embedding = model.encode([query], convert_to_tensor=False)
        
        # Calculate cosine similarities
        from sklearn.metrics.pairwise import cosine_similarity
        similarities = cosine_similarity(query_embedding, product_embeddings)[0]
        
        # Get top results above threshold
        results = []
        for i, similarity in enumerate(similarities):
            similarity_score = float(similarity)
            if similarity_score >= similarity_threshold:
                product = product_list[i].copy()
                product['similarity_score'] = similarity_score
                results.append(product)
        
        # Sort by similarity score (descending) and return top_k
        results.sort(key=lambda x: x['similarity_score'], reverse=True)
        return results[:top_k]
        
    except Exception as e:
        logger.error(f"❌ Search error: {e}")
        return []

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    status = {
        'status': 'healthy',
        'model_loaded': model is not None,
        'products_loaded': len(product_list) if product_list else 0,
        'service': 'AI Search Service'
    }
    return jsonify(status)

@app.route('/search', methods=['POST'])
def search_products():
    """
    Main search endpoint
    Expects: {"query": "user search query", "top_k": 10, "threshold": 0.3}
    Returns: {"results": [...], "query": "...", "total_found": 5}
    """
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'Missing query parameter'}), 400
        
        query = data['query'].strip()
        top_k = data.get('top_k', 10)
        threshold = data.get('threshold', 0.3)
        
        if not query:
            return jsonify({'error': 'Empty query'}), 400
        
        logger.info(f"🔍 Searching for: '{query}' (top_k={top_k}, threshold={threshold})")
        
        # Perform semantic search
        results = semantic_search(query, top_k, threshold)
        
        response = {
            'results': results,
            'query': query,
            'total_found': len(results),
            'search_type': 'semantic'
        }
        
        logger.info(f"✅ Found {len(results)} results for '{query}'")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Search endpoint error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/conversation', methods=['POST'])
def handle_conversation():
    """Handle product-related conversations with pre-written responses"""
    try:
        data = request.json
        query = data.get('query', '').lower().strip()
        context = data.get('context', {})
        
        # Basic conversation responses for common product questions
        conversation_responses = {
            # Color related questions
            'color': {
                'en': "Our products come in various colors depending on the specific item. For exact color options, please check the product description or contact our customer service.",
                'hi': "हमारे उत्पाद विभिन्न रंगों में उपलब्ध हैं जो विशिष्ट वस्तु पर निर्भर करता है। सटीक रंग विकल्पों के लिए, कृपया उत्पाद विवरण देखें या हमारी ग्राहक सेवा से संपर्क करें।"
            },
            # Water/mixing related questions
            'water': {
                'en': "Mixing ratios vary by product. Generally, follow the instructions on the product packaging. For cement bonding agents, typically mix 1:3 with water. For specific ratios, please refer to the product manual.",
                'hi': "मिश्रण अनुपात उत्पाद के अनुसार अलग होता है। आमतौर पर, उत्पाद पैकेजिंग पर दिए गए निर्देशों का पालन करें। सीमेंट बंधन एजेंट के लिए, आमतौर पर पानी के साथ 1:3 मिलाएं।"
            },
            # Usage/application questions
            'usage': {
                'en': "Each product has specific usage instructions. Please check the product label or manual for detailed application guidelines. Our customer service can provide additional guidance.",
                'hi': "प्रत्येक उत्पाद के विशिष्ट उपयोग निर्देश हैं। विस्तृत अनुप्रयोग दिशानिर्देशों के लिए उत्पाद लेबल या मैनुअल देखें।"
            },
            # Safety related questions
            'safety': {
                'en': "Always follow safety guidelines mentioned on product packaging. Use protective equipment as recommended. Keep away from children and store in a cool, dry place.",
                'hi': "हमेशा उत्पाद पैकेजिंग पर बताए गए सुरक्षा दिशानिर्देशों का पालन करें। सुझाए गए सुरक्षा उपकरण का उपयोग करें।"
            },
            # General product questions
            'general': {
                'en': "Thank you for your question about our products! For detailed information, please check the product specifications or contact our customer service team.",
                'hi': "हमारे उत्पादों के बारे में आपके प्रश्न के लिए धन्यवाद! विस्तृत जानकारी के लिए, कृपया उत्पाद विनिर्देश देखें या हमारी ग्राहक सेवा टीम से संपर्क करें।"
            }
        }
        
        # Detect conversation intent based on keywords
        response_type = 'general'
        language = 'en'
        
        # Detect conversation type first
        if any(word in query for word in ['color', 'रंग', 'colour']):
            response_type = 'color'
        elif any(word in query for word in ['water', 'पानी', 'mix', 'ratio', 'मिलाना', 'कितना']):
            response_type = 'water'
        elif any(word in query for word in ['use', 'usage', 'apply', 'उपयोग', 'इस्तेमाल']):
            response_type = 'usage'
        elif any(word in query for word in ['safe', 'safety', 'side effect', 'सुरक्षा']):
            response_type = 'safety'
        
        # Detect Hindi keywords and set language
        hindi_keywords = ['रंग', 'पानी', 'कैसे', 'क्या', 'कितना', 'उपयोग', 'मिलाना']
        if any(keyword in query for keyword in hindi_keywords):
            language = 'hi'
        
        response_text = conversation_responses[response_type][language]
        
        return jsonify({
            'response': response_text,
            'type': 'conversation',
            'detected_intent': response_type,
            'language': language
        })
        
    except Exception as e:
        logger.error(f"Error in conversation: {e}")
        return jsonify({
            'response': "I'm here to help with product questions. Please ask about specific products or contact our customer service.",
            'type': 'conversation',
            'error': str(e)
        }), 500

@app.route('/categories', methods=['GET'])
def get_categories():
    """Get all available categories"""
    if not products_data:
        return jsonify({'error': 'Products not loaded'}), 500
    
    categories = {}
    for key, category in products_data['categories'].items():
        categories[key] = {
            'name': category['name'],
            'product_count': len(category['products'])
        }
    
    return jsonify({'categories': categories})

@app.route('/reload', methods=['POST'])
def reload_data():
    """Reload products and recreate embeddings"""
    try:
        logger.info("🔄 Reloading products and recreating embeddings...")
        success = load_products()
        if success:
            return jsonify({'status': 'success', 'message': 'Products reloaded successfully'})
        else:
            return jsonify({'status': 'error', 'message': 'Failed to reload products'}), 500
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

def initialize_service():
    """Initialize the AI search service"""
    logger.info("🚀 Initializing AI Search Service...")
    
    # Load the AI model
    if not load_model():
        logger.error("❌ Failed to initialize: Could not load AI model")
        return False
    
    # Load products and create embeddings
    if not load_products():
        logger.error("❌ Failed to initialize: Could not load products")
        return False
    
    logger.info("✅ AI Search Service initialized successfully!")
    return True

if __name__ == '__main__':
    # Initialize the service
    if initialize_service():
        logger.info("🌐 Starting AI Search Service on http://localhost:5000")
        logger.info("📡 Available endpoints:")
        logger.info("  - POST /search - Semantic product search")
        logger.info("  - GET /health - Service health check")
        logger.info("  - GET /categories - List all categories")
        logger.info("  - POST /reload - Reload products")
        logger.info("═" * 60)
        
        # Start the Flask server
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        logger.error("❌ Failed to start service")
        exit(1)