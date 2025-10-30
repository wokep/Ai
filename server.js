import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch"; // Install with npm install node-fetch@2
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Health check
app.get("/", (req, res) => res.send("AI Roleplay backend (ApiFreeLLM) running!"));

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { character, message } = req.body;

    if (!character || !message) {
      return res.status(400).json({ error: "Missing character or message" });
    }

    console.log(`User message to ${character.name}:`, message);

    // Combine character personality + message
    const prompt = `You are roleplaying as ${character.name}.\nPersonality: ${character.personality}\nUser says: ${message}`;

    // Call ApiFreeLLM
    const response = await fetch("https://apifreellm.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt })
    });

    const data = await response.json();

    if (data.status !== "success") {
      console.error("ApiFreeLLM error:", data.error);
      return res.status(500).json({ error: "AI service error: " + data.error });
    }

    const reply = data.response;
    console.log(`${character.name} replied:`, reply);
    res.json({ reply });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error. Check backend logs." });
  }
});

app.listen(port, () => console.log(`✅ Server running on port ${port}`));
