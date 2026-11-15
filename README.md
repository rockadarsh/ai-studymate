# StudyFlow — AI Study Assistant

A responsive React application that turns a free-form topic or pasted notes into interactive flashcards and a multiple-choice quiz. It is intentionally an interactive study tool, not a chatbot.

## Features

- Free-form notes/topic input (up to 12,000 characters).
- Generates structured JSON through the Groq API.
- Flashcards with flip, previous, next, and restart controls.
- Multiple-choice quiz with answer feedback and explanations.
- Score summary and a retry flow for incorrect answers.
- Loading, empty, and actionable error states.
- Defensive JSON parsing and schema validation before rendering.
- Aborts the previous request and ignores stale responses.
- Responsive layout for mobile and desktop.
- API key stays on the server; it is never included in frontend code.

## Requirements

- Node.js 18 or newer (uses native `fetch` and `AbortSignal.timeout`).
- A Groq API key. Create one from https://console.groq.com/keys.

## Setup

1. Extract the project ZIP and open the project folder in a terminal.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root by copying `.env.example`.
4. Add your key:

   ```env
   GROQ_API_KEY=your_actual_key
   GROQ_MODEL=llama-3.3-70b-versatile
   PORT=3001
   ```

5. Start the frontend and backend together:

   ```bash
   npm start
   ```

6. Open http://localhost:5173.

The Vite development server proxies `/api` requests to the Express backend on port 3001. Keep both processes running in the same terminal.

## How it works

1. The user enters notes or a topic in the React form.
2. The frontend sends the input to `POST /api/generate`.
3. The Express backend validates the input and calls Groq's OpenAI-compatible chat-completions API. The API key is read from the server's environment.
4. The model is instructed to return JSON with a title, summary, flashcards, and quiz questions.
5. The backend returns the model content as a string. The frontend parses it with `JSON.parse` and validates the complete shape in `src/utils/validateStudySet.js`.
6. Only validated data is stored in React state and rendered as interactive components.

## Failure handling decisions

- **Empty/short/oversized input:** rejected before the model call with a useful message.
- **Missing API key:** backend returns a configuration error without exposing secrets.
- **Provider errors:** authentication, rate-limit, timeout, and general provider failures become readable API errors.
- **Empty model output:** rejected before parsing.
- **Malformed JSON:** caught and reported; the app does not crash.
- **Wrong JSON shape:** title, summary, flashcard fields, quiz options, correct answer index, and explanations are validated.
- **Slow/newer requests:** the previous fetch is aborted. A monotonically increasing request ID also prevents an older response from replacing newer state.
- **Loading/error/empty states:** each is represented explicitly in the UI.
- **Retry:** the user can retry generation; after a quiz, they can retake all questions or retry only missed ones.

## AI usage note

ChatGPT was used to help plan the application structure, draft and review code, and prepare this README. The Groq-hosted LLM generates study content at runtime. The developer should review, run, test, and understand all code before submission.

## Known limitations

- AI-generated answers can be inaccurate; users should verify important academic material against trusted notes or textbooks.
- The app currently generates one study set at a time and does not persist sessions after refresh.
- There is no authentication or database.
- Streaming generation and editing an existing study set are not implemented.
- The model/provider and free-tier rate limits can change.
- JSON mode improves formatting consistency but does not guarantee factual correctness; client-side validation is still required.

## Time spent

Target: approximately 8 hours, as requested in the assignment. Record your actual time after completing your own setup, testing, UI review, and deployment. Do not claim time you did not spend.

## Suggested manual test checklist

- [ ] Submit an empty input.
- [ ] Submit a very short input.
- [ ] Generate from the sample topic.
- [ ] Flip cards and navigate previous/next.
- [ ] Answer all quiz questions and check the score.
- [ ] Retry incorrect answers and retake the quiz.
- [ ] Temporarily remove the API key and confirm a readable error appears.
- [ ] Test a bad/empty model response by temporarily mocking the API response.
- [ ] Start two generations quickly and confirm the older response cannot overwrite the newer one.
- [ ] Check the layout at a narrow mobile width.
- [ ] Run `npm run build` before submission.

## Submission checklist

- [ ] Replace any placeholder details and record actual time spent.
- [ ] Test with your own API key.
- [ ] Create a public GitHub repository and push meaningful commits.
- [ ] Record a short screen demo showing generation, flashcards, quiz, and retry.
- [ ] Be prepared to explain `useState`, `useEffect`, `useRef`, API flow, validation, and stale-request protection.
