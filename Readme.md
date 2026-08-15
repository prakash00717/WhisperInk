# WhisperInk ✒️

> A magical handwritten interface that turns your writing into an intelligent conversation.

WhisperInk is an experimental AI-powered digital diary designed around a simple idea:

**You write naturally with a pen. WhisperInk understands what you wrote and writes back.**

Rather than behaving like a conventional chatbot with text boxes and buttons, WhisperInk uses a canvas-based handwritten interface as its primary interaction method.

---

## ✨ Current Capabilities

WhisperInk currently supports:

* ✍️ Handwritten input using a mouse, stylus, or pointer
* 🕐 Automatic detection of when a writing session has finished
* 🖼️ Extraction of the written region from the canvas
* 👁️ Vision-based handwriting understanding through Gemini
* 🧠 Context-aware diary responses
* 💾 Memory infrastructure for maintaining conversation context
* 🖋️ Handwritten-style rendering of AI responses
* 🎨 Per-character variation in:

  * rotation
  * baseline position
  * spacing
  * ink opacity
* 🌫️ Fade-in animation for generated responses
* 🔄 Frontend ↔ FastAPI backend communication
* 🛡️ Gemini API failover across multiple projects
* 🧪 Debug/text-only interaction mode

---

# 🏗️ Architecture

WhisperInk is currently divided into two major components:

```text
WhisperInk
│
├── Frontend
│   │
│   ├── Canvas
│   ├── Pen Renderer
│   ├── Session Manager
│   ├── Diary Renderer
│   ├── Reply Animator
│   └── Diary Client
│
└── Backend
    │
    ├── FastAPI
    ├── Diary
    ├── Memory
    ├── Prompt Builder
    └── Gemini Interface
```

The basic interaction flow is:

```text
User writes
     │
     ▼
Canvas
     │
     ▼
SessionManager
     │
     ▼
Writing region captured
     │
     ▼
PNG sent to FastAPI
     │
     ▼
Gemini Vision
     │
     ├── Transcript
     └── Reply
     │
     ▼
FastAPI JSON response
     │
     ▼
DiaryRenderer
     │
     ▼
Handwritten reply
```

---

# 🖋️ Frontend

The frontend is responsible for the interactive writing experience.

### Canvas

The main interface is an HTML canvas.

The user can write directly on the page using pointer input.

### SessionManager

Writing is grouped into sessions.

After the configured idle period, the current writing session is considered complete and is sent to the backend.

### PenRenderer

Responsible for rendering the user's handwriting strokes.

### DiaryRenderer

Responsible for rendering WhisperInk's responses.

Rather than simply displaying normal browser text, the renderer breaks the response into individual characters.

Each character can receive small variations such as:

```text
rotation     ± small angle
baseline     small offset
spacing      small variation
opacity      subtle ink variation
```

This prevents the generated response from looking like perfectly typeset computer text.

### ReplyAnimator

Controls the appearance of generated responses.

The current implementation uses a fade-in effect so the response gradually appears on the page.

---

# ⚙️ Backend

The backend is implemented using FastAPI.

The primary endpoint is:

```text
POST /diary
```

It accepts the captured handwritten page as an image.

The backend then:

1. Receives the image.
2. Builds the WhisperInk prompt.
3. Sends the image and prompt to Gemini.
4. Receives the transcript and response.
5. Returns the result to the frontend.

A debug endpoint is also available for testing the conversational system without handwriting input.

---

# 🧠 Gemini Integration

WhisperInk currently uses Google's Gemini API for the main language and vision intelligence.

The Gemini interface supports two modes:

### Vision

Used by the actual diary workflow.

```text
Image + Prompt
      ↓
Gemini Vision
      ↓
Transcript + Reply
```

### Text

Used primarily for debugging and development.

```text
Text + Prompt
      ↓
Gemini
      ↓
Reply
```

Responses are requested in structured JSON format.

Example:

```json
{
  "transcript": "Hello",
  "reply": "A warm welcome back to you..."
}
```

---

# 🔑 Multiple Gemini Projects

WhisperInk can be configured with multiple Gemini API keys belonging to different projects.

The system can fail over when a project reaches its quota.

Conceptually:

```text
Gemini Project 1
       │
       ├── success → continue
       │
       └── 429
            ↓
Gemini Project 2
       │
       ├── success → continue
       │
       └── 429
            ↓
Gemini Project 3
```

API keys should be stored in environment variables and **must never be committed to Git**.

Example:

```env
GEMINI_KEY_1=your_key_here
GEMINI_KEY_2=your_key_here
GEMINI_KEY_3=your_key_here
```

---

# 🧠 Memory

WhisperInk contains a memory layer intended to provide continuity between conversations.

The long-term goal is to move beyond storing raw conversations and instead maintain structured information such as:

```text
Projects
Goals
Ideas
Preferences
Important events
People
Past conversations
Unresolved questions
```

This is an important part of WhisperInk's future architecture.

The goal is for Gemini to provide the general intelligence while WhisperInk's memory provides **personal context and continuity**.

---

# 🚀 Future Vision

WhisperInk is intentionally designed to grow beyond a simple AI diary.

The long-term concept is a personal intelligence system that can understand writing, maintain memories, recognize projects, and interact with different tools and models.

A possible future architecture:

```text
                         WhisperInk
                              │
                     ┌────────▼────────┐
                     │  Memory + Router│
                     └────────┬────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
       Projects             Goals              Personal
          │                   │                   │
          ▼                   ▼                   ▼
      Knowledge            Tasks             Memories
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Intelligence    │
                    │                   │
                    │ Gemini / Local AI │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │      Tools        │
                    │                   │
                    │ Files             │
                    │ Git               │
                    │ Computer          │
                    │ Calendar          │
                    │ Internet          │
                    └───────────────────┘
```

The eventual goal is not simply to create a chatbot.

It is to create a **personal intelligence layer** that understands the user's thoughts, projects, history, and working environment.

---

# 🔮 Possible Future Features

Planned/exploratory ideas include:

* Persistent long-term memory
* Semantic memory search
* Project-specific knowledge
* Automatic project/context detection
* Task and goal extraction
* Reminders
* Calendar integration
* File and Git integration
* Local/offline language models
* Specialist models for different domains
* Model routing
* Tool execution
* Local computer control
* Temporal memory and historical context
* Personalized reasoning
* More realistic handwriting generation
* Multiple handwriting styles
* Physical tablet deployment

The eventual vision is closer to a **JARVIS-like personal computing system** than a conventional chatbot.

---

# 🛠️ Running WhisperInk

## Requirements

Currently you will need:

* Python
* Node/browser environment capable of running the frontend
* FastAPI
* Uvicorn
* Google GenAI Python SDK
* A Gemini API key

---

## Backend

Navigate to the backend:

```powershell
cd Backend
```

Activate the Python virtual environment:

```powershell
.\venv\Scripts\activate
```

Run FastAPI:

```powershell
uvicorn main:app --reload --port 8001
```

The backend will be available at:

```text
http://127.0.0.1:8001
```

---

## Frontend

Serve the frontend using a local HTTP server.

For example:

```powershell
cd Frontend
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

---

# 🔐 Security

Do not commit API keys.

The `.env` file should remain local.

The repository's `.gitignore` includes environment files and other development artifacts.

Before pushing changes, verify:

```powershell
git ls-files .env
```

The command should return nothing.

---

# 📌 Project Status

**Current stage: Working prototype**

The complete basic pipeline is operational:

```text
Handwriting
     ↓
Capture
     ↓
Backend
     ↓
Gemini Vision
     ↓
Understanding
     ↓
Response
     ↓
Handwritten rendering
```

The project is now moving from the initial proof-of-concept stage toward a more persistent and intelligent personal system.

---

# 🤝 Contributions

WhisperInk is an experimental project and is open to ideas, experimentation, and improvements.

Interesting areas for contribution include:

* handwriting rendering
* UI/UX
* memory architecture
* local AI
* model routing
* semantic search
* computer interaction
* project-aware intelligence
* performance optimization

---

# 📜 Philosophy

WhisperInk is based on a simple idea:

> **What if interacting with a computer felt more like writing in a magical book than operating software?**

The goal is to make the interface disappear and let the user's thoughts become the interaction.

**Write naturally.
WhisperInk remembers.**
