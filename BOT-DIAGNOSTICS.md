# 🔍 BOT NOT RESPONDING - DIAGNOSTICS & FIX

## 🎯 Status: Webhook Works ✅ | Bot Not Responding ❌

**Good news:** Meta can reach your webhook  
**Problem:** Bot isn't sending replies

---

## 🔧 IMMEDIATE FIXES

### Fix 1: Render Auto-Deployment

I just pushed updated code with better debugging. Render should auto-deploy:

**Check:**
1. Go to: https://render.com/dashboard
2. Click **Chatbot** service
3. Click **Deployments** tab
4. Wait for green ✅ checkmark next to latest deploy

**Expected:**
- Deployment should say: `Deploy d362b00..41b121b live`
- Status should be: 🟢 Live

**If still deploying:**
- Wait 2-3 minutes
- Refresh page

---

### Fix 2: Check Environment Variables (CRITICAL!)

Go to Render Dashboard → Chatbot → **Environment**

**Verify these are set:**

```
WHATSAPP_TOKEN = (long string starting with EAAB...)
PHONE_NUMBER_ID = (numeric ID like 848814588314979)
VERIFY_TOKEN = rose123456
NODE_ENV = production
PORT = 3000
AI_API_KEY = (your Sarvam AI key)
```

**CRITICAL:** All 6 must be set! If ANY are blank → Bot can't send messages!

---

### Fix 3: Check Bot Startup Logs

1. Render Dashboard → Chatbot → **Logs** tab
2. Look for this section (at the very end):

```
🔑 Configuration Status:
   • Sarvam AI: ✅ Configured
   • WhatsApp Token: ✅ Configured (EAAB...)
   • Phone Number ID: ✅ Configured (848814588314979)
   • Verify Token: ✅ Configured (rose123456)
   • Products Loaded: ✅ 204 items
```

**If you see ❌ next to any:**
- That means env variable is missing!
- Go back to Step 2 and add it

**If you see ⚠️ WARNING: Missing credentials!**
- WHATSAPP_TOKEN or PHONE_NUMBER_ID is not set
- Fix it immediately in Environment tab

---

## 🧪 DIAGNOSTIC TEST

After confirming logs show all ✅, do this:

### Step 1: Send "Hi" to WhatsApp

Send message to your WhatsApp Business number:
```
Hi
```

### Step 2: Check Render Logs Immediately

Go to Render Dashboard → Chatbot → Logs

**Look for:**
```
📱 Message from +91XXXXXXXXXX: "Hi"
🤖 Trying Sarvam-M...
📤 Sending message to +91XXXXXXXXXX
✅ Message successfully sent to +91XXXXXXXXXX
```

### Step 3: Interpret Results

| What You See | Meaning | Fix |
|---|---|---|
| `❌ CRITICAL: WHATSAPP_TOKEN is missing!` | Env var not set | Add to Render Environment |
| `❌ CRITICAL: PHONE_NUMBER_ID is missing!` | Env var not set | Add to Render Environment |
| `❌ WhatsApp send error: Status: 401` | Invalid token | Check WHATSAPP_TOKEN is correct |
| `❌ WhatsApp send error: Status: 400` | Invalid phone ID | Check PHONE_NUMBER_ID is correct |
| `⚠️ All AI models failed, using fallback` | AI not working | Bot should still send fallback response |
| `✅ Message successfully sent` | **BOT WORKING!** | Send another message to test! 🎉 |

---

## 🆘 COMMON ISSUES & SOLUTIONS

### Issue 1: "Phone Number ID is missing"

**Cause:** PHONE_NUMBER_ID not set in Render

**Fix:**
1. Render → Chatbot → Environment
2. Add new variable:
   ```
   Key: PHONE_NUMBER_ID
   Value: (your numeric ID from Meta)
   ```
3. Click Save
4. Wait 30 seconds for redeploy
5. Check logs again

---

### Issue 2: "WHATSAPP_TOKEN is missing"

