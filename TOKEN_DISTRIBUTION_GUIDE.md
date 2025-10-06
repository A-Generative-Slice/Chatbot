# 🔐 Secure Token Distribution for Organization Members

## Problem
GitHub Secrets only work in GitHub Actions (CI/CD), not for local development.

---

## ✅ Solution 1: Encrypted .env File (Recommended)

### Setup (You do this once):

1. **Install git-crypt** (encryption tool):
   ```powershell
   # Using Chocolatey
   choco install git-crypt
   
   # Or download from: https://github.com/AGWA/git-crypt/releases
   ```

2. **Initialize encryption in repo:**
   ```powershell
   git-crypt init
   ```

3. **Create .gitattributes to encrypt .env.encrypted:**
   ```gitattributes
   .env.encrypted filter=git-crypt diff=git-crypt
   ```

4. **Encrypt and commit your token:**
   ```powershell
   # Create encrypted env file
   echo "HUGGINGFACE_TOKEN=hf_YourActualTokenHere123456" > .env.encrypted
   
   # Commit it (git-crypt encrypts automatically)
   git add .env.encrypted .gitattributes
   git commit -m "Add encrypted environment"
   git push
   ```

5. **Add organization members' GPG keys:**
   ```powershell
   # Member generates GPG key
   # Member shares public key with you
   # You add them:
   git-crypt add-gpg-user USER_GPG_KEY
   ```

### Usage (Organization members):

```powershell
# Clone repo
git clone -b SMD https://github.com/A-Generative-Slice/Chatbot.git
cd Chatbot

# Decrypt (requires you to add their GPG key)
git-crypt unlock

# Copy decrypted env
Copy-Item .env.encrypted .env

# Start bot
npm run start:ai
```

**Pros:**
- ✅ Token is in git (encrypted)
- ✅ Only approved members can decrypt
- ✅ Automatic with git

**Cons:**
- ⚠️ Requires git-crypt setup
- ⚠️ Members need GPG keys

---

## ✅ Solution 2: Azure Key Vault / AWS Secrets Manager (Enterprise)

Store token in cloud vault, members authenticate to retrieve:

```javascript
// Add to ai_sales_bot_server.js
const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

async function getToken() {
    const vaultName = "your-vault-name";
    const url = `https://${vaultName}.vault.azure.net`;
    
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(url, credential);
    
    const secret = await client.getSecret("HUGGINGFACE-TOKEN");
    return secret.value;
}

// Use in code
const HF_TOKEN = await getToken();
```

**Pros:**
- ✅ Enterprise-grade security
- ✅ Audit logs (who accessed when)
- ✅ Easy rotation

**Cons:**
- ⚠️ Requires Azure/AWS account
- ⚠️ Additional cost

---

## ✅ Solution 3: 1Password / Bitwarden for Teams (Simple)

1. **You create shared vault** in 1Password/Bitwarden
2. **Add organization members** to vault
3. **Store token** in vault
4. **Members retrieve** token from app

**Pros:**
- ✅ Very easy to use
- ✅ No code changes
- ✅ Works for all secrets

**Cons:**
- ⚠️ Manual copy-paste

---

## ✅ Solution 4: Environment Config Service (Custom)

Create a simple API that organization members can call:

```javascript
// setup_token.js
const axios = require('axios');
const fs = require('fs');

async function setupToken() {
    console.log('🔑 Fetching token from secure server...');
    
    const apiKey = process.env.ORG_API_KEY; // Member has this
    
    const response = await axios.get('https://your-server.com/api/get-token', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    const token = response.data.token;
    
    fs.writeFileSync('.env', `HUGGINGFACE_TOKEN=${token}\n`);
    console.log('✅ Token configured!');
}

setupToken();
```

Members run:
```powershell
$env:ORG_API_KEY="member_key_here"
node setup_token.js
npm run start:ai
```

**Pros:**
- ✅ Centralized control
- ✅ Can revoke access anytime
- ✅ Audit logs

**Cons:**
- ⚠️ Need to host API server

---

## 🎯 **Recommended for Your Case:**

### **For Small Team (2-5 people):**
→ **Solution 3: 1Password/Bitwarden** (easiest)

### **For Medium Team (5-20 people):**
→ **Solution 1: git-crypt** (automated)

### **For Enterprise:**
→ **Solution 2: Azure Key Vault** (most secure)

---

## 📝 **Current Simple Solution:**

What you have now (`.env` + manual sharing) is actually **fine for small teams**:

1. Member clones repo
2. You send them token via secure channel (Signal, encrypted email)
3. They create `.env` file
4. Done

**Pros:**
- ✅ Simple
- ✅ No additional tools
- ✅ Works immediately

**Cons:**
- ⚠️ Manual sharing
- ⚠️ No audit trail

---

## 🔒 **Important Security Notes:**

### ✅ DO:
- Use encrypted channels (Signal, ProtonMail)
- Rotate tokens periodically
- Use separate tokens per environment
- Revoke access when member leaves

### ❌ DON'T:
- Email tokens in plain text
- Share in Slack/Discord/Teams
- Reuse tokens across projects
- Store in shared documents

---

## 🆘 **Want Me to Set Up One of These?**

Let me know which solution you prefer:
1. **git-crypt** (encrypted in repo)
2. **1Password/Bitwarden** (shared vault)
3. **Custom API** (hosted service)
4. **Keep current** (manual sharing)

I can help implement any of these!
