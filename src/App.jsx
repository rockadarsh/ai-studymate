import { useEffect, useRef, useState } from "react";
import {
  BookOpen, Brain, Check, ChevronLeft, ChevronRight, RotateCcw,
  Sparkles, GraduationCap, AlertCircle, RefreshCw, Layers3, Trophy
} from "lucide-react";
import { parseStudySet } from "./utils/validateStudySet";

const SAMPLE = "Explain the four main principles of object-oriented programming: encapsulation, abstraction, inheritance, and polymorphism. Include a simple example for each.";

export default function App() {
  const [input, setInput] = useState("");
  const [studySet, setStudySet] = useState(null);
  const [activeTab, setActiveTab] = useState("cards");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [wrongOnly, setWrongOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const requestId = useRef(0);
  const abortRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const generate = async (event) => {
    event?.preventDefault();
    if (!input.trim()) {
      setError("Add a topic or paste your notes first.");
      return;
    }

    // Abort the previous request and also guard against stale responses.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const currentRequest = ++requestId.current;

    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
        signal: controller.signal
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Request failed (${response.status}).`);

      const parsed = parseStudySet(body.content);
      if (currentRequest !== requestId.current) return;

      setStudySet(parsed);
      setActiveTab("cards");
      setCardIndex(0);
      setFlipped(false);
      setAnswers({});
      setSubmitted(false);
      setWrongOnly(false);
    } catch (err) {
      if (err.name === "AbortError") return;
      if (currentRequest === requestId.current) {
        setError(err.message || "Unable to generate study material. Please retry.");
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setWrongOnly(false);
  };

  const questions = studySet?.quiz || [];
  const score = questions.filter((q, i) => answers[i] === q.correctIndex).length;
  const wrongIndices = questions.map((q, i) => answers[i] !== q.correctIndex ? i : -1)
    .filter(i => i >= 0);
  const visibleQuestions = wrongOnly ? wrongIndices : questions;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark"><Brain size={20}/></span> studyflow</a>
        <div className="top-note"><span className="status-dot"/> AI-powered active learning</div>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="eyebrow"><Sparkles size={14}/> YOUR PERSONAL AI STUDY PARTNER</div>
          <h1>Turn what you know into<br/><span>what you remember.</span></h1>
          <p>Paste your notes or enter a topic. Get focused flashcards and a quick quiz, built for active recall.</p>
        </section>

        <section className="input-panel">
          <div className="panel-heading">
            <div><span className="step-number">01</span><strong>What are you studying today?</strong></div>
            <span className="character-count">{input.length.toLocaleString()} / 12,000</span>
          </div>
          <form onSubmit={generate}>
            <textarea
              value={input}
              onChange={e => { setInput(e.target.value.slice(0, 12000)); setError(""); }}
              placeholder="Paste your class notes, a chapter, or simply type a topic…"
              rows={5}
              maxLength={12000}
              aria-label="Study topic or notes"
            />
            <div className="input-footer">
              <button type="button" className="sample-btn" onClick={() => { setInput(SAMPLE); setError(""); }}>
                <BookOpen size={15}/> Try a sample topic
              </button>
              <button className="generate-btn" type="submit" disabled={loading || !input.trim()}>
                {loading ? <><span className="spinner"/> Creating your set…</> : <><Sparkles size={16}/> Generate study set</>}
              </button>
            </div>
          </form>
          {error && <div className="error-box" role="alert"><AlertCircle size={17}/><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
        </section>

        {loading && (
          <section className="loading-panel" aria-live="polite">
            <div className="loading-icon"><Brain size={23}/></div>
            <div><strong>Building your study set</strong><p>Organizing key ideas into questions and answers…</p></div>
            <span className="loading-pulse"/>
          </section>
        )}

        {!studySet && !loading && (
          <section className="empty-state">
            <div className="empty-illustration"><Layers3 size={30}/></div>
            <h2>Your next study session starts here</h2>
            <p>Your flashcards and quiz will appear here after you generate a study set.</p>
            <div className="feature-row">
              <span><Check size={14}/> Active recall</span>
              <span><Check size={14}/> Instant feedback</span>
              <span><Check size={14}/> Retry mistakes</span>
            </div>
          </section>
        )}

        {studySet && (
          <section className="results-section">
            <div className="result-heading">
              <div><div className="eyebrow"><GraduationCap size={14}/> YOUR STUDY SET</div><h2>{studySet.title}</h2></div>
              <button className="text-btn" onClick={() => { setStudySet(null); setError(""); }}><RefreshCw size={15}/> New topic</button>
            </div>
            <p className="summary">{studySet.summary}</p>
            <div className="tab-bar" role="tablist" aria-label="Study modes">
              <button role="tab" aria-selected={activeTab === "cards"} className={activeTab === "cards" ? "active" : ""} onClick={() => setActiveTab("cards")}><Layers3 size={16}/> Flashcards <span>{studySet.flashcards.length}</span></button>
              <button role="tab" aria-selected={activeTab === "quiz"} className={activeTab === "quiz" ? "active" : ""} onClick={() => setActiveTab("quiz")}><Brain size={16}/> Quick quiz <span>{studySet.quiz.length}</span></button>
            </div>

            {activeTab === "cards" && <div className="cards-area">
              <div className="progress-line"><span style={{width: `${((cardIndex + 1) / studySet.flashcards.length) * 100}%`}}/></div>
              <div className="card-meta"><span>FLASHCARD {cardIndex + 1} OF {studySet.flashcards.length}</span><span>{flipped ? "ANSWER" : "QUESTION"}</span></div>
              <button className={`flashcard ${flipped ? "is-flipped" : ""}`} onClick={() => setFlipped(v => !v)} aria-label="Flip flashcard">
                <span className="card-label">{flipped ? "ANSWER" : "QUESTION"}</span>
                <span className="card-content">{flipped ? studySet.flashcards[cardIndex].answer : studySet.flashcards[cardIndex].question}</span>
                <span className="flip-hint"><RotateCcw size={14}/> Click to flip</span>
              </button>
              <div className="card-controls">
                <button className="secondary-btn" disabled={cardIndex === 0} onClick={() => {setCardIndex(i => i - 1); setFlipped(false);}}><ChevronLeft size={17}/> Previous</button>
                <button className="primary-btn" onClick={() => { if (cardIndex === studySet.flashcards.length - 1) {setCardIndex(0);} else {setCardIndex(i => i + 1);} setFlipped(false); }}>
                  {cardIndex === studySet.flashcards.length - 1 ? "Start again" : "Next card"} <ChevronRight size={17}/>
                </button>
              </div>
            </div>}

            {activeTab === "quiz" && <div className="quiz-area">
              {submitted && <div className="score-panel"><div className="score-icon"><Trophy size={21}/></div><div><strong>You scored {score} out of {questions.length}</strong><p>{score === questions.length ? "Perfect score — excellent work!" : "Review the explanations and give it another try."}</p></div></div>}
              {wrongOnly && <div className="filter-note">Showing {visibleQuestions.length} question(s) you missed.</div>}
              {visibleQuestions.length === 0 && submitted ? <div className="all-correct"><Check size={20}/> No mistakes to review. Great job!</div> :
                visibleQuestions.map((q) => {
                  const originalIndex = questions.indexOf(q);
                  const selected = answers[originalIndex];
                  return <article className="question-card" key={originalIndex}>
                    <div className="question-number">QUESTION {originalIndex + 1}</div>
                    <h3>{q.question}</h3>
                    <div className="options-list">
                      {q.options.map((option, optionIndex) => {
                        const isCorrect = optionIndex === q.correctIndex;
                        const isSelected = selected === optionIndex;
                        let cls = "option";
                        if (submitted && isCorrect) cls += " correct";
                        else if (submitted && isSelected) cls += " incorrect";
                        else if (isSelected) cls += " selected";
                        return <button key={optionIndex} className={cls} disabled={submitted} onClick={() => setAnswers(a => ({...a, [originalIndex]: optionIndex}))}>
                          <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span>
                          {submitted && isCorrect && <Check size={17}/>}
                          {submitted && isSelected && !isCorrect && <span className="wrong-mark">×</span>}
                        </button>;
                      })}
                    </div>
                    {submitted && <div className={`explanation ${selected === q.correctIndex ? "good" : "needs-review"}`}><strong>{selected === q.correctIndex ? "Correct!" : "Not quite."}</strong> {q.explanation}</div>}
                  </article>;
                })}
              <div className="quiz-actions">
                {!submitted ? <button className="primary-btn" disabled={Object.keys(answers).length !== questions.length} onClick={() => setSubmitted(true)}>Check my answers <Check size={16}/></button> :
                  <><button className="secondary-btn" onClick={resetQuiz}><RotateCcw size={16}/> Retake quiz</button>
                    {wrongIndices.length > 0 && <button className="primary-btn" onClick={() => {setWrongOnly(true); setSubmitted(false); setAnswers({});}}>Retry incorrect ({wrongIndices.length}) <ChevronRight size={16}/></button>}
                  </>}
              </div>
            </div>}
          </section>
        )}
        <footer><span>STUDYFLOW</span><span>Learn by remembering, not just rereading.</span></footer>
      </main>
    </div>
  );
}
