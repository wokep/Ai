import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("AI Roleplay backend (HuggingFace GPT-2) running!"));

app.post("/chat", async (req, res) => {
  try {
    const { character, message } = req.body;
    if (!character || !message)
      return res.status(400).json({ error: "Missing character or message" });

    const prompt = `You are roleplaying as ${character.name}. Personality: ${character.personality}. User says: ${message}`;

    const HF_API_URL = "https://api-inference.huggingface.co/models/gpt2";
    const HF_API_TOKEN = process.env.HF_API_TOKEN;

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();

    if (!data || data.error) {
      console.error("HuggingFace API error:", data.error);
      return res.status(500).json({ error: "AI service error: " + data.error });
    }

    const reply = data[0]?.generated_text || "AI did not respond.";
    res.json({ reply });

  } catch (err) {
    console.error("Server error:", err.message || err);
    res.status(500).json({ error: "Server error. Check backend logs." });
  }
});

app.listen(port, () => console.log(`✅ Server running on port ${port}`));
