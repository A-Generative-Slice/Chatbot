# Rose Chemicals WhatsApp Bot

This project runs an Express-based WhatsApp bot with Sarvam AI and MongoDB.

## Deploy On Railway

### 1. Push code to GitHub
- Ensure this repository is up to date on GitHub.
- Confirm `.env` is not committed.

### 2. Create a Railway project
- Open Railway and create a new project.
- Choose `Deploy from GitHub repo` and select this repo.

### 3. Add environment variables in Railway
In Railway project settings, add these variables:

- `PORT=3000`
- `WHATSAPP_PHONE_NUMBER_ID=...`
- `WHATSAPP_ACCESS_TOKEN=...`
- `WHATSAPP_VERIFY_TOKEN=...`
- `SARVAM_API_KEY=...`
- `MONGODB_URI=...`
- `WEBSITE_API_URL=https://rosechemicals.in`
- `WEBSITE_URL=https://rosechemicals.in`
- `ADMIN_API_KEY=...` (optional but recommended)

### 4. Build and start commands
Railway auto-detects Node.js from `package.json`.

- Install: `npm install`
- Start: `npm start`

### 5. Set the WhatsApp webhook URL
After deploy, copy your Railway public domain and set:

- Webhook URL: `https://your-app.up.railway.app/webhook`
- Verify token: same value as `WHATSAPP_VERIFY_TOKEN`

### 6. Verify deployment
- Health check: `GET /ping`
- Root status: `GET /`
- Webhook verify endpoint: `GET /webhook`

## Sending a template to previous chat recipients

If you want to resend a template to numbers already stored in the `Chat` collection, use:

```bash
npm run send:previous-numbers
```

Optional environment variables:

- `TEST_TEMPLATE_NAME=floor_cleaner`
- `TEST_TEMPLATE_LANG=en`
- `TEST_TEMPLATE_HEADER_IMAGE_URL=https://...` for templates with an image header
- `TEST_TEMPLATE_HEADER_IMAGE_ID=...` if you are sending a previously uploaded WhatsApp media ID
- `TEST_BATCH_LIMIT=100`
- `TEST_BATCH_DELAY_MS=1200`
- `TEST_RECENT_DAYS=0` to target only chats updated in the last N days

The script reads unique `phoneNumber` values from MongoDB and sends the template one by one with a delay between messages.

## Local Run

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill values.

3. Start server:

```bash
npm start
```
