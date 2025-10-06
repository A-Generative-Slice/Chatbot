import json
import http.server
import socketserver
import urllib.parse
from http.server import BaseHTTPRequestHandler
import threading
import time

# Simple product search function
def search_products_simple(products_data, query, max_results=5):
    """Simple product search"""
    query_lower = query.lower()
    results = []
    
    categories = products_data.get("categories", {})
    for category_key, category_data in categories.items():
        category_name = category_data.get("name", category_key)
        
        for product in category_data.get("products", []):
            score = 0
            product_name = product.get("name", "").lower()
            
            # Simple keyword matching
            for keyword in query_lower.split():
                if keyword in product_name:
                    score += 1
            
            # Boost for exact matches
            if query_lower in product_name:
                score += 2
            
            # Special boosts for common terms
            if "broom" in query_lower and "broom" in product_name:
                score += 3
            if "brush" in query_lower and "brush" in product_name:
                score += 3
            if "clean" in query_lower and ("clean" in product_name or "clean" in category_name.lower()):
                score += 2
            if "fabric" in query_lower and "fabric" in product_name:
                score += 3
            if "floor" in query_lower and ("floor" in product_name or "mop" in product_name):
                score += 3
            
            if score > 0:
                enhanced_product = product.copy()
                enhanced_product["category"] = category_name
                results.append({
                    "product": enhanced_product,
                    "score": score
                })
    
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:max_results]

def format_response(results):
    """Format search results"""
    if not results:
        return """❌ No products found.

🛍️ **Try searching for:**
• broom
• brush  
• cleaner
• fabric conditioner
• floor cleaner
• detergent

📞 Contact us for more products!"""
    
    response = f"🛍️ **Found {len(results)} product{'s' if len(results) > 1 else ''}:**\n\n"
    
    for i, result in enumerate(results, 1):
        product = result["product"]
        response += f"**{i}. {product.get('name', 'Unknown')}**\n"
        response += f"💰 ₹{product.get('mrp', 'N/A')}\n"
        response += f"📦 {product.get('category', 'N/A')}\n\n"
    
    return response

class SimpleHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/rag-search':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                query = data.get('query', '').strip()
                print(f"🔍 Search: '{query}'")
                
                # Load products
                with open('products.json', 'r', encoding='utf-8') as f:
                    products_data = json.load(f)
                
                # Search products
                results = search_products_simple(products_data, query)
                response_text = format_response(results)
                
                # Send response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response_json = {"response": response_text}
                self.wfile.write(json.dumps(response_json).encode('utf-8'))
                
                print(f"✅ Sent {len(response_text)} chars")
                
            except Exception as e:
                print(f"❌ Error: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        pass

if __name__ == "__main__":
    port = 5001
    try:
        with socketserver.TCPServer(("", port), SimpleHandler) as httpd:
            print(f"🤖 Simple RAG Server running on port {port}")
            print("🎯 Ready for queries!")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")
    except Exception as e:
        print(f"❌ Error: {e}")
        input("Press Enter to exit...")