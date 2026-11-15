
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { input } = JSON.parse(event.body || "{}");

    if (!input || input.trim().length < 8 || input.length > 12000) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Please enter between 8 and 12000 characters." }),
      };
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured.");
    }

    const systemPrompt = `
You are an educational assistant. Create a study set from the user's topic.
Return ONLY valid JSON with this structure:
{
  "title": "string",
  "summary": "string",
  "flashcards": [
    { "question": "string", "answer": "string" }
  ],
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}
Create useful flashcards and multiple-choice questions.
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
          temperature: 0.3,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.trim() },
          ],
        }),
        signal: AbortSignal.timeout(25000),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "AI provider request failed.");
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("The AI returned an empty response.");
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Something went wrong." }),
    };
  }
};
