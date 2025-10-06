// Simple Twilio WhatsApp sender
// Usage (PowerShell):
// $env:TWILIO_ACCOUNT_SID="AC..."; $env:TWILIO_AUTH_TOKEN="your_auth_token"; $env:TWILIO_WHATSAPP_FROM="whatsapp:+1415..."; node send_message.js +91999... "Hello from Twilio"

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. 'whatsapp:+14155238886'

if (!accountSid || !authToken || !from) {
  console.error('Missing environment variables. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

async function sendWhatsApp(toNumber, message) {
  try {
    const to = toNumber.startsWith('whatsapp:') ? toNumber : `whatsapp:${toNumber}`;
    const msg = await client.messages.create({
      body: message,
      from,
      to
    });
    console.log('Message sent:', msg.sid);
  } catch (err) {
    console.error('Send failed:', err && err.message);
    process.exit(2);
  }
}

const argv = process.argv.slice(2);
if (argv.length < 2) {
  console.error('Usage: node send_message.js <toNumber> <message>');
  process.exit(1);
}

sendWhatsApp(argv[0], argv[1]);
