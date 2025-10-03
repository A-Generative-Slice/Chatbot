# Using Sarvam-1 for Product Conversations
# Add this to your Python service

from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

class ProductConversationAI:
    def __init__(self):
        print("🤖 Loading Sarvam-1 for product conversations...")
        self.model = AutoModelForCausalLM.from_pretrained(
            "sarvamai/sarvam-1",
            torch_dtype=torch.bfloat16,
            device_map="auto"
        )
        self.tokenizer = AutoTokenizer.from_pretrained("sarvamai/sarvam-1")
        
        # Company context
        self.company_context = """
Rose Chemicals is an Indian e-commerce company selling:
1. Chemicals & Raw Materials: Acetic acid, solvents, industrial chemicals
2. Cleaning Products: Detergents, soaps, sanitizers, toilet cleaners
3. Perfumes & Fragrances: Essential oils, perfume bases, aromatic compounds
4. Brushes & Equipment: Cleaning brushes, industrial brushes, containers

We serve customers across India with quality products for industrial and household use.
"""
    
    def answer_product_question(self, question, product_name=None, product_details=None):
        """Generate conversational response about products"""
        
        # Build context-aware prompt
        context = self.company_context
        if product_name:
            context += f"\nCustomer is asking about: {product_name}"
        if product_details:
            context += f"\nProduct details: {product_details}"
        
        # Create prompt in both English and Hindi for better understanding
        prompt = f"""Context: {context}

Customer Question: {question}

Provide a helpful, accurate response about this product question. If you don't have specific information, suggest contacting customer service.

Response:"""

        # Generate response
        inputs = self.tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=150,
                temperature=0.7,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        # Extract response
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        response = response.split("Response:")[-1].strip()
        
        return response
    
    def classify_question_type(self, question):
        """Classify the type of product question"""
        question_lower = question.lower()
        
        if any(word in question_lower for word in ['color', 'colour', 'blue', 'red', 'green', 'रंग']):
            return 'color'
        elif any(word in question_lower for word in ['water', 'mix', 'dilute', 'ratio', 'quantity', 'पानी']):
            return 'usage'
        elif any(word in question_lower for word in ['size', 'weight', 'ml', 'kg', 'liter', 'साइज़']):
            return 'specifications'
        elif any(word in question_lower for word in ['available', 'stock', 'milega', 'उपलब्ध']):
            return 'availability'
        elif any(word in question_lower for word in ['use', 'apply', 'instructions', 'कैसे']):
            return 'usage'
        else:
            return 'general'

# Flask endpoint for product conversations
@app.route('/product-conversation', methods=['POST'])
def product_conversation():
    data = request.json
    question = data.get('question', '')
    product_name = data.get('product_name')
    product_details = data.get('product_details')
    
    if not question:
        return jsonify({'error': 'No question provided'}), 400
    
    try:
        conversation_ai = ProductConversationAI()
        response = conversation_ai.answer_product_question(question, product_name, product_details)
        question_type = conversation_ai.classify_question_type(question)
        
        return jsonify({
            'response': response,
            'question_type': question_type,
            'status': 'success'
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'response': "I'd be happy to help! For specific product details, please contact our customer service team.",
            'status': 'fallback'
        }), 500