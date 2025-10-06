# 🤖 AI-Powered Multilingual WhatsApp Chatbot

An intelligent WhatsApp sales bot with AI-powered responses, multilingual support, and context-aware conversations. Built with Hugging Face AI, Node.js, and Twilio.

## 🚀 Features

- **🤖 AI-Powered Sales Responses**: Uses Hugging Face Gemma-2-2B-IT for intelligent, context-aware replies
- **🌍 6 Languages**: English, Tamil, Hindi, Telugu, Kannada, Malayalam with dynamic switching
- **🧠 Context Awareness**: Remembers conversation history and product references
- **🔍 Smart Search**: NLP-powered product search with fuzzy matching for typos
- **💬 Natural Conversations**: Understands "change to Tamil", "tell me about that product"
- **� 204+ Enhanced Products**: Auto-enhanced with keywords, descriptions, and related items
- **📱 WhatsApp Integration**: Seamless messaging via Twilio
- **⚡ Fast & Efficient**: Response caching and optimized AI calls

## 🛠️ Tech Stack

- **Backend**: Node.js with Express
- **AI Engine**: Hugging Face Inference API
  - **Chat Model**: google/gemma-2-2b-it (sales responses)
  - **Translation**: facebook/mbart-large-50-many-to-many-mmt
- **NLP**: natural (tokenization), fuzzysort (fuzzy search)
- **WhatsApp API**: Twilio
- **Tunneling**: ngrok for local development

## 📋 Prerequisites

- Node.js (v18+)
- Twilio Account (free tier works)
- ngrok Account (free tier works)
- **Hugging Face Account** (free - see setup below)

## 🔧 Installation

### For Organization Members

#### 1. Clone the Repository

```powershell
git clone -b SMD https://github.com/A-Generative-Slice/Chatbot.git
cd Chatbot
```

#### 2. Install Dependencies

```powershell
npm install
```

#### 3. Get Your Hugging Face Token (FREE)

You have **two options**:

**Option A: Get Token from Organization Admin**
- Contact the admin (s.m.d.hussainjoe@gmail.com) for the shared token

**Option B: Create Your Own Free Token** (Recommended for privacy)

1. **Sign up** at Hugging Face (free): https://huggingface.co/join
2. **Go to tokens page**: https://huggingface.co/settings/tokens
3. Click **"New token"**
4. **Name**: `Chatbot-Personal` (or any name)
5. **Type**: Select **"Read"** (this is all you need)
6. Click **"Generate token"**
7. **Copy** the token (starts with `hf_`) - you won't see it again!

> 💡 **Why create your own?**
> - ✅ Private and secure
> - ✅ Free forever
> - ✅ No sharing needed
> - ✅ Can manage your own rate limits

#### 4. Set Up Environment

```powershell
# Copy the example environment file
Copy-Item .env.example .env

# Edit .env file
notepad .env
```

Add your Hugging Face token to `.env`:

```env
HUGGINGFACE_TOKEN=hf_your_token_here
```

**Save and close** the file.

#### 5. Start the Bot

```powershell
npm run start:ai
```

You should see:
```
🤖 AI Sales Bot Starting...
✅ Hugging Face connected!
🚀 Server running on port 3000
```

#### 6. Set Up Ngrok (for WhatsApp connection)

In a **new terminal**:

```powershell
ngrok http 3000
```

Copy the `https://` URL and update your Twilio webhook.

---

## 📖 Detailed Guides

- **SECURITY_SETUP.md** - Token security best practices
- **AI_BOT_READY.md** - Quick start guide
- **WEBHOOK_SETUP.md** - Twilio webhook configuration
- **NEW_FEATURES_GUIDE.md** - Language switching & context awareness

---

## 🎯 How to Use the Bot

### Example Conversations

```
User: hi
Bot: Welcome! Choose your language:
     1. English
     2. Tamil
     3. Hindi
     4. Telugu
     5. Kannada
     6. Malayalam

User: 2
Bot: Tamil selected! How can I help you? 🙏

User: floor cleaner
Bot: 🧺 Here are our floor cleaning products...
     1. FLOOR CLEANER - ₹115
     2. LIZOL - ₹150
     ...

User: tell me more about that first one
Bot: [AI generates detailed sales pitch in Tamil]

User: change to English
Bot: English selected! How can I help you?
```

### Features You Can Try

- **Language switching**: "change to Tamil", "Tamil la pesu"
- **Context references**: "tell me about that", "what's the price of it"
- **Smart search**: "flor cleaner" (handles typos)
- **Natural questions**: "which is best for bathroom?"
- **Related products**: Bot suggests similar items

---

## 📁 Project Structure

```
Chatbot/
├── ai_sales_bot_server.js    # 🤖 Main AI bot (ACTIVE)
├── products.json              # 📦 204 enhanced products
├── .env                       # 🔐 Your tokens (not in git)
├── .env.example               # 📄 Environment template
├── package.json               # 📦 Dependencies
├── test_ai.js                 # 🧪 Test Hugging Face connection
├── SECURITY_SETUP.md          # 🔐 Security guide
├── AI_BOT_READY.md            # 📖 Quick start
└── TOKEN_DISTRIBUTION_GUIDE.md # 🔑 Team token sharing
```

---

## 🆘 Troubleshooting

### "HUGGINGFACE_TOKEN not set"

```powershell
# Check if .env exists
Test-Path .env

# If not, create it
Copy-Item .env.example .env
notepad .env
```

Add your token to `.env`:
```
HUGGINGFACE_TOKEN=hf_your_token_here
```

### "Bot not responding on WhatsApp"

1. Check ngrok is running: `ngrok http 3000`
2. Update Twilio webhook with new ngrok URL
3. Verify WhatsApp sandbox is joined
4. Check bot terminal for errors

### "AI responses are slow"

- Normal: First response takes 3-6 seconds (AI processing)
- Subsequent responses are cached and faster
- Translation adds 1-2 seconds for non-English

### Need Help?

- Read: **AI_BOT_READY.md** for detailed setup
- Read: **MESSAGE_DELIVERY_DEBUG.md** for WhatsApp issues
- Contact: s.m.d.hussainjoe@gmail.com

---

## � Security Notes

- ✅ Never commit `.env` file (already in `.gitignore`)
- ✅ Don't share tokens in chat/email
- ✅ Use your own Hugging Face token for privacy
- ✅ Rotate tokens if exposed

---

## 🌟 Advanced Features

### Dynamic Language Switching

Bot detects phrases like:
- "change to Tamil"
- "Tamil la pesu"
- "हिंदी में बात करो"
- And more...

### Context Awareness

Bot understands references to previous messages:
- "that product"
- "it"
- "adhu" (Tamil)
- "woh" (Hindi)

### Conversation Memory

- Remembers last 10 messages
- Tracks products discussed
- Maintains user language preference

---

## 📊 Bot Statistics

- **Products**: 204 enhanced items
- **Languages**: 6 (English, Tamil, Hindi, Telugu, Kannada, Malayalam)
- **AI Model**: google/gemma-2-2b-it
- **Response Cache**: 500 responses
- **Conversation Memory**: 10 messages per user

---

## 🚀 Coming Soon

- [ ] Order tracking
- [ ] Payment integration
- [ ] Voice message support
- [ ] Image recognition for products
- [ ] Automated follow-ups

---

## 📝 License

MIT License - Free to use and modify

---

## 👥 Contributing

This is an organization project. Contact admin for contribution guidelines.

---

## 🎉 Credits

Built with ❤️ using:
- [Hugging Face](https://huggingface.co) - AI models
- [Twilio](https://twilio.com) - WhatsApp API
- [Node.js](https://nodejs.org) - Backend
- [ngrok](https://ngrok.com) - Tunneling

---

**Need help getting started? Read `AI_BOT_READY.md` for a complete guide!** 🚀
- **"hi"** / **"hello"** - Start conversation and language selection
- **"categories"** - Browse all product categories
- **"help"** - Get command assistance

### Search Commands
- **"thickener"** - Search for thickening products
- **"waterproofing"** - Find waterproofing solutions
- **"cement"** - Browse cement products

### Conversation Questions
- **"Does it come in blue color?"** - Product color inquiries
- **"How much water to add?"** - Mixing ratio questions
- **"कितना पानी मिलाना है?"** - Hindi language support

### Shopping Commands
- **"add [product]"** - Add product to cart
- **"cart"** - View shopping cart
- **"checkout"** - Place order

## 🤖 AI Features

### Semantic Search
- Uses `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- Supports Hindi, Tamil, and other Indian languages
- Contextual product matching

### Conversational AI
- Product-specific question handling
- Multilingual response generation
- Fallback responses for unknown queries

### Intent Detection
- Greeting recognition
- Product search vs. conversation classification
- Entity extraction for products and categories

## 🌐 Multilingual Support

### Supported Languages
1. **English** - Primary language
2. **Tamil** - தமிழ்
3. **Telugu** - తెలుగు
4. **Kannada** - ಕನ್ನಡ
5. **Malayalam** - മലയാളം
6. **Hindi** - हिंदी

### Language Selection
Users can select language by sending:
- **"1"** for English
- **"2"** for Tamil
- etc.

## 🔧 Development

### Adding New Products
Update `products.json`:
```json
{
  "id": 123,
  "name": "Product Name",
  "category": "Category",
  "mrp": 99.99,
  "description": "Product description"
}
```

### Adding New Languages
1. Add language templates in `server.js`
2. Update language detection logic
3. Test with appropriate language samples

### Extending AI Capabilities
- Modify `search_service.py` for new AI features
- Update conversation handlers
- Add new intent recognition patterns

## 📊 Monitoring

### Logs
- Message logs: `message_logs.txt`
- Console logs: Real-time in terminal
- Error tracking: Built-in error handling

### Health Checks
- Node.js: `http://localhost:3000`
- Python AI: `http://localhost:5000/health`
- Webhook: `https://your-ngrok-url/whatsapp`

## 🚨 Troubleshooting

### Common Issues
1. **Bot not responding**: Check webhook URL in Twilio
2. **AI search failing**: Verify Python service is running
3. **Language issues**: Send "1" to reset to English
4. **Port conflicts**: Update port numbers in configuration

### Debug Mode
Add `test:` prefix to messages for debug mode:
```
test: hello
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: https://github.com/Aafrin-nathissha/rc-chat-bot-
- **Twilio**: https://www.twilio.com/
- **ngrok**: https://ngrok.com/
- **Hugging Face**: https://huggingface.co/

## 👨‍💻 Author

**Aafrin Nathissha**
- GitHub: [@Aafrin-nathissha](https://github.com/Aafrin-nathissha)

---

Built with ❤️ for Rose Chemicals - Empowering businesses with AI-powered customer engagement!