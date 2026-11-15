# 🎓 AI StudyMate – Smart Learning Assistant

AI StudyMate is an AI-powered learning application built using React. It helps students learn more effectively by transforming study topics and notes into interactive flashcards and quizzes.

The application uses AI-generated structured data to create an interactive learning experience instead of displaying plain chatbot responses.

## 🚀 Features

- **Topic-Based Learning:** Enter any study topic or paste your notes.
- **AI-Generated Flashcards:** Generate flashcards containing questions and answers.
- **Interactive Flashcards:** Flip cards to reveal answers.
- **AI-Generated Quizzes:** Test your knowledge with multiple-choice questions.
- **Quiz Results:** View your quiz performance.
- **Retry Incorrect Answers:** Practice questions you answered incorrectly.
- **Loading and Error States:** Provide feedback during AI processing and when errors occur.
- **Responsive Design:** Designed to work on desktop and mobile devices.

*Update this feature list to match the functionality actually implemented before submission.*

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| JavaScript | Application logic |
| CSS | Styling and responsive design |
| Vite | Development and build tool |
| Node.js | Backend runtime |
| Express.js | Backend API |
| Gemini API | AI integration |
| Git & GitHub | Version control |
| Netlify | Frontend deployment |

## 📂 Project Structure

```text
ai-studymate/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

*The structure may change as additional components and backend files are added.*

## ⚙️ Installation and Setup

### Prerequisites

- Node.js
- npm
- Gemini API key

### Step 1: Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### Step 2: Navigate to the project

```bash
cd ai-studymate
```

### Step 3: Install dependencies

```bash
npm install
```

### Step 4: Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

### Step 5: Build for production

```bash
npm run build
```

The production-ready frontend files will be generated in the `dist` folder.

## 🤖 AI Integration

The application uses Google's Gemini AI model to generate structured learning content.

The expected AI response contains structured JSON data, including flashcards and quiz questions.

Example:

```json
{
  "flashcards": [
    {
      "question": "What is Machine Learning?",
      "answer": "Machine Learning is a branch of AI that enables computers to learn from data."
    }
  ],
  "quiz": [
    {
      "question": "Which is a type of Machine Learning?",
      "options": [
        "Supervised Learning",
        "HTML",
        "CSS",
        "Networking"
      ],
      "correctAnswer": "Supervised Learning"
    }
  ]
}
```

The frontend parses the structured response and renders interactive learning components.

**Security:** The Gemini API key should be stored securely on the backend and must never be exposed in frontend code.

## 🛡️ Error Handling

The application aims to handle different AI and network failures, including:

- Invalid or malformed JSON responses.
- Missing or incorrect response fields.
- Empty AI responses.
- API request failures.
- Slow network responses.
- Loading and empty states.

## 🌐 Deployment

The React frontend can be deployed using Netlify.

Build command:

```bash
npm run build
```

Publish directory:

```text
dist
```

The backend must be deployed separately if using a separate Express server.

## 🧠 AI Usage Disclosure

AI development tools such as ChatGPT were used to assist with:

- Understanding the assignment requirements.
- Planning the application architecture.
- Debugging and troubleshooting.
- Understanding React concepts.
- Improving code structure and documentation.

The implementation and technical decisions are reviewed and tested as part of the development process.

## ⚠️ Known Limitations

- AI-generated content may occasionally contain incorrect information.
- Internet connectivity is required for cloud-based AI requests.
- AI response quality depends on the selected model.
- The application requires appropriate API configuration to generate learning content.

*Update this section with the limitations you actually observe during testing.*

## ⏱️ Time Spent

Target development time: Approximately 1.5 hours.

Actual development time: Update before submission.

## 👨‍💻 Author

**Adarsh Ranjan**

Frontend Internship Assignment

---

⭐ If you find this project interesting, feel free to explore the repository!
