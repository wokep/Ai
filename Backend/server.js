import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/chat", async (req, res) => {
  try {
    const { character, message } = req.body;
    if (!character || !message) return res.status(400).json({ error: "Missing character or message" });

    const systemPrompt = `
      You are roleplaying as ${character.name}.
      Personality: ${character.personality}.
      Stay in character and reply naturally in roleplay format.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

app.listen(port, () => console.log(`✅ Server running on port ${port}`));
