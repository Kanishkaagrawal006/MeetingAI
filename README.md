# MeetingAI — Meeting Summarizer

An AI-powered meeting summarization application that automatically converts meeting audio into a transcript and generates an action-oriented summary containing key decisions, action items, and risks.

The application combines **Azure Speech Services** for speech-to-text transcription with **Google Gemini** for structured meeting analysis.

---

## Features

* 🎙️ Upload meeting audio files
* ☁️ Secure audio storage
* 📝 Automatic speech transcription using Azure Speech Services
* 🤖 AI-powered meeting summarization using Google Gemini
* 📌 Extract key decisions
* ✅ Generate action items with:

  * Task
  * Assignee
  * Deadline
  * Priority
* ⚠️ Identify potential meeting risks
* 📖 View the complete transcript
* 📊 View meeting processing status
* 📥 Download meeting summary
* 📥 Download transcript
* 🗑️ Delete meetings
* 🔄 Automatic status polling while meetings are being processed
* 🐳 Docker support for running the application locally

---

# Application Flow

```text
                    ┌──────────────────┐
                    │      User        │
                    └────────┬─────────┘
                             │
                             │ Upload Audio
                             ▼
                    ┌──────────────────┐
                    │ React Frontend   │
                    │   Vite + TS      │
                    └────────┬─────────┘
                             │
                             │ REST API
                             ▼
                    ┌──────────────────┐
                    │ Spring Boot API  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌────────────┐ ┌────────────┐ ┌─────────────┐
       │   Storage  │ │   Azure    │ │ PostgreSQL  │
       │            │ │   Speech   │ │             │
       └────────────┘ └─────┬──────┘ └─────────────┘
                             │
                             │ Transcript
                             ▼
                    ┌──────────────────┐
                    │  Google Gemini   │
                    │       LLM        │
                    └────────┬─────────┘
                             │
                             │ Structured JSON
                             ▼
                    ┌──────────────────┐
                    │     Backend      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ React Frontend   │
                    │                  │
                    │ Summary          │
                    │ Decisions        │
                    │ Action Items     │
                    │ Risks            │
                    │ Transcript       │
                    └──────────────────┘
```

---

# Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* TanStack React Query
* Axios
* Lucide React

## Backend

* Java
* Spring Boot
* Spring Web
* Spring Data JPA
* Hibernate
* PostgreSQL
* Maven

## AI / Cloud Services

* Azure Speech Services — speech-to-text transcription
* Google Gemini — meeting analysis and summarization
* AWS S3 / Azure Blob Storage — audio storage depending on deployment configuration

## Infrastructure

* Docker
* Docker Compose

---

# Project Structure

```text
meeting-summarizer/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── types/
│   │   └── lib/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   ├── pom.xml
│   ├── Dockerfile
│   └── ...
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

# How It Works

## 1. Upload

The user selects a meeting recording from the frontend.

The frontend sends the audio file to the Spring Boot backend:

```text
POST /api/meetings
```

The backend stores the uploaded audio and creates a meeting record.

The meeting initially receives a processing status such as:

```text
UPLOADED
```

---

## 2. Speech Transcription

The backend sends the meeting audio to **Azure Speech Services**.

After transcription completes, the transcript is stored in PostgreSQL.

The meeting status becomes:

```text
TRANSCRIBING
```

and then progresses to:

```text
SUMMARIZING
```

---

## 3. AI Analysis

The completed transcript is sent to Google Gemini with a structured prompt.

The model is instructed to return JSON containing:

```json
{
  "summary": "...",
  "keyDecisions": [],
  "actionItems": [],
  "risks": []
}
```

The structured result is stored by the backend.

---

## 4. Structured Summary

The generated result contains:

### Summary

A concise overview of the meeting.

### Key Decisions

Important decisions made during the meeting.

### Action Items

Each task contains:

```text
Task
Assignee
Deadline
Priority
```

The model is explicitly instructed **not to invent assignees or deadlines** when they are not present in the transcript.

### Risks

Potential risks or concerns discussed during the meeting.

---

# AI Prompt Design

The Gemini prompt is designed to produce predictable structured output rather than free-form text.

The model is instructed to return:

```json
{
  "summary": "2-4 sentence overview",
  "keyDecisions": [
    "decision 1"
  ],
  "actionItems": [
    {
      "task": "...",
      "assignee": null,
      "deadline": null,
      "priority": "HIGH"
    }
  ],
  "risks": [
    "risk 1"
  ]
}
```

Important prompt constraints include:

* Return only valid JSON
* Do not invent names
* Do not invent deadlines
* Return empty arrays when no information exists
* Use only `HIGH`, `MEDIUM`, or `LOW` priorities

This makes the LLM output easier for the backend and frontend to consume reliably.

---

# API Endpoints

## Meetings

### Get all meetings

```http
GET /api/meetings
```

### Get meeting

```http
GET /api/meetings/{id}
```

### Create/upload meeting

```http
POST /api/meetings
```

### Delete meeting

```http
DELETE /api/meetings/{id}
```

---

## Transcript

```http
GET /api/meetings/{id}/transcript
```

Returns the meeting transcript.

---

## Summary

```http
GET /api/meetings/{id}/summary
```

Returns the structured AI analysis:

```json
{
  "summary": "...",
  "keyDecisions": [],
  "actionItems": [],
  "risks": []
}
```

---

# Frontend

The frontend runs on:

```text
http://localhost:5173
```

The frontend communicates with the backend at:

```text
http://localhost:8080
```

The API base URL is configured using:

```text
VITE_API_BASE_URL
```

Example:

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

# Frontend Pages

## Dashboard

```text
/
```

Displays:

* Recent meetings
* Processing status
* Meeting date
* Duration
* Summary preview
* Action item count
* Decision count
* Risk count

---

## New Meeting

```text
/meetings/new
```

Allows users to:

* Select an audio file
* Upload the recording
* Monitor processing

---

## Meeting Details

```text
/meetings/{id}
```

Displays:

* Meeting information
* Processing timeline
* AI-generated summary
* Key decisions
* Action items
* Risks
* Complete transcript
* Download Summary
* Download Transcript
* Delete Meeting

---

# Processing States

The application supports the following processing states:

```text
UPLOADED
    ↓
TRANSCRIBING
    ↓
SUMMARIZING
    ↓
COMPLETED
```

If processing fails:

```text
FAILED
```

The frontend automatically polls the backend while the meeting is being processed.

Polling stops once the meeting reaches:

```text
COMPLETED
```

or:

```text
FAILED
```

---

# Running Locally

## Prerequisites

Install:

* Java 21+
* Maven
* Node.js
* npm
* PostgreSQL

Or use Docker, which is the recommended approach.

---

# Environment Variables

Create a local `.env` file using `.env.example`.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key

AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=your_azure_region

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket

POSTGRES_DB=meeting_summarizer
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

For the frontend:

```env
VITE_API_BASE_URL=http://localhost:8080
```

**Never commit real API keys, passwords, access keys, or other secrets to GitHub.**

---

# Running With Docker

The recommended way to run the complete application is Docker Compose.

From the project root:

```bash
docker compose up --build
```

This starts:

```text
Frontend  → http://localhost:5173
Backend   → http://localhost:8080
Postgres  → localhost:5432
```

Open:

```text
http://localhost:5173
```

---

# Stop the Application

```bash
docker compose down
```

To rebuild everything:

```bash
docker compose up --build
```

To see running containers:

```bash
docker compose ps
```

To view logs:

```bash
docker compose logs -f
```

Backend logs:

```bash
docker compose logs -f backend
```

Frontend logs:

```bash
docker compose logs -f frontend
```

---

# Running Without Docker

## Backend

Navigate to the backend:

```bash
cd backend
```

Run:

```bash
mvn spring-boot:run
```

Backend:

```text
http://localhost:8080
```

---

## Frontend

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# CORS

During local development, the backend allows requests from:

```text
http://localhost:5173
```

because the React frontend and Spring Boot backend run on different origins.

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8080
```

---

# Example Output

For a completed meeting, the application can produce a result similar to:

```json
{
  "summary": "The Council discussed the 2025 financial plan and debated concerns surrounding public engagement and property tax increases.",
  "keyDecisions": [
    "Adopted the special meeting agenda unanimously.",
    "Adopted the 2025 financial plan in a 3-2 vote."
  ],
  "actionItems": [],
  "risks": [
    "Public dissatisfaction due to increased property taxes.",
    "Resident frustration over limited public engagement."
  ]
}
```

The frontend converts this structured response into readable cards and sections rather than displaying raw JSON.

---

# Error Handling

The application handles:

* Invalid audio files
* Backend connection failures
* Transcription failures
* AI summarization failures
* Empty transcripts
* Missing action items
* Missing decisions
* Missing risks

When optional information is unavailable, the application displays a meaningful empty state instead of showing `null` or `undefined`.

---

# Security Considerations

* API credentials are supplied through environment variables.
* Secrets are not stored in source code.
* `.env` files containing credentials should not be committed.
* Database credentials are configurable through environment variables.
* Frontend `VITE_*` variables must never contain private API credentials because they are exposed to the browser.

#DemoVideo
https://drive.google.com/file/d/1lSYJXSxyix1bNl2mydaHUxs6FTnpYUzQ/view?usp=sharing


# Author

**Kanishka Agrawal**

Built as a meeting transcription and AI summarization project demonstrating:

* Backend API development
* Cloud speech-to-text integration
* LLM integration
* Structured AI output
* Database persistence
* React frontend development
* Docker containerization
