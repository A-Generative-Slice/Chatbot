# 🔐 Security Setup Guide

## For Organization Members

This bot uses **GitHub Secrets** to keep sensitive tokens secure. Here's how to set them up:

---

## 📋 Required Secrets

### 1. Hugging Face Token
- **Secret Name:** `HUGGINGFACE_TOKEN`
- **How to get:** https://huggingface.co/settings/tokens
- **Permissions needed:** Read access

### 2. Twilio Credentials (Optional)
- **Secret Names:**
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`

---

## 🚀 Setup Instructions

### For Running Locally

1. **Copy the example env file:**
   ```powershell
   Copy-Item .env.example .env
   ```

2. **Edit `.env` with your tokens:**
   ```
   HUGGINGFACE_TOKEN=your_actual_token_here
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   ```

3. **Start the bot:**
   ```powershell
   npm run start:ai
   ```

   The bot will automatically load tokens from `.env` file.

---

### For GitHub Actions (CI/CD)

If you're setting up automated deployment:

1. **Go to repository settings:**
   ```
   https://github.com/A-Generative-Slice/Chatbot/settings/secrets/actions
   ```

2. **Add secrets:**
   - Click "New repository secret"
   - Name: `HUGGINGFACE_TOKEN`
   - Value: Your token
   - Click "Add secret"

3. **Use in workflows:**
   ```yaml
   env:
     HUGGINGFACE_TOKEN: ${{ secrets.HUGGINGFACE_TOKEN }}
   ```

---

## 🔒 Security Best Practices

### ✅ DO:
- Store tokens in `.env` file (already in `.gitignore`)
- Use GitHub Secrets for CI/CD
- Rotate tokens if exposed
- Keep `.env.example` updated (without real values)

### ❌ DON'T:
- Commit `.env` file to git
- Share tokens in chat/email
- Hardcode tokens in source code
- Push tokens to public repos

---

## 🆘 Token Exposed?

If your token gets committed to git:

1. **Revoke the token immediately:**
   - Hugging Face: https://huggingface.co/settings/tokens
   - Delete the exposed token

2. **Generate a new token**

3. **Update everywhere:**
   - Local `.env` file
   - GitHub Secrets
   - Any running servers

4. **Clean git history (if needed):**
   ```powershell
   # Remove from history
   git filter-branch --force --index-filter `
     "git rm --cached --ignore-unmatch test_ai.js" `
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push
   git push origin --force --all
   ```

---

## 📞 Need Help?

Contact the organization admin to get access to secrets.

---

## 🧪 Testing Token Setup

Run this to verify your token is loaded:

```powershell
node test_ai.js
```

You should see:
```
🧪 Testing Hugging Face AI...
Token: ✅ Set
```

If you see `❌ Missing`, set it with:
```powershell
$env:HUGGINGFACE_TOKEN="your_token_here"
```

---

**Note:** The `.env` file is automatically ignored by git and will never be pushed to GitHub.
