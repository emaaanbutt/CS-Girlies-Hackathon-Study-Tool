import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai'; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const app = express();

app.use(cors());
app.use(express.json()); 

const geminiModel = genAI.getGenerativeModel({ model: "models/text-bison-001" });

app.post('/flashcards', async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const prompt = `
            Generate 5 high-quality flashcards for the topic: "${topic}".
            Return the response as *only* a valid JSON array, with each object
            containing a "q" (question) and an "a" (answer) key.
            Do not include any other text or markdown.

            Example:
            [
              {"q": "What is 2+2?", "a": "4"},
              {"q": "What is the capital of France?", "a": "Paris"}
            ]
        `;
        
        const result = await geminiModel.generateContent(prompt);
        
        const response = await result.response;
        const text = response.text();
        

        const cleanedJson = text.replace('```json', '').replace('```', '').trim();
        const flashcards = JSON.parse(cleanedJson); 
        
        res.json(flashcards);

    } catch (error) {
        console.error("Error in /flashcards route:", error);
        res.status(500).json({ error: 'Failed to generate flashcards' });
    }
});

app.post('/plan', async (req, res) => {
    try {
        const { hours, difficulty } = req.body;

        if (!hours || !difficulty) {
            return res.status(400).json({ error: 'Hours and difficulty are required' });
        }

        const prompt = `
            Create a study plan for a student who has ${hours} hours to study
            for a test of ${difficulty} difficulty.
            Break down the plan into a list of tasks and study blocks.
            Each study block should be a 25-minute "Pomodoro" session,
            followed by a 5-minute break.
            Be encouraging and clear.
        `;

        const result = await geminiModel.generateContent(prompt);

        const response = await result.response;
        const studyPlan = response.text();
        
        res.json({ plan: studyPlan });

    } catch (error) {
        console.error("Error in /plan route:", error);
        res.status(500).json({ error: 'Failed to generate study plan' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});