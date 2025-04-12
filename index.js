// index.js
require('dotenv').config();
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');

// Load your Telegram and Gemini API keys from environment variables
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// Function to send the user's message to Gemini and get a response
async function askGemini(prompt) {
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'Error communicating with Gemini API.';
  }
}

// Handle incoming text messages from Telegram
bot.on('text', async (ctx) => {
  const message = ctx.message.text;
  console.log(`Received: ${message}`);
  await ctx.sendChatAction('typing');
  const reply = await askGemini(message);
  ctx.reply(reply);
});

// Start the bot (long polling)
bot.launch()
  .then(() => console.log('Telegram bot is running...'))
  .catch((err) => console.error('Bot failed to start:', err));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
