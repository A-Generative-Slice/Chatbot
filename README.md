# 🤖 Rose Chemicals WhatsApp Bot

An AI-powered WhatsApp chatbot for Rose Chemicals built with Node.js, Python AI services, and Twilio integration. Features multilingual support, semantic product search, and conversational AI capabilities.

## 🚀 Features

- **🔍 Semantic Product Search**: AI-powered product discovery using sentence transformers
- **💬 Conversational AI**: Handle product questions about colors, usage, mixing ratios
- **🌐 Multilingual Support**: English, Tamil, Telugu, Kannada, Malayalam, Hindi
- **🛒 Shopping Cart**: Add products and manage orders
- **📱 WhatsApp Integration**: Seamless messaging via Twilio
- **🧠 Natural Language Processing**: Advanced intent detection and entity recognition

## 🛠️ Tech Stack

- **Backend**: Node.js with Express
- **AI Service**: Python with Flask, sentence-transformers, Hugging Face
- **WhatsApp API**: Twilio
- **Tunneling**: ngrok for webhook exposure
- **Language Support**: Multi-language templates and responses

## 📋 Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- Twilio Account
- ngrok Account

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Aafrin-nathissha/rc-chat-bot-.git
cd rc-chat-bot-
```

### 2. Install Node.js Dependencies
```bash
npm install
```

### 3. Set up Python Environment
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file:
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_whatsapp_number
PORT=3000
```

## 🚀 Usage

### Quick Start
Run the startup script:
```bash
# Windows
start-bot.bat

# Manual startup
# Terminal 1: Start Python AI Service
python search_service.py

# Terminal 2: Start Node.js Server
node server.js

# Terminal 3: Start ngrok tunnel
ngrok http 3000
```

### Configuration
1. **Twilio Webhook**: Update your Twilio webhook URL to: `https://your-ngrok-url.ngrok.io/whatsapp`
2. **Product Data**: Update `products.json` with your product catalog
3. **Language Templates**: Modify language responses in `server.js`

## 📁 Project Structure

```
rc-chat-bot-/
├── server.js                 # Main Node.js application
├── search_service.py          # Python AI search service
├── enhanced_search_service.py # Advanced AI with Sarvam-1
├── products.json             # Product catalog
├── package.json              # Node.js dependencies
├── requirements.txt          # Python dependencies
├── start-bot.bat            # Windows startup script
├── stop-bot.bat             # Windows stop script
└── README.md                # This file
```

## 🎯 WhatsApp Commands

### Basic Commands
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