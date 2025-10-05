import json
import re
import http.server
import socketserver
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler
import threading
import time

class SimpleRAGBot:
    def __init__(self):
        self.products_data = {}
        self.knowledge_data = {}
        self.load_knowledge_base()
        
    def load_knowledge_base(self):
        """Load products and knowledge data"""
        try:
            # Load products.json
            with open('products.json', 'r', encoding='utf-8') as f:
                self.products_data = json.load(f)
            print("✅ Loaded products.json")
        except FileNotFoundError:
            print("❌ products.json not found")
            self.products_data = {"products": []}
        except Exception as e:
            print(f"❌ Error loading products.json: {e}")
            self.products_data = {"products": []}
            
        try:
            # Load enhanced knowledge
            with open('products_knowledge_enhanced.json', 'r', encoding='utf-8') as f:
                self.knowledge_data = json.load(f)
            print("✅ Loaded products_knowledge_enhanced.json")
        except FileNotFoundError:
            print("❌ products_knowledge_enhanced.json not found")
            self.knowledge_data = {}
        except Exception as e:
            print(f"❌ Error loading products_knowledge_enhanced.json: {e}")
            self.knowledge_data = {}
    
    def simple_text_similarity(self, text1, text2):
        """Simple word-based similarity calculation"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
            
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def search_products(self, query, max_results=5):
        """Search products using simple text matching"""
        query_lower = query.lower()
        results = []
        
        # Search in products across all categories
        categories = self.products_data.get("categories", {})
        for category_key, category_data in categories.items():
            category_name = category_data.get("name", category_key)
            
            for product in category_data.get("products", []):
                score = 0
                matches = []
                
                # Check name
                product_name = product.get("name", "")
                name_score = self.simple_text_similarity(query_lower, product_name)
                if name_score > 0.1:
                    score += name_score * 2
                    matches.append(f"name: {product_name}")
                
                # Check category
                category_score = self.simple_text_similarity(query_lower, category_name)
                if category_score > 0.1:
                    score += category_score * 1.5
                    matches.append(f"category: {category_name}")
                
                # Simple keyword matching for product name
                for keyword in query_lower.split():
                    if keyword in product_name.lower():
                        score += 0.8
                    if keyword in category_name.lower():
                        score += 0.5
                
                # Specific keyword boosts
                product_name_lower = product_name.lower()
                if any(keyword in product_name_lower for keyword in ['broom', 'brush']):
                    if any(search_term in query_lower for search_term in ['broom', 'brush', 'sweep']):
                        score += 1.0
                
                if any(keyword in product_name_lower for keyword in ['cleaner', 'clean']):
                    if any(search_term in query_lower for search_term in ['clean', 'cleaner']):
                        score += 1.0
                
                if any(keyword in product_name_lower for keyword in ['detergent', 'liquid']):
                    if any(search_term in query_lower for search_term in ['detergent', 'liquid', 'wash']):
                        score += 1.0
                
                if any(keyword in product_name_lower for keyword in ['fabric', 'conditioner']):
                    if any(search_term in query_lower for search_term in ['fabric', 'conditioner', 'softener']):
                        score += 1.0
                
                if any(keyword in product_name_lower for keyword in ['floor', 'mop']):
                    if any(search_term in query_lower for search_term in ['floor', 'mop']):
                        score += 1.0
                
                if score > 0.1:
                    # Add category info to product
                    enhanced_product = product.copy()
                    enhanced_product["category"] = category_name
                    enhanced_product["category_key"] = category_key
                    
                    results.append({
                        "product": enhanced_product,
                        "score": score,
                        "matches": matches
                    })
        
        # Sort by score and return top results
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:max_results]
    
    def search_knowledge(self, query):
        """Search in enhanced knowledge base"""
        query_lower = query.lower()
        knowledge_matches = []
        
        # Search DIY kits
        for kit_name, kit_data in self.knowledge_data.items():
            if isinstance(kit_data, dict):
                score = 0
                
                # Check kit name
                if query_lower in kit_name.lower():
                    score += 2
                
                # Check in recipe sections
                for section, content in kit_data.items():
                    if isinstance(content, str) and query_lower in content.lower():
                        score += 1
                    elif isinstance(content, list):
                        for item in content:
                            if isinstance(item, str) and query_lower in item.lower():
                                score += 0.5
                
                if score > 0:
                    knowledge_matches.append({
                        "kit": kit_name,
                        "data": kit_data,
                        "score": score
                    })
        
        knowledge_matches.sort(key=lambda x: x["score"], reverse=True)
        return knowledge_matches[:3]
    
    def format_product_response(self, results):
        """Format product search results"""
        if not results:
            return "❌ No products found matching your query."
        
        response = f"🛍️ **Found {len(results)} Product{'s' if len(results) > 1 else ''}:**\n\n"
        
        for i, result in enumerate(results, 1):
            product = result["product"]
            response += f"**{i}. {product.get('name', 'Unknown Product')}**\n"
            response += f"💰 Price: ₹{product.get('mrp', product.get('price', 'N/A'))}\n"
            response += f"📦 Category: {product.get('category', 'N/A')}\n"
            response += f"🆔 ID: {product.get('id', 'N/A')}\n"
            
            if product.get('description'):
                response += f"📝 {product.get('description')}\n"
            
            if product.get('pack_size'):
                response += f"📏 Pack Size: {product.get('pack_size')}\n"
            
            response += "\n"
        
        return response
    
    def format_knowledge_response(self, matches):
        """Format knowledge base results"""
        if not matches:
            return ""
        
        response = "\n🧪 **DIY Kit Information:**\n\n"
        
        for match in matches:
            kit_data = match["data"]
            kit_name = match["kit"]
            
            response += f"**📋 {kit_name.replace('_', ' ').title()}**\n"
            
            if "price" in kit_data:
                response += f"💰 Price: {kit_data['price']}\n"
            
            if "ingredients" in kit_data and isinstance(kit_data["ingredients"], list):
                response += f"🧪 Ingredients: {', '.join(kit_data['ingredients'][:5])}\n"
            
            if "steps" in kit_data and isinstance(kit_data["steps"], list):
                response += f"📝 Steps: {len(kit_data['steps'])} step process\n"
            
            if "business_info" in kit_data:
                business = kit_data["business_info"]
                if "profit_margin" in business:
                    response += f"💼 Profit Margin: {business['profit_margin']}\n"
            
            response += "\n"
        
        return response
    
    def generate_response(self, query):
        """Generate response using simple search"""
        try:
            # Search products
            product_results = self.search_products(query)
            
            # Search knowledge base
            knowledge_results = self.search_knowledge(query)
            
            # Format response
            response = ""
            
            if product_results:
                response += self.format_product_response(product_results)
            
            if knowledge_results:
                response += self.format_knowledge_response(knowledge_results)
            
            if not product_results and not knowledge_results:
                response = """❌ No exact matches found.

🛍️ **Available Categories:**
• Cleaning Supplies
• DIY Chemical Kits  
• Fabric Care
• Floor Care
• Kitchen Cleaning

💡 **Try asking about:**
• "fabric conditioner recipe"
• "cleaning products"
• "DIY kits"
• "floor cleaner"
• "dish wash liquid"

📞 **Contact:** For specific product inquiries, please contact our team!"""
            
            return response
            
        except Exception as e:
            print(f"❌ Error generating response: {e}")
            return "Sorry, I encountered an error processing your request. Please try again."

class RAGHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, rag_bot=None, **kwargs):
        self.rag_bot = rag_bot
        super().__init__(*args, **kwargs)
    
    def do_POST(self):
        if self.path == '/rag-search':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                query = data.get('query', '')
                print(f"🔍 RAG Query: '{query}'")
                
                if not query:
                    response = {"error": "No query provided"}
                else:
                    bot_response = self.rag_bot.generate_response(query)
                    response = {"response": bot_response}
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                self.wfile.write(json.dumps(response).encode('utf-8'))
                print(f"✅ Response sent: {len(bot_response)} characters")
                
            except Exception as e:
                print(f"❌ Error handling request: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                error_response = {"error": str(e)}
                self.wfile.write(json.dumps(error_response).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            health_data = {
                "status": "healthy",
                "service": "Simple RAG Bot",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }
            self.wfile.write(json.dumps(health_data).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        # Suppress default logging
        pass

def run_server():
    rag_bot = SimpleRAGBot()
    
    def handler(*args, **kwargs):
        RAGHandler(*args, rag_bot=rag_bot, **kwargs)
    
    port = 5001
    
    try:
        with socketserver.TCPServer(("", port), handler) as httpd:
            print("\n🤖 Simple RAG Bot Starting...")
            print("=" * 60)
            print(f"🌐 Server running on port {port}")
            print(f"🔗 Health check: http://localhost:{port}/health")
            print(f"📡 RAG endpoint: http://localhost:{port}/rag-search")
            print("=" * 60)
            print("🎯 Ready to process queries!")
            print("💡 This bot uses simple text matching (no AI dependencies)")
            print("=" * 60)
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 RAG Bot shutting down...")
    except Exception as e:
        print(f"❌ Server error: {e}")

if __name__ == "__main__":
    run_server()