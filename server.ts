import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Initialization
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const extractJson = (text: string) => {
    try {
      // Find the first { and the last }
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        return JSON.parse(text.substring(start, end + 1));
      }
      // Try array [ ]
      const arrStart = text.indexOf('[');
      const arrEnd = text.lastIndexOf(']');
      if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
        return JSON.parse(text.substring(arrStart, arrEnd + 1));
      }
      return JSON.parse(text);
    } catch (e) {
      console.error("JSON Extraction Error:", e, "Raw text:", text);
      return null;
    }
  };

  app.post("/api/nutrition-analysis", async (req, res) => {
    const { query: userQuery } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ calories: 0, protein: 0, carbs: 0, fat: 0, error: "API key missing" });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this meal: "${userQuery}". Return ONLY a JSON object with: 
                   "calories" (number), "protein" (number in grams), 
                   "carbs" (number in grams), "fat" (number in grams). 
                   Format: {"calories": X, "protein": Y, "carbs": Z, "fat": W}.`,
        config: { responseMimeType: "application/json" }
      });
      
      const result = extractJson(response.text || "{}");
      res.json(result || { calories: 0, protein: 0, carbs: 0, fat: 0 });
    } catch (error: any) {
      console.error("AI Nutrition Error:", error);
      res.json({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    }
  });

  app.post("/api/coach-chat", async (req, res) => {
    const { message, userStats } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing");
      return res.json({ reply: "I'm currently disconnected. Please make sure the Gemini API key is set in the app settings." });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are FitTrack Pro AI, a world-class fitness coach. 
                   User's current stats: Level ${userStats?.level || 0}, XP ${userStats?.xp || 0}, Total Steps: ${userStats?.totalSteps || 0}.
                   User says: "${message}". 
                   Provide professional, motivating, and concise advice (2-3 sentences).`,
      });
      
      const reply = response.text || "I'm processing your progress. Keep up the great work!";
      res.json({ reply });
    } catch (error: any) {
      console.error("Coach Chat Error:", error);
      let reply = "I'm having a quick breather. Let's keep moving!";
      
      if (error.message?.includes("API key not valid") || error.status === 400) {
        reply = "My connection is a bit fuzzy. Please check the API key in Settings > Secrets.";
      } else if (error.message?.includes("User location is required")) {
         reply = "I need your location to provide personalized advice. Please enable location permissions.";
      }
      
      res.json({ reply });
    }
  });

  app.post("/api/training-plan", async (req, res) => {
    const { userGoal, currentStats } = req.body;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a personalized 7-day fitness training plan for a user with the following goal: "${userGoal}". 
        Current user stats: ${JSON.stringify(currentStats)}.
        The plan MUST include a variety of workout types such as 'running', 'cycling', 'strength training', and 'walking'.
        For each day, provide:
        1. "day": (integer 1-7)
        2. "focus": Short title of the day (e.g., "Endurance Burn", "Leg Day")
        3. "activityType": MUST be one of: "running", "cycling", "strength training", "walking"
        4. "targetSteps": (integer)
        5. "targetDistance": (number in km)
        6. "targetCalories": (number)
        7. "tips": 1-2 sentences of coaching advice.
        
        Format the response as a JSON object adhering to the schema.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              planName: { type: Type.STRING },
              description: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
                    focus: { type: Type.STRING },
                    activityType: { type: Type.STRING },
                    targetSteps: { type: Type.INTEGER },
                    targetDistance: { type: Type.NUMBER },
                    targetCalories: { type: Type.NUMBER },
                    tips: { type: Type.STRING }
                  },
                  required: ["day", "focus", "activityType"]
                }
              }
            }
          }
        }
      });

      const result = extractJson(response.text || "{}");
      res.json(result || { error: "Failed to parse plan" });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      if (error.message?.includes("API key not valid") || error.status === 400) {
        return res.status(400).json({ 
          error: "Invalid API key. Please check your GEMINI_API_KEY in Settings > Secrets."
        });
      }
      res.status(500).json({ error: "Failed to generate training plan" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
