import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";

// Load local .env (for local dev)
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors());
app.use(bodyParser.json());

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // must be set in Render environment variables
});

// Health check
app.get("/", (req, res) => {
  res.send("AI Roleplay backend is running!");
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { character, message } = req.body;

    if (!character || !message) {
      console.error("Missing character or message:", req.body);
      return res.status(400).json({ error: "Missing character or message" });
    }

    console.log(`User message to ${character.name}:`, message);

    const systemPrompt = `
      You are roleplaying as ${character.name}.
      Personality: ${character.personality}.
      Stay in character and reply naturally in roleplay format.
    `;

    // Send request to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content;
    if (!reply) {
      console.error("No reply returned from OpenAI:", completion);
      return res.status(500).json({ error: "No reply from AI" });
    }

    console.log(`${character.name} replied:`, reply);
    res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error. Check backend logs." });
  }
});

// Start server
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
