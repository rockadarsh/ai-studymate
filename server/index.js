require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));

const PORT = process.env.PORT || 3001;
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/generate", async (req, res) => {
  const { input } = req.body || {};
  if (typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ error: "Please enter a topic or some notes." });
  }
  if (input.trim().length < 8) {
    return res.status(400).json({ error: "Please provide a little more detail (at least 8 characters)." });
  }
  if (input.length > 12000) {
    return res.status(413).json({ error: "Your input is too long. Please keep it under 12,000 characters." });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ error: "AI is not configured yet. Add GROQ_API_KEY to your .env file and restart the server." });
  }

  const systemPrompt = `You are a careful study-material generator. Return ONLY one valid JSON object, no markdown fences or commentary.
The exact schema is:
{
  "title": "short descriptive title",
  "summary": "2-3 sentence summary",
  "flashcards": [{"question":"...","answer":"..."}],
  "quiz": [{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]
}
Rules:
- Create 5 to 8 useful flashcards and exactly 5 multiple-choice quiz questions.
- Every quiz question must have exactly 4 distinct options.
- correctIndex must be an integer from 0 to 3.
- Explanations should briefly explain why the correct answer is right.
- Base the material on the user's input. Do not invent specific facts when the input is insufficient; make reasonable foundational questions about the stated topic.
- All fields must be non-empty strings except correctIndex.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.trim() }
        ]
      }),
      signal: AbortSignal.timeout(55000)
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Groq API error:", response.status, details.slice(0, 500));
      if (response.status === 401) return res.status(502).json({ error: "The AI provider rejected the API key. Check GROQ_API_KEY in your .env file." });
      if (response.status === 429) return res.status(503).json({ error: "The AI service is busy or its rate limit was reached. Please try again shortly." });
      return res.status(502).json({ error: "The AI provider could not complete the request. Please retry." });
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      return res.status(502).json({ error: "The AI returned an empty response. Please try again." });
    }
    // Keep the API response as text. The client parses and validates the model output.
    return res.json({ content });
  } catch (error) {
    console.error("Generation failed:", error.message);
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return res.status(504).json({ error: "The AI request took too long. Please try again." });
    }
    return res.status(500).json({ error: "Something went wrong while generating your study set." });
  }
});

app.listen(PORT, () => console.log(`StudyFlow API running at http://localhost:${PORT}`));
