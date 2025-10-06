# Enhanced semantic analysis for intent detection
# Add this to your search_service.py

from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class IntentClassifier:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Define intent examples with embeddings
        self.intent_examples = {
            'greeting': [
                "hello", "hi", "hey", "good morning", "good afternoon", 
                "how are you", "namaste", "vanakkam", "adaab"
            ],
            'search': [
                "do you have brushes", "show me cleaning products", 
                "find acetic acid", "looking for perfumes", "need chemicals",
                "what products do you sell", "browse items"
            ],
            'price': [
                "what is the price", "how much does it cost", "rate of acetic acid",
                "tell me the cost", "price list", "how expensive"
            ],
            'help': [
                "help me", "how to use", "what can you do", "assistance needed",
                "i need help", "guide me"
            ],
            'thanks': [
                "thank you", "thanks", "appreciate it", "great service",
                "nice", "good job"
            ]
        }
        
        # Pre-compute embeddings for all examples
        self.intent_embeddings = {}
        for intent, examples in self.intent_examples.items():
            embeddings = self.model.encode(examples)
            self.intent_embeddings[intent] = embeddings
    
    def classify_intent(self, message):
        """
        Classify user intent using semantic similarity
        Returns: dict with intent, confidence, and entity
        """
        message_embedding = self.model.encode([message])
        
        best_intent = 'unknown'
        best_confidence = 0.0
        
        # Compare with each intent
        for intent, embeddings in self.intent_embeddings.items():
            similarities = cosine_similarity(message_embedding, embeddings)
            max_similarity = np.max(similarities)
            
            if max_similarity > best_confidence:
                best_confidence = max_similarity
                best_intent = intent
        
        # Extract entity for search intents
        entity = None
        if best_intent == 'search':
            entity = self.extract_search_entity(message)
        elif best_intent == 'price':
            entity = self.extract_price_entity(message)
        
        return {
            'intent': best_intent,
            'entity': entity,
            'confidence': float(best_confidence),
            'reasoning': f'semantic similarity: {best_confidence:.3f}'
        }
    
    def extract_search_entity(self, message):
        """Extract product name from search queries"""
        # Remove common search words
        stop_words = ['do', 'you', 'have', 'show', 'me', 'find', 'get', 'need', 'want', 'looking', 'for']
        words = message.lower().split()
        entity_words = [w for w in words if w not in stop_words]
        return ' '.join(entity_words) if entity_words else None
    
    def extract_price_entity(self, message):
        """Extract product name from price queries"""
        # Remove price-related words
        price_words = ['what', 'is', 'the', 'price', 'cost', 'rate', 'of', 'for', 'how', 'much']
        words = message.lower().split()
        entity_words = [w for w in words if w not in price_words]
        return ' '.join(entity_words) if entity_words else None

# Add this to your Flask app
intent_classifier = IntentClassifier()

@app.route('/classify-intent', methods=['POST'])
def classify_intent():
    data = request.json
    message = data.get('message', '')
    
    if not message:
        return jsonify({'error': 'No message provided'}), 400
    
    result = intent_classifier.classify_intent(message)
    return jsonify(result)