#!/usr/bin/env python3
"""
Enhanced AI-Powered Search Service with Sarvam-1 Conversation
Combines semantic search with conversational AI for product inquiries
"""

import json
import numpy as np
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from transformers import AutoModelForCausalLM, AutoTokenizer
import logging
from typing import List, Dict, Tuple
import os
import torch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Global variables
search_model = None
conversation_model = None
conversation_tokenizer = None
products_data = None
product_embeddings = None
product_list = []

def load_models():
    """Load both search and conversation models"""
    global search_model, conversation_model, conversation_tokenizer
    
    # Load search model (keep existing for product search)
    logger.info("🔍 Loading search model: sentence-transformers/LaBSE")
    search_model = SentenceTransformer('sentence-transformers/LaBSE')
    
    # Load Sarvam-1 for conversations
    logger.info("🤖 Loading Sarvam-1 for conversations...")
    try:
        conversation_model = AutoModelForCausalLM.from_pretrained(
            "sarvamai/sarvam-1",
            torch_dtype=torch.bfloat16,
            device_map="auto",
            trust_remote_code=True
        )
        conversation_tokenizer = AutoTokenizer.from_pretrained("sarvamai/sarvam-1")
        logger.info("✅ Sarvam-1 loaded successfully!")
    except Exception as e:
        logger.error(f"❌ Failed to load Sarvam-1: {e}")
        conversation_model = None
        conversation_tokenizer = None

def load_products():
    """Load products from JSON file"""
    global products_data, product_embeddings, product_list
    
    try:
        with open('products.json', 'r', encoding='utf-8') as f:
            products_data = json.load(f)
        
        # Create product list for embeddings
        product_list = []
        for category, items in products_data.items():
            for item in items:
                product_info = f"{item['name']} {category} {item.get('description', '')}"
                product_list.append({
                    'name': item['name'],
                    'category': category,
                    'price': item.get('mrp', 'N/A'),
                    'description': item.get('description', ''),
                    'search_text': product_info
                })
        
        # Generate embeddings
        logger.info(f"🔄 Generating embeddings for {len(product_list)} products...")
        search_texts = [product['search_text'] for product in product_list]
        product_embeddings = search_model.encode(search_texts)
        
        logger.info(f"✅ Products loaded: {len(product_list)} items")
        
    except Exception as e:
        logger.error(f"❌ Error loading products: {e}")
        products_data = {}
        product_list = []

class ConversationHandler:
    """Handles product conversations using Sarvam-1"""
    
    def __init__(self):
        self.company_context = """
Rose Chemicals एक भारतीय ई-कॉमर्स कंपनी है जो बेचती है:
1. Chemicals & Raw Materials: एसिटिक एसिड, सॉल्वेंट्स, औद्योगिक रसायन
2. Cleaning Products: डिटर्जेंट, साबुन, सैनिटाइज़र, टॉयलेट क्लीनर
3. Perfumes & Fragrances: एसेंशियल ऑयल, परफ्यूम बेस, सुगंधित यौगिक
4. Brushes & Equipment: सफाई ब्रश, औद्योगिक ब्रश, कंटेनर

हम भारत भर में घरेलू और औद्योगिक उपयोग के लिए गुणवत्तापूर्ण उत्पाद प्रदान करते हैं।
"""
    
    def classify_intent(self, message):
        """Classify if message is a product question or search query"""
        question_indicators = [
            'does', 'is', 'can', 'will', 'how', 'what', 'which', 'when', 'where',
            'क्या', 'कैसे', 'कौन', 'कब', 'कहाँ', 'किस', 'मिलता', 'उपलब्ध',
            'color', 'colour', 'रंग', 'water', 'पानी', 'mix', 'मिला', 'use', 'उपयोग'
        ]
        
        message_lower = message.lower()
        
        # Check for question indicators
        if any(indicator in message_lower for indicator in question_indicators):
            return 'question'
        
        # Check for search patterns
        search_indicators = ['show', 'find', 'search', 'get', 'need', 'want', 'दिखा', 'चाहिए', 'खोज']
        if any(indicator in message_lower for indicator in search_indicators):
            return 'search'
        
        return 'unknown'
    
    def answer_product_question(self, question, product_context=None):
        """Generate conversational response using Sarvam-1"""
        if not conversation_model or not conversation_tokenizer:
            return self.fallback_answer(question, product_context)
        
        try:
            # Build context-aware prompt
            context = self.company_context
            if product_context:
                context += f"\nProduct information: {json.dumps(product_context, ensure_ascii=False)}"
            
            # Create prompt in multiple languages
            prompt = f"""{context}

Customer Question: {question}

Please provide a helpful, accurate response about this product question in the same language as the question. If you don't have specific information, suggest contacting customer service. Keep response concise and helpful.

Response:"""

            # Generate response
            inputs = conversation_tokenizer(
                prompt, 
                return_tensors="pt", 
                max_length=1024, 
                truncation=True
            )
            
            with torch.no_grad():
                outputs = conversation_model.generate(
                    **inputs,
                    max_new_tokens=150,
                    temperature=0.7,
                    do_sample=True,
                    pad_token_id=conversation_tokenizer.eos_token_id,
                    repetition_penalty=1.1
                )
            
            # Extract response
            full_response = conversation_tokenizer.decode(outputs[0], skip_special_tokens=True)
            response = full_response.split("Response:")[-1].strip()
            
            # Clean up response
            if len(response) < 10:  # If response too short, use fallback
                return self.fallback_answer(question, product_context)
            
            return response[:500]  # Limit length for WhatsApp
            
        except Exception as e:
            logger.error(f"Sarvam-1 error: {e}")
            return self.fallback_answer(question, product_context)
    
    def fallback_answer(self, question, product_context=None):
        """Fallback responses when Sarvam-1 is not available"""
        question_lower = question.lower()
        
        responses = {
            'color': "हमारे उत्पाद विभिन्न रंगों में उपलब्ध हैं। कृपया विशिष्ट रंग की जानकारी के लिए हमसे संपर्क करें।",
            'water': "मिश्रण के अनुपात के लिए कृपया उत्पाद लेबल देखें या हमारी टीम से संपर्क करें।",
            'use': "उपयोग की विधि के लिए कृपया उत्पाद के निर्देश देखें या हमसे पूछें।",
            'size': "उत्पाद विभिन्न साइज़ में उपलब्ध है। विस्तृत जानकारी के लिए संपर्क करें।"
        }
        
        for key, response in responses.items():
            if key in question_lower:
                return response
        
        return "आपके प्रश्न के लिए धन्यवाद! विस्तृत जानकारी के लिए कृपया हमारी कस्टमर सर्विस टीम से संपर्क करें।"

# Initialize conversation handler
conversation_handler = ConversationHandler()

@app.route('/search', methods=['POST'])
def search_products():
    """Enhanced search endpoint with conversation capability"""
    try:
        data = request.json
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({'error': 'No query provided'}), 400
        
        # Classify intent
        intent = conversation_handler.classify_intent(query)
        
        if intent == 'question':
            # Handle as conversation
            response = conversation_handler.answer_product_question(query)
            return jsonify({
                'type': 'conversation',
                'response': response,
                'query': query
            })
        
        else:
            # Handle as product search
            query_embedding = search_model.encode([query])
            similarities = np.dot(query_embedding, product_embeddings.T).flatten()
            
            # Get top results
            top_indices = np.argsort(similarities)[::-1][:50]  # Increased to 50
            threshold = 0.3
            
            results = []
            for idx in top_indices:
                if similarities[idx] >= threshold:
                    product = product_list[idx]
                    results.append({
                        'name': product['name'],
                        'category': product['category'],
                        'mrp': product['price'],
                        'similarity': float(similarities[idx])
                    })
            
            return jsonify({
                'type': 'search',
                'results': results,
                'query': query,
                'total': len(results)
            })
    
    except Exception as e:
        logger.error(f"Search error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/conversation', methods=['POST'])
def handle_conversation():
    """Dedicated conversation endpoint"""
    try:
        data = request.json
        question = data.get('question', '')
        product_context = data.get('product_context')
        
        if not question:
            return jsonify({'error': 'No question provided'}), 400
        
        response = conversation_handler.answer_product_question(question, product_context)
        
        return jsonify({
            'response': response,
            'question': question,
            'status': 'success'
        })
    
    except Exception as e:
        logger.error(f"Conversation error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'search_model': 'loaded' if search_model else 'error',
        'conversation_model': 'loaded' if conversation_model else 'error',
        'products_count': len(product_list)
    })

if __name__ == '__main__':
    logger.info("🚀 Starting Enhanced AI Search Service with Sarvam-1...")
    
    # Load models and data
    load_models()
    load_products()
    
    # Start Flask app
    logger.info("🌐 Starting Flask server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=False)