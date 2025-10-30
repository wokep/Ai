import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(bodyParser.json());

app.post("/chat", async (req, res) => {
  const { character, message } = req.body;

  const systemPrompt = `You are roleplaying as ${character.name}. 
  Personality: ${character.personality}.
  Speak in character at all times.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ],
  });

  res.json({ reply: response.choices[0].message.content });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
