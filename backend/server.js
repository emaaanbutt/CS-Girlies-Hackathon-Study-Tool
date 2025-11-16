import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE";

const ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: false });

app.use('/assets', express.static('../Assets'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});


app.post("/flashcards", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const prompt = `
      Generate exactly 5 flashcards for the topic: "${topic}".
      Respond ONLY with a valid JSON array.
      Each item must contain: { "q": "question", "a": "answer" }
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = result.text;
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const flashcards = JSON.parse(cleaned);

    res.json(flashcards);
  } catch (error) {
    console.error("Error in /flashcards:", error);
    res.status(500).json({ error: "Failed to generate flashcards", details: error.message });
  }
});

app.post("/plan", async (req, res) => {
  try {
    const { hours, difficulty } = req.body;
    if (!hours || !difficulty)
      return res.status(400).json({ error: "Hours and difficulty are required" });

    const prompt = `
      Create a clear study plan for a student with ${hours} hours
      preparing for a test of ${difficulty} difficulty.
      Use Pomodoro blocks: 25 minutes study + 5 minutes break.
      Keep it encouraging and structured.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ plan: result.text });
  } catch (error) {
    console.error("Error in /plan:", error);
    res.status(500).json({ error: "Failed to generate study plan", details: error.message });
  }
});

app.get("/test-gemini", async (req, res) => {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say 'Gemini is working!' in a creative way",
    });

    res.json({ success: true, response: result.text });
  } catch (error) {
    console.error("Gemini test error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