**Cause:** WHATSAPP_TOKEN not set in Render

**Fix:**
1. Render → Chatbot → Environment
2. Add new variable:
   ```
   Key: WHATSAPP_TOKEN
   Value: EAAB... (your token from Meta)
   ```
3. Click Save
4. Wait 30 seconds
5. Check logs

---

### Issue 3: "WhatsApp send error: Status: 401"

**Cause:** Invalid or expired token

**Fix:**
1. Get fresh token from Meta:
   - https://business.facebook.com/
   - Apps → WhatsApp → API Setup
   - Copy the **Temporary access token** OR create new System User token
2. Update in Render Environment
3. Save and redeploy
4. Try sending message again

---

### Issue 4: "WhatsApp send error: Status: 400"

**Cause:** Invalid phone number ID

**Fix:**
1. Check phone ID format (should be 17 digits, all numbers)
2. Go to Meta → WhatsApp → API Setup
3. Look under "Phone numbers"
4. Copy the ID shown (not the phone number itself)
5. Update in Render PHONE_NUMBER_ID
6. Try again

---

### Issue 5: Bot sends "404 Not Found"

**Cause:** Webhook not set up correctly in Meta

**Fix:**
1. Meta → WhatsApp → Configuration
2. Callback URL: `https://chatbot-cpf2.onrender.com/webhook`
3. Verify Token: `rose123456`
4. Click "Verify and Save"
5. Should show ✅ Verified

---

## 📋 COMPLETE DIAGNOSTIC STEPS

Do this in order:

```
STEP 1: Check Deployment
□ Go to Render Dashboard
□ Click Chatbot service
□ Click Deployments
□ Wait for green ✅ on latest deploy
□ If deploying, wait 2-3 minutes

STEP 2: Verify Environment Variables
□ Click Environment tab
□ Check WHATSAPP_TOKEN is set
□ Check PHONE_NUMBER_ID is set
□ Check VERIFY_TOKEN = rose123456
□ Check NODE_ENV = production
□ Check PORT = 3000
□ If any blank, add them and Save

STEP 3: Check Bot Logs
□ Click Logs tab
□ Look for Configuration Status section
□ Verify all show ✅ Configured
□ If any show ❌ or ⚠️, environment vars wrong

STEP 4: Manual Redeploy (if needed)
□ Click Manual Deploy (top right)
□ Select "Deploy latest commit"
□ Wait 2-3 minutes
□ Check Logs again

STEP 5: Send Test Message
□ Send "Hi" to WhatsApp Business number
□ Immediately check Render Logs
□ Look for "Message successfully sent"
□ If successful, bot is working! 🎉
```

---

## 🎯 What Happens When It Works

**You send:** `Hi`

**You see in Render logs:**
```
📱 Message from +91XXXXXXXXXX: "Hi"
✅ Loaded 204 products from 9 categories
🤖 Trying Sarvam-M...
📤 Sending message to +91XXXXXXXXXX
✅ Message successfully sent to +91XXXXXXXXXX
```

**You get on WhatsApp:**
```
🙏 Namaste! Welcome to Rose Chemicals
Please select your language:
1. English
2. Tamil (தமிழ்)
3. Hindi (हिंदी)
4. Telugu (తెలుగు)
5. Kannada (ಕನ್ನಡ)
6. Malayalam (മലയാളം)
```

---

## 🚨 NEXT STEPS

1. **Check Render Logs** right now for Configuration Status
2. **Screenshot the relevant section** if there are errors
3. **Send me the screenshot** if you see ❌ or ⚠️
4. **If all ✅, send "Hi" and check logs**
5. **Let me know the result!**

---

## 📞 DEBUGGING INFO TO SEND ME

If bot still not working, send:
1. Screenshot of Render Environment tab (show all variables)
2. Screenshot of Render Logs (Configuration Status section)
3. Screenshot of Render Logs (when you sent "Hi")
4. What error you see when sending "Hi"

With this info, I can fix it immediately! 🚀
