const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function summarizeText(text) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You summarize documents clearly and concisely.",
      },
      {
        role: "user",
        content: `Summarize this text:\n\n${text}`,
      },
    ],
    temperature: 0.3,
  });

  return response.choices[0].message.content;
}

module.exports = { summarizeText };
