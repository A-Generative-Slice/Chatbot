# Hybrid approach: Use Sarvam-1 for conversations + keep current search
from transformers import AutoModelForCausalLM, AutoTokenizer
from sentence_transformers import SentenceTransformer
import torch

class HybridSearchService:
    def __init__(self):
        # Keep current search model
        self.search_model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
        
        # Add Sarvam-1 for conversations
        self.chat_model = AutoModelForCausalLM.from_pretrained("sarvamai/sarvam-1")
        self.chat_tokenizer = AutoTokenizer.from_pretrained("sarvamai/sarvam-1")
    
    def semantic_search(self, query, products):
        """Keep existing search functionality"""
        # Your current search logic here
        pass
    
    def generate_response(self, user_message, context=""):
        """Use Sarvam-1 for natural conversations"""
        prompt = f"User: {user_message}\nAssistant:"
        
        inputs = self.chat_tokenizer(prompt, return_tensors="pt")
        outputs = self.chat_model.generate(
            **inputs, 
            max_new_tokens=100,
            temperature=0.7,
            do_sample=True
        )
        
        response = self.chat_tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response.split("Assistant:")[-1].strip()