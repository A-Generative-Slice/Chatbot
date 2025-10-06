# WhatsApp E-Commerce Chatbot - Structured Workflow

## 📋 System Architecture Overview

```
Customer (WhatsApp) ↔ Twilio Sandbox ↔ Node.js Server ↔ AI Model ↔ Knowledge Base
```

## 🔄 Detailed Workflow

### 1. **Message Reception & Processing**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer      │────│  Twilio Sandbox │────│   Node.js       │
│   WhatsApp      │    │   (Webhook)     │    │   Server        │
│   Message       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Steps:**
- Customer sends message in any supported language (Tamil, Malayalam, Telugu, Kannada, English)
- Twilio receives message via WhatsApp Business API
- Twilio forwards message to Node.js webhook endpoint (`/whatsapp`)
- Server extracts message content, sender info, and metadata

### 2. **Language Detection & Processing**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Raw Message   │────│  AI Model       │────│  Processed      │
│   (Any Language)│    │  (Multilingual) │    │  Query          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**AI Model Integration:**
- **Model**: `paraphrase-multilingual-MiniLM-L12-v2`
- **Purpose**: Understand intent and extract entities
- **Supported Languages**: Tamil, Malayalam, Telugu, Kannada, English
- **Process**: Convert user query to standardized format for knowledge base search

### 3. **Knowledge Base Search**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Processed      │────│  Knowledge Base │────│  Search         │
│  Query          │    │  (products.json)│    │  Results        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Knowledge Base Structure:**
```json
{
  "products": {
    "categories": [...],
    "pricing": [...],
    "specifications": [...]
  },
  "policies": {
    "delivery": {...},
    "return": {...},
    "payment": {...}
  },
  "faq": {...},
  "company_info": {...}
}
```

### 4. **Response Generation**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Search         │────│  Response       │────│  Formatted      │
│  Results        │    │  Generator      │    │  Reply          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Response Types:**
- Product information & pricing
- Category listings
- Delivery policies
- Order status
- General inquiries
- Error/fallback messages

### 5. **Message Delivery**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Formatted      │────│  Twilio API     │────│  Customer       │
│  Reply          │    │  Response       │    │  WhatsApp       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠 Technical Implementation

### **Node.js Server Components:**

1. **Message Handler** (`/whatsapp` endpoint)
2. **Language Processor** (AI model integration)
3. **Knowledge Base Manager** (JSON file operations)
4. **Search Engine** (product/policy search)
5. **Response Builder** (dynamic message creation)
6. **Twilio Integration** (send/receive messages)

### **Key Features:**

```javascript
// Core functionalities
├── Multilingual Support (5 languages)
├── Product Search & Filtering
├── Price Inquiries
├── Category Browsing
├── Policy Information
├── Order Tracking
├── Conversation Memory
└── Fallback Handling
```

## 📊 Data Flow Sequence

```
1. Customer Query (Tamil/English/etc.) 
   ↓
2. Twilio Webhook Trigger
   ↓
3. Message Extraction & Validation
   ↓
4. AI Model Processing (Language Understanding)
   ↓
5. Intent Classification & Entity Extraction
   ↓
6. Knowledge Base Query Execution
   ↓
7. Result Ranking & Selection
   ↓
8. Response Generation (Original Language)
   ↓
9. Twilio Message Dispatch
   ↓
10. Customer Receives Reply
```

## 🎯 Supported Query Types

### **Product Queries:**
- Product search: "எசிடிக் அமிலம் விலை என்ன?" (Tamil)
- Category browsing: "Show me all cleaning products"
- Price comparison: "Compare floor cleaners"

### **Service Queries:**
- Delivery info: "ಡೆಲಿವರಿ ಪಾಲಿಸಿ ಏನು?" (Kannada)
- Order status: "My order tracking"
- Return policy: "Return conditions"

### **General Queries:**
- Company info: "About your company"
- Contact details: "How to contact support"
- Payment methods: "Payment options"

## 🔧 Configuration Requirements

### **Environment Setup:**
```bash
# Dependencies
├── express (Web server)
├── twilio (WhatsApp integration)
├── sentence-transformers (AI model)
├── body-parser (Request handling)
└── fs/path (File operations)
```

### **External Services:**
- **Twilio Account** (WhatsApp Business API)
- **ngrok** (Local development tunneling)
- **AI Model Hosting** (Local or cloud deployment)

## 📈 Scalability Considerations

1. **Caching Layer** for frequently accessed products
2. **Database Migration** from JSON to MongoDB/PostgreSQL
3. **Load Balancing** for multiple server instances
4. **Message Queue** for high-volume processing
5. **Analytics Integration** for conversation insights

This workflow provides a comprehensive foundation for your multilingual e-commerce WhatsApp chatbot with AI-powered understanding and structured knowledge base integration.