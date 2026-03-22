# Huh? — Weekly MVP Execution Plan

Duration: 6 Weeks

Goal: Ship working Chrome extension with AI explanations for YouTube videos.

1. **Project Setup & Planning (Days 1–2)**
    
    - Create version-controlled repositories (one for the extension frontend, one for the backend/Node, one for the Python service).
        
    - Outline the architecture diagram and API endpoints. Clarify data flow (extension → Node API → Python transcriber → OpenAI → back).
        
    - Initialize the Node/Express project (create `server.js`, basic Express app) and connect to Supabase (if needed for cache).
        
    - Initialize the Python environment (install `transcribe-anything`, `fastapi`, and other libraries). Write a simple FastAPI skeleton with a `/transcribe` endpoint.
        
2. **Browser Extension Skeleton (Days 2–4)**
    
    - Create the manifest.json (v3) with required permissions (tabs, storage, _youtube.com_, etc.) and default_popup pointing to our React build.
        
    - Scaffold a React app (e.g. using Vite or CRA) for the popup UI. Confirm it builds into a Chrome extension popup (follow CRA/Vite extension guidelines).
        
    - Develop a minimal popup UI: fields for YouTube URL (prefilled by content script if on YouTube), timestamp input (in seconds), and a file upload button.
        
    - Add a content script that runs on YouTube pages to detect current video ID and send it to the popup (so the user can auto-fill). (This ensures ease of use on YouTube.)
        
3. **Backend Feature Implementation (Days 4–10)**
    
    - **Transcript Logic:** In the Node API, implement logic to handle a request for a video segment explanation. If a YouTube URL is provided, try fetching captions (use YouTube API or a library). If captions are unavailable or for local files, forward the audio URL or file to the Python `/transcribe` service.
        
    - **Transcription Service:** In the Python FastAPI service, integrate `transcribe-anything` to accept a URL or video file. Test it on a YouTube link and a local `.mp4` to ensure it returns text. Optimize performance (maybe limit to needed segment).
        
    - **ChatGPT Integration:** In the Node API, once text is available, call the OpenAI API (e.g. GPT-4) with a prompt asking for an explanation or summary of the transcript text. Include context like “Explain this tutorial excerpt in simple terms.”
        
    - **Caching (Optional):** Store transcripts or explanations in Supabase by video ID and timestamp to avoid re-processing the same segment repeatedly (for speed).
        
    - **Error Handling:** Ensure the system handles failures (e.g., transcription errors, API failures) by returning user-friendly error messages to the extension.
        
4. **Extension-Backend Communication (Days 8–12)**
    
    - Implement the browser extension’s networking: use `fetch` from the popup or background script to call the Node API endpoints (e.g. `/explain`). This may require CORS settings on the server.
        
    - In the popup UI, display a loading indicator while waiting for the response. Once received, show the AI-generated explanation in a scrollable text area or UI panel.
        
    - Test the end-to-end flow on YouTube: select a video and timestamp, press “Explain”, and confirm a plausible answer appears. Test on a video with no CC to force transcription fallback.
        
5. **Local Video Support (Days 10–13)**
    
    - Enable the popup to accept a local video file input. When a user selects a file, use the FileReader API or a `fetch` with `FormData` to send the file to the backend.
        
    - On the backend, adjust the transcription service to handle uploaded files (e.g., FastAPI file upload). Confirm that transcription works on local video files.
        
    - Update the UI so the user can choose between “YouTube link” and “Upload file”. Ensure the same timestamp input applies.
        
6. **Testing, Refinements, and QA (Days 13–16)**
    
    - Perform thorough testing: try various YouTube videos (with/without captions), different languages, and different file formats. Fix any bugs or performance issues.
        
    - Improve user feedback: handle long transcription times with progress updates, timeouts, or asynchronous polling.
        
    - Polish UI/UX: make the popup layout clean, handle errors (e.g. “No transcript found” or “AI request failed”), and validate inputs.
        
    - Review security and privacy: ensure API keys (YouTube, OpenAI) are not exposed in the extension. Use HTTPS for API calls.
        
    - Prepare documentation (README, code comments) for clarity.
        
7. **Deployment & Launch Preparation (Days 16–18)**
    
    - Deploy the Node and Python services to a cloud server or platform (e.g. Heroku, AWS, or a VPS). Configure domains/CORS.
        
    - Build the final extension package (production build), and load it into Chrome/Firefox to verify it installs and works as expected.
        
    - Finalize project documentation (this PRD, architecture notes, etc.) and prepare for any demo or review before the MVP deadline.
        

Each of these tasks is aimed at completing a functional MVP within **2–3 weeks**. We will iterate as needed, but focus first on core flows (YouTube URL → explanation) before polishing extra features.

YOU CAN ADD MORE TODOS ACCORDING TO THE ABOVE EXPLANATION OF THE REQUIREMENTS

---

# Huh? MVP Execution Plan

Goal: Ship working Chrome extension with AI explanations for YouTube videos.

## 1. Backend API (Node.js & Express)
- [x] Initialize Node project and install dependencies
- [x] Create `server.js` (Express entry point)
- [x] Connect Environment Config (`config/env.js`)
- [x] Initialize Supabase Database Client (`config/supabase.js`)
- [x] Setup `youtube-transcript` extraction logic (`services/transcript.service.js`)
- [x] Setup OpenAI GPT-4 integration logic (`services/ai.service.js`)
- [x] Create `POST /api/explain` controller (`controllers/explain.controller.js`)
- [x] Setup Express Routing (`routes/explain.route.js`)
- [x] Implement Rate Limiting (`middleware/rateLimiter.js`)
- [x] Test the exact prompt output formatting (`services/formatter.service.js`) (Already done via ai.service.js JSON enforcement)

## 2. Browser Extension (React & MV3)
- [ ] Scaffold React project matching MV3 `manifest.json` permissions
- [ ] Implement Popup UI (Timestamp Input, Loader, Error States)
- [ ] Implement React API Service (`services/api.js`) to `POST /api/explain`
- [ ] Implement State Management (Zustand: `store/useStore.js`)
- [ ] Build Content Script (`content.js`) to auto-scrape YouTube Video ID
- [ ] End-to-End Testing (Click on extension inside YouTube -> Receive JSON -> Render UI)

## 3. Python Microservice (FastAPI & Whisper Fallback)
- [ ] Scaffold Python virtual environment `requirements.txt`
- [ ] Create FastAPI `main.py` entry point
- [ ] Setup `transcribe-anything` wrapper function inside `services/transcription.py`
- [ ] Expose `POST /transcribe` endpoint in `api/routes.py`
- [ ] Integrate Express API Gateway to route non-youtube files to Python Microservice

## 4. Final Polish & Deployment
- [ ] Deploy Node.js Backend to Render/Railway
- [ ] Export Supabase DB schemas to Production
- [ ] Build React production bundle and load unpacked extension into Chrome
- [ ] Test the `Sub-5-Second` Service Level Agreement (SLA)
