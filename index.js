require("dotenv").config();
const { Telegraf } = require("telegraf");
const fetch = require("node-fetch");

const bot = new Telegraf(process.env.BOT_TOKEN);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// Reply to all user messages
bot.on("text", async (ctx) => {
  const userMessage = ctx.message.text;

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.candidates) {
      console.error("Gemini Error:", data);
      return ctx.reply("Something went wrong with Gemini.");
    }

    const reply = data.candidates[0].content.parts[0].text;
    ctx.reply(reply);
  } catch (err) {
    console.error("Bot error:", err);
    ctx.reply("Oops! I couldn’t get a response from Gemini.");
  }
});

// Start the bot
bot.launch();
console.log("Telegram bot is running...");

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));