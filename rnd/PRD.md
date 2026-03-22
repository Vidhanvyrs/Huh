# Huh? — Product Requirements Document (PRD)

Version: 1.0  
Product Type: Chrome Browser Extension  
Category: AI Learning Assistant  

---

# 1. Product Overview

Huh? is a browser extension that helps learners understand confusing parts of video tutorials instantly.

When a user feels lost while watching a tutorial, they:

1. Open the Huh? extension
2. Enter start timestamp
3. Enter end timestamp
4. Click "Explain"

Huh? extracts the transcript for that segment, adds contextual understanding, and generates a simplified AI explanation in a clear, beginner-friendly format.

Goal:
Reduce learning friction and prevent drop-offs during video-based learning.

---

# 2. Problem Statement

While watching educational videos:

- Users often feel confused at specific timestamps.
- Rewinding does not always improve clarity.
- Comments sections rarely provide structured explanations.
- There is no contextual AI tool integrated directly into video learning.

This results in:
- Frustration
- Reduced retention
- Abandoning courses
- Lower confidence in learning

---

# 3. Target Audience

Primary Users:
- Students learning coding
- Self-taught developers
- YouTube tutorial viewers
- Sharepoint meeting recorded videos
- LinkedIn Learning recorded videos
- Zoom recorded videos
- Non-native English speakers
- Professionals upskilling

Secondary Users:
- Online educators
- Bootcamp students
- Competitive exam aspirants

---

# 4. Core Value Proposition

Huh? provides:

- Timestamp-based contextual explanation
- Layman-level simplification
- Example-based breakdown
- Why-it-matters clarity
- Structured explanation output

It acts like a personal AI tutor that explains only the confusing part — not the whole video but the context should be according to the video.

---

# 5. MVP Scope

The MVP will support:

- YouTube videos, Sharepoint recorded videos, LinkedIn Learning recorded videos, Zoom recorded videos, local videos only
- Manual timestamp entry
- Transcript-based explanation
- Context window (±60 seconds) / maybe user can increase it according to more in depth explanation
- AI-generated structured output
- No authentication required
- No Whisper audio processing

Out of Scope (MVP):

- Auto confusion detection
- Voice explanation
- AI diagram generation
- Saved history
- Multi-language explanation
- Whisper-based transcription

---

# 6. User Flow (MVP)

Step 1:
User watches a YouTube tutorial or Sharepoint recorded video or LinkedIn Learning recorded video or Zoom recorded video or local video.

Step 2:
User feels confused at a certain segment.

Step 3:
User opens Huh? extension.

Step 4:
User enters:
- Start time
- End time
- context window if requires

Step 5:
Extension sends:
- Video URL
- Start time
- End time
- context window if requires

Step 6:
Backend:
- Fetches transcript for youtube or sharepoint or linkedin learning or zoom or local video if it consist of it else we are going to use transcribe-anything open source library to generate transcripts
- Extracts segment
- Adds context
- Sends to AI model

Step 7:
AI returns structured explanation.

Step 8:
User sees simplified explanation in extension popup get more clarity about the video segment and continue the tutorial.

---

# 7. Functional Requirements

FR1:
System must extract video ID from YouTube URL or Sharepoint URL or LinkedIn Learning URL or Zoom URL or local video path however the main thing is that we need to get the transcript of the video else we have to add the transcribe-anything fallback in order to generate the transcript of the video.

FR2:
System must fetch transcript for that video else we have to add the transcribe-anything fallback in order to generate the transcript of the video.

FR3:
System must slice transcript between selected timestamps.

FR4:
System must include contextual window around selection that either user will provide else we can use default value of 60 seconds.

FR5:
System must send structured prompt to AI model.

FR6:
System must return structured explanation in JSON format.

FR7:
System must render explanation in readable format inside extension.

---

# 8. Non-Functional Requirements

- Response time under 5 seconds
- Secure API key handling (backend only)
- Rate limiting (prevent abuse)
- Graceful handling of missing transcripts
- Minimal UI complexity

---

# 9. AI Output Structure

AI must return structured JSON:

{
  "whatTheyMeant": "...",
  "simpleExplanation": "...",
  "example": "...",
  "whyItMatters": "...",
  "summary": "..."
}

Tone:
- Supportive
- Non-judgmental
- Clear
- Beginner-friendly
- Encouraging

---

# 10. Success Metrics

Short-Term Metrics:
- Daily active users
- Average explanations per session
- Response time
- Error rate

Mid-Term Metrics:
- User retention
- Repeat usage per video
- Explanation satisfaction rating

Long-Term Metrics:
- Drop-off reduction
- Conversion to paid plan (future)

---

# 11. Risks & Constraints

Risk 1:
YouTube or Sharepoint or LinkedIn Learning or Zoom or local video transcript may not be available. then we should add a fallback service of using transcribe-anything open source library to generate transcribe of it 

Risk 2:
AI hallucination or misinterpretation.

Risk 3:
Token cost scaling. for this we should definately add a limitor for the AI services and a reset for per day requests else user can pay and use it unlimitedly but for this we do require the user authentication  

Risk 4:
Latency for long transcripts.

Mitigation:
- Add fallback messaging
- Optimize transcript slicing
- Token limit enforcement
- Prompt refinement

---

# 12. Future Enhancements (Post-MVP) VERY LOW PRIORITY

- Auto detect confusion via rewind frequency
- Whisper-based audio transcription
- Multi-platform support (Udemy, Coursera)
- Save Huh Moments
- AI-generated notes
- Follow-up Q&A mode
- Voice explanation
- Diagram generation
- Multi-language support
- Subscription system

---

# 13. Definition of Done (MVP)

The product is considered complete when:

- User installs extension
- Enters timestamp and context window if required
- Receives AI explanation
- Explanation feels significantly clearer than original segment
- No crashes
- Average response time < 5 seconds

---

Heres some more information that explains the MVP PRD with transcibe updates and if required addition of user authentication 
# AI Video Explainer Extension – Project Documentation

## Product Requirements (PRD)

The **AI Video Explainer Extension** is a browser add-on that helps users understand video content on demand. It lets users input a YouTube or local video (with an optional timestamp) and returns an AI-generated explanation of what is being said or shown at that moment. If a video has existing captions, the extension will use them; if not, it will fall back to a Whisper-based transcription tool ("transcribe-anything") to generate text. This product is aimed at students, learners, and professionals who encounter complex lectures or tutorials online and need quick clarification of specific segments. A clear PRD outlines goals, user stories, and features to align the team and stakeholders.

- **Goals & Objectives:** The MVP aims to let a user easily get an explanation for any part of a video. Key objectives include: (1) enabling input of a video URL and timestamp (or uploading a local video file) and (2) returning a concise AI explanation of that moment’s content, even if no captions are available. The extension should be simple to use and respond quickly to user requests.
    
- **User Stories:**
    
    - _As a student_, I can enter a YouTube video link and a specific time so that I get an explanation of the dialogue or topic at that time.
        
    - _As a user with a downloaded tutorial_, I can upload a local video file (without captions) and a timestamp so that I get an AI-generated summary of what was said at that moment, using a Whisper-based transcription if needed.
        
    - _As a learner_, if a video already has captions, I want the extension to use them directly to save time, but otherwise automatically transcribe the audio.
        
    - _As a curious viewer_, I can click the extension icon on a YouTube page to auto-fill the current video and timestamp, making the query process seamless.
        
- **Key Features (MVP):**
    
    - **Video Input:** Users can paste a YouTube URL with a timestamp, or upload a local video file. The extension UI (popup) will accept these inputs.
        
    - **Transcript Retrieval:** For YouTube videos, the backend will attempt to fetch existing captions. For videos without captions (or for local files), we use the Python “transcribe-anything” library (Whisper AI) to generate a text transcript.
        
    - **AI Explanation:** The system will call an AI (e.g. OpenAI’s GPT-4) to analyze the relevant transcript excerpt and produce an understandable explanation or summary of the video segment.
        
    - **User Interface:** A browser extension popup (or overlay) built with React will let users submit queries (video + time) and view the AI-generated explanation. The UI should show progress (e.g. “Transcribing video…”).
        
    - **Backend API:** A MERN (MongoDB/Express/React/Node) backend will handle requests. This includes an Express API server to coordinate with the Python transcription microservice and the ChatGPT API.
        
- **Out of Scope (Phase 2 features):** Other video platforms (e.g. Vimeo, TikTok) will not be supported in the MVP; only YouTube URLs and local video files are required. Generating full video summaries or supporting multiple timestamps/segmentation in one request will be saved for later phases. Multi-language transcription and translations are also out-of-scope for the MVP.
    
- **Acceptance Criteria:** The MVP is successful if a user can input a YouTube link and timestamp (or upload a local video with time) and reliably receive a correct explanation within a few seconds. The solution must gracefully handle cases with or without captions. We aim to deliver this MVP within **2–3 weeks**, focusing on core features first and refinements later.
    

（An effective PRD focuses on shared understanding and customer needs, including clear goals and user stories.）