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

const API_KEY = process.env.GEMINI_API_KEY || "YOUR_API_KEY";

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
      Tne answer should be in one line of 12 - 16 words.
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

app.post("/moodtracker", async (req, res) => {
    try {
    const { mood } = req.body;
    if (!mood)
      return res.status(400).json({ error: "Mood is required" });

    // This is the new, more detailed prompt
    const prompt = `
      You are an expert, empathetic, and encouraging study coach.
      A student needs a study plan. Their current mood is "${mood}".

      Please generate a clear, actionable study plan that is *specifically adapted* to their mood.
      
      **Rules for the plan:**
      1.  **Mood Adaptation:**
          * If the mood is "Stressed", "Tired", or "Sad", make the plan very gentle. Start with an easy win (like "Organize notes" or "Review 1 concept") and include more breaks.
          * If the mood is "Happy", "Focused", or "Okay", you can create a more ambitious plan that tackles harder parts of the topic first.
      2.  **Technique:** The plan *must* be built around Pomodoro blocks (25 minutes of study, 5 minutes of break).
      3.  **Length:** The plan must be a concise list of 2-3 steps. Each line should consist of 10 words maximum.
      4.  **Tone:** Be very encouraging! Start with a kind, positive sentence that acknowledges their mood.

      Generate the study plan now, formatted as simple text.
    `;
      const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
     });

    res.json({ plan: result.text }); // Send the plan back

   }catch (error) {
    console.error("Error in /moodtracker route:", error);
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
