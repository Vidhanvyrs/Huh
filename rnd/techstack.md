# Huh? — Tech Stack & MVP Architecture

## Vision

Huh? is a browser extension that allows users to select a confusing video timestamp segment and receive a simplified AI explanation with context.

This document defines the MVP technical stack and exact folder structure.

The extension’s architecture has two main parts: the **browser extension frontend** and the **backend services (MERN + Python microservice)**. The browser extension is built with standard web technologies (HTML/CSS/JavaScript) and React for the UI. It uses a **Manifest V3** configuration to define its permissions and entry points. The extension includes:

- **Content Scripts:** JavaScript injected into web pages (e.g. YouTube pages) to interact with the page’s video player or DOM. Content scripts can read the current URL and timestamp, but cannot directly call cross-origin APIs.
    
- **Background Service Worker:** A persistent script (in Manifest V3) to handle events, API calls, and data processing. It coordinates between the content script and the popup UI. Background workers manage state and communication without direct DOM access.
    
- **Popup UI:** A small React-based interface (triggered by the extension icon) that lets the user input a video URL/time or select a local file. The popup is just an HTML page (bundled with React) specified in the manifest. When the user submits, the popup (or background script) sends a request to our backend server.
    

The **manifest.json** file is the heart of the extension configuration. It specifies extension metadata (name, version), permissions (e.g. access to _youtube.com_ or file URLs), and entry points like the `default_popup`. We will use manifest version 3 (the latest Chrome extension manifest format). The popup UI runs our React app (built with a tool like Vite or CRA), and any content or background scripts are listed in the manifest.

On the backend side, we will use a **MERN stack**:

- **Supabase (PostgreSQL):** For any persistent data (user accounts, saved transcripts, settings). Initially, we may not need heavy database use, but it’s ready if we add user profiles. Supabase provides a powerful PostgreSQL database with built-in auth for later scaling.
    
- **Express/Node.js Server:** A REST API that receives requests from the extension (video URL/time). It will handle business logic: checking for cached transcripts, calling the transcription service, invoking the ChatGPT API, and returning the answer. The Node server acts as an API gateway.
    
- **Python Microservice:** We will run a separate service (e.g. using FastAPI or Flask) dedicated to transcription. This service leverages the open-source `transcribe-anything` library (Whisper-based) to convert video/audio to text. FastAPI is a good fit for this AI-oriented microservice because it natively supports async calls and automatic OpenAPI docs. For example, FastAPI’s async design is well-suited for calling external APIs and heavy tasks (like Whisper) efficiently. The service exposes an HTTP endpoint (e.g. `/transcribe`) that the Node backend calls with a video URL or file data, and returns the transcript text.
    

The flow is: extension popup → Node API → (if needed) Python transcriber → Node receives transcript → Node calls OpenAI’s ChatGPT (e.g. GPT-4) with the relevant text snippet → Node returns explanation to the extension. We will use the OpenAI API (or Azure OpenAI) on the Node side to generate the final answer. Prior work shows that GPT models can efficiently summarize or explain video transcript text. For instance, Chrome extensions already use GPT-4 via OpenAI’s API to analyze large text blocks and produce concise summaries, demonstrating the viability of this approach.

**Development Tools:** We will use React (with TypeScript) for the popup and possibly the content script’s UI. A build tool like Vite (with CRXJS plugin) will enable hot-reloading during development. The Node server will run on the same codebase as our main backend (Express), and the Python service will be containerized or run on the same machine. For deployment, the Node and Python services can be hosted on the cloud or a VPS, with CORS enabled for the extension. The extension itself will be packaged according to Chrome’s guidelines.

---

# 1. High-Level Architecture (MVP)

Chrome Extension (React)
        ↓
Node.js Backend (Express API)
        ↓
Transcript Fetcher (YouTube API)
        ↓
AI Service (OpenAI / Claude / Gemini)
        ↓
Structured Response Formatter
        ↓
Return JSON → Extension UI

---

# 2. Core Tech Stack

## Frontend (Browser Extension)

- React (Vite build setup)
- Chrome Extension Manifest v3
- TailwindCSS
- Zustand (light state management)
- Axios (API calls)

Why:
- Fast iteration
- Lightweight
- You are already strong in React

---

## Backend

- Node.js
- Express.js
- Supabase (PostgreSQL)
- @supabase/supabase-js
- dotenv
- axios
- youtube-transcript API (or equivalent)

Why:
- Fast to build
- JS ecosystem
- Easy AI integration

---

## AI Layer

Recommended:
- OpenAI GPT-4o / GPT-4.1
OR
- Claude 3
OR
- Gemini 1.5 Pro

MVP approach:
- Backend-only AI calls
- Structured prompt engineering
- JSON output format

---

## Database (Supabase / PostgreSQL)

Tables:

### User
{
  _id,
  email,
  planType,
  createdAt
}

### HuhMoment
{
  id, (UUID)
  videoUrl,
  startTime,
  endTime,
  transcriptSegment,
  aiExplanation,
}

---

# 3. MVP Scope Definition

MVP includes:

- Manual timestamp input
- YouTube transcript extraction only
- Context window (±30 seconds)
- AI explanation
- Formatted output
- No auth (optional later)
- No Whisper
- No audio processing

---

# 4. Backend Folder Structure (Exact)

huh-backend/

src/
│
├── server.js
│
├── config/
│   ├── db.js
│   └── env.js
│
├── routes/
│   └── explain.route.js
│
├── controllers/
│   └── explain.controller.js
│
├── services/
│   ├── transcript.service.js
│   ├── ai.service.js
│   ├── supabase.service.js
│   └── formatter.service.js
│
├── models/
│   └── schema.sql (Supabase Table definitions)
│
├── utils/
│   ├── timeParser.js
│   └── contextWindow.js
│
└── middleware/
    └── rateLimiter.js


---

# 5. Chrome Extension Folder Structure (Exact)

huh-extension/

public/
│   └── manifest.json
│
src/
│
├── popup/
│   ├── Popup.jsx
│   ├── Popup.css
│   └── index.jsx
│
├── components/
│   ├── TimestampInput.jsx
│   ├── ExplanationCard.jsx
│   └── Loader.jsx
│
├── hooks/
│   └── useExplain.js
│
├── store/
│   └── useStore.js
│
├── services/
│   └── api.js
│
└── utils/
    └── formatTime.js


---

# 6. API Design

POST /api/explain

Body:
{
  videoUrl: string,
  startTime: string,
  endTime: string,
  level: "beginner" | "intermediate"
}

Response:
{
  explanation: {
    whatTheyMeant: string,
    simpleExplanation: string,
    example: string,
    whyItMatters: string,
    summary: string
  }
}

---

# 7. Prompt Engineering Structure (MVP)

System Prompt:
"You are an expert tutor who explains complex concepts in extremely simple and intuitive ways."

User Input:
- Full transcript context
- Selected segment
- User level

Required Output Format:
{
  "whatTheyMeant": "...",
  "simpleExplanation": "...",
  "example": "...",
  "whyItMatters": "...",
  "summary": "..."
}

---

# 8. MVP Deployment Plan

Backend:
- Render / Railway / Fly.io

Database:
- Supabase

Extension:
- Local testing → Chrome Dev mode
- Later: Chrome Web Store

---

# 9. Scalability Plan (Post-MVP)

- Add Redis caching
- Add auth + subscription
- Add Python microservice for Whisper
- Add embeddings for semantic understanding
- Add confusion auto-detection

---

END OF DOCUMENT