// Quick AI test script
const { HfInference } = require('@huggingface/inference');

const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;

if (!HF_TOKEN) {
    console.error('❌ HUGGINGFACE_TOKEN not set!');
    console.log('Set it with: $env:HUGGINGFACE_TOKEN="your_token_here"');
    process.exit(1);
}

console.log('🧪 Testing Hugging Face AI...\n');
console.log('Token:', HF_TOKEN ? '✅ Set' : '❌ Missing');

const hf = new HfInference(HF_TOKEN);

async function testAI() {
  try {
    console.log('\n📝 Test 1: AI Sales Response (Chat Completion)...');
    const response = await hf.chatCompletion({
      model: 'google/gemma-2-2b-it',
      messages: [
        { 
          role: "user", 
          content: `You are a sales expert. A customer asked: "show me floor cleaners"

Product: MOP FRESH ULTRA - ₹80
Benefits: Kills 99.9% germs, works on all floor types, amazing value

Create a persuasive, friendly sales response in under 60 words that highlights benefits and creates urgency.`
        }
      ],
      max_tokens: 100,
      temperature: 0.8
    });
    
    console.log('✅ Success!');
    console.log('AI Response:', response.choices[0].message.content);
    
    console.log('\n📝 Test 2: Translation...');
    const transResponse = await hf.translation({
      model: 'facebook/mbart-large-50-many-to-many-mmt',
      inputs: 'This floor cleaner is amazing! It kills 99.9% germs.',
      parameters: {
        src_lang: 'en_XX',
        tgt_lang: 'ta_IN'
      }
    });
    
    console.log('✅ Translation Success!');
    console.log('Tamil:', transResponse.translation_text);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
  }
}

testAI();
