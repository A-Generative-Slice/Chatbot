import json
import requests
import os
from typing import Dict, List, Any
import time

class SarvamRAGBot:
    def __init__(self):
        # Load knowledge bases
        self.products_db = self.load_products()
        self.knowledge_db = self.load_enhanced_knowledge()
        
        # Sarvam AI API configuration
        self.sarvam_api_url = "https://api.sarvam.ai/chat/completions"
        self.sarvam_api_key = os.getenv("SARVAM_API_KEY", "your-api-key-here")
        
        print("✅ Sarvam RAG Bot initialized successfully")
        print(f"📦 Loaded {len(self.get_all_products())} products")
        print(f"🧠 Loaded {len(self.knowledge_db.get('products_knowledge', {}))} detailed knowledge entries")
    
    def load_products(self):
        """Load products from JSON file"""
        try:
            with open('products.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading products.json: {e}")
            return {}
    
    def load_enhanced_knowledge(self):
        """Load enhanced knowledge base"""
        try:
            with open('products_knowledge_enhanced.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading enhanced knowledge: {e}")
            return {}
    
    def get_all_products(self):
        """Get all products as a flat list"""
        products = []
        for category_key, category in self.products_db.get('categories', {}).items():
            for product in category.get('products', []):
                products.append({
                    **product,
                    'category': category.get('name', category_key),
                    'category_key': category_key
                })
        return products
    
    def search_products(self, query: str) -> List[Dict]:
        """Search products using simple keyword matching"""
        query_lower = query.lower()
        results = []
        
        all_products = self.get_all_products()
        
        for product in all_products:
            # Check if query matches product name, category, or tags
            if (query_lower in product['name'].lower() or
                query_lower in product['category'].lower() or
                any(query_lower in tag.lower() for tag in product.get('tags', []))):
                results.append(product)
        
        return results[:10]  # Limit to top 10 results
    
    def get_context_for_query(self, query: str) -> str:
        """Get relevant context from knowledge base for the query"""
        context_parts = []
        
        # Search in products
        products = self.search_products(query)
        if products:
            context_parts.append("📦 **Available Products:**")
            for product in products[:5]:  # Top 5 products
                context_parts.append(f"- {product['name']} (₹{product['mrp']}) - {product['category']}")
        
        # Search in detailed knowledge
        query_lower = query.lower()
        for key, knowledge in self.knowledge_db.get('products_knowledge', {}).items():
            if any(keyword in query_lower for keyword in knowledge.get('keywords', [])):
                context_parts.append(f"\n🧪 **{knowledge['name']} Details:**")
                context_parts.append(f"Price: ₹{knowledge['price']['kit_price']} (Makes {knowledge['price']['yield']})")
                context_parts.append(f"Description: {knowledge['description']}")
                
                # Add recipe if available
                if 'recipe' in knowledge and 'steps' in knowledge['recipe']:
                    context_parts.append("**Recipe Steps:**")
                    for step in knowledge['recipe']['steps'][:3]:  # First 3 steps
                        context_parts.append(f"{step['step']}. {step['title']}: {step['instruction']}")
                
                break  # Only include one detailed knowledge entry
        
        return "\n".join(context_parts) if context_parts else "No specific product information found."
    
    def query_sarvam_llm(self, user_query: str, context: str) -> str:
        """Query Sarvam-M LLM with context"""
        
        system_prompt = """You are a helpful assistant for Rose Chemicals, a company that sells chemical products, DIY kits, cleaning products, and perfumes. 

Your role:
- Help customers find products
- Provide pricing information
- Give product recommendations
- Explain DIY kit recipes and instructions
- Be friendly and professional

Always use the provided context to answer questions. If pricing is mentioned, include it. If recipes are available, provide step-by-step instructions.

Format your responses clearly with emojis and bullet points for better readability."""

        user_prompt = f"""User Question: {user_query}

Available Product Context:
{context}

Please provide a helpful response based on the context above. If the user is asking about a specific product, include pricing and details. If they're asking about recipes or DIY kits, provide clear instructions."""

        payload = {
            "model": "sarvam-2b-v0.5",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": 1000,
            "temperature": 0.7
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.sarvam_api_key}"
        }
        
        try:
            print(f"🤖 Querying Sarvam LLM for: {user_query}")
            response = requests.post(self.sarvam_api_url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                return data['choices'][0]['message']['content'].strip()
            else:
                print(f"❌ Sarvam API error: {response.status_code} - {response.text}")
                return self.fallback_response(user_query, context)
                
        except Exception as e:
            print(f"❌ Error calling Sarvam API: {e}")
            return self.fallback_response(user_query, context)
    
    def fallback_response(self, query: str, context: str) -> str:
        """Fallback response when LLM is not available"""
        if not context or context == "No specific product information found.":
            return """🤔 I didn't find specific information about that.

💡 **Try asking about:**
• "fabric conditioner" - DIY kit recipes
• "broom" - cleaning tools
• "perfumes" - fragrances
• "prices" - product pricing

📞 For detailed information, please contact our team!"""
        
        return f"""📋 **Here's what I found:**

{context}

💡 **Need more details?** Ask me about:
• Specific product prices
• DIY kit recipes and instructions  
• Product recommendations

📞 Contact our customer service for personalized assistance!"""
    
    def process_query(self, user_query: str) -> str:
        """Main function to process user queries"""
        try:
            print(f"🔍 Processing query: {user_query}")
            
            # Get relevant context
            context = self.get_context_for_query(user_query)
            print(f"📝 Context length: {len(context)} characters")
            
            # Query LLM with context
            response = self.query_sarvam_llm(user_query, context)
            
            print(f"✅ Generated response length: {len(response)} characters")
            return response
            
        except Exception as e:
            print(f"❌ Error processing query: {e}")
            return "Sorry, I encountered an error. Please try again or contact our support team."

# Flask API to serve the RAG bot
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialize RAG bot
rag_bot = SarvamRAGBot()

@app.route('/rag-search', methods=['POST'])
def rag_search():
    """RAG search endpoint"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({"error": "No query provided"}), 400
        
        # Process query with RAG
        response = rag_bot.process_query(query)
        
        return jsonify({
            "query": query,
            "response": response,
            "timestamp": time.time()
        })
        
    except Exception as e:
        print(f"❌ RAG search error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Sarvam RAG Bot",
        "products_loaded": len(rag_bot.get_all_products()),
        "knowledge_entries": len(rag_bot.knowledge_db.get('products_knowledge', {}))
    })

if __name__ == '__main__':
    print("🚀 Starting Sarvam RAG Bot...")
    print("🌐 Starting Flask server on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)