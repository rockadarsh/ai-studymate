// Parse untrusted model output and validate every field before rendering it.
export function parseStudySet(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("The AI returned an empty result. Please try again.");
  }

  let data;
  try {
    // Remove optional markdown fences in case the provider ignores the JSON instruction.
    const cleaned = raw.trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");
    data = JSON.parse(cleaned);
  } catch {
    throw new Error("The AI response was not valid JSON. Please retry.");
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("The AI response has an unexpected format. Please retry.");
  }
  if (typeof data.title !== "string" || !data.title.trim()) {
    throw new Error("The study set is missing a valid title. Please retry.");
  }
  if (typeof data.summary !== "string" || !data.summary.trim()) {
    throw new Error("The study set is missing a summary. Please retry.");
  }
  if (!Array.isArray(data.flashcards) || data.flashcards.length < 1) {
    throw new Error("The AI did not provide any flashcards. Please retry.");
  }
  if (!Array.isArray(data.quiz) || data.quiz.length < 1) {
    throw new Error("The AI did not provide quiz questions. Please retry.");
  }

  const flashcards = data.flashcards.map((card, index) => {
    if (!card || typeof card.question !== "string" || !card.question.trim() ||
        typeof card.answer !== "string" || !card.answer.trim()) {
      throw new Error(`Flashcard ${index + 1} is incomplete. Please retry.`);
    }
    return { question: card.question.trim(), answer: card.answer.trim() };
  });

  const quiz = data.quiz.map((item, index) => {
    if (!item || typeof item.question !== "string" || !item.question.trim() ||
        !Array.isArray(item.options) || item.options.length !== 4 ||
        item.options.some(option => typeof option !== "string" || !option.trim()) ||
        !Number.isInteger(item.correctIndex) || item.correctIndex < 0 || item.correctIndex > 3 ||
        typeof item.explanation !== "string" || !item.explanation.trim()) {
      throw new Error(`Quiz question ${index + 1} has an invalid structure. Please retry.`);
    }
    return {
      question: item.question.trim(),
      options: item.options.map(option => option.trim()),
      correctIndex: item.correctIndex,
      explanation: item.explanation.trim()
    };
  });

  return { title: data.title.trim(), summary: data.summary.trim(), flashcards, quiz };
}
