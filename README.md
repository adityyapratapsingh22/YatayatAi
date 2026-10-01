# 🚦 YATAYAT AI 

![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)
![YOLOv8s](https://img.shields.io/badge/YOLOv8s-Fine--tuned%20(IDD)-purple?logo=yolo&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase%20Cloud-336791?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-black?logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Backend-Dockerized-2496ED?logo=docker&logoColor=white)
![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

**AI-powered traffic video analysis: detect, track, count, and classify vehicles, estimate real-time traffic density, and visualize it all on a live analytics dashboard — secured behind real, backend-enforced user authentication, with per-account configuration, profiles, downloadable PDF reports, and cross-session aggregate analytics.**

Built as a college mini project combining **Computer Vision**, **AI**, **Web Development**, and **Data Visualization**.

Deployed as a real cloud application: a Dockerized FastAPI backend on **Render** (with automatic GPU/CPU fallback for CPU-only hosting) and a static React build on **Vercel**, talking to a **Supabase PostgreSQL** database — not just a localhost demo.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [System Pipeline](#-system-pipeline)
- [Authentication](#-authentication)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Deployment](#️-deployment)
- [Application Pages](#️-application-pages)
- [Project Task Tracker](#-project-task-tracker)
- [Quality Assurance & Bug Fixes](#-quality-assurance--bug-fixes)
- [Dataset Notes](#-dataset-notes)
- [Known Limitations](#️-known-limitations)
- [License](#-license)

---

## 🧭 Overview

Traditional traffic monitoring relies on manual counting or expensive dedicated hardware (inductive loops, radar), neither of which scales or gives vehicle-type-level insight. **AI Traffic Analyzer** turns any uploaded video into structured traffic data using a pretrained YOLO model, tracks vehicles across frames to avoid double-counting, classifies them by type, estimates congestion, and streams the results to a web dashboard in real time — behind a real login system, with every session, setting, profile, report, and aggregate statistic tied to the account that owns it.

## ✨ Features

- 🚗 **Indian Traffic Vehicle Detection** — Fine-tuned YOLOv8s model detecting `car`, `truck`, `bus`, `motorcycle`, `autorickshaw`, and `bicycle`, with strict non-vehicle class filtering.
- 🎯 **Multi-Object Tracking** — ByteTrack assigns persistent tracking IDs across frames to track individual trajectories.
- 📏 **Intelligent Line-Crossing Counter** — Persistent side-tracking logic (`track_first_side`) that accurately registers vehicles even in slow crawl, heavy congestion, or momentary occlusions.
- 📐 **Live Visual Counting Line** — Dynamic dashed overlay on the dashboard video preview showing the exact line position configured in settings.
- 🌡️ **Density Estimation** — Real-time congestion status (Light / Moderate / Heavy) smoothed across rolling frame windows.
- ⚡ **Real-Time Streaming** — Live telemetry pushed to the browser over an authenticated WebSocket as inference runs at ~160 FPS on GPU, automatically downscaling resolution and skipping frames on CPU-only cloud hosting to stay fast and memory-safe.
- ☁️ **Cloud Database Persistence** — Fully migrated to **Supabase PostgreSQL**; all users, configurations, sessions, snapshots, and vehicle counts persist in the cloud.
- 🚀 **Cloud Deployment** — Dockerized FastAPI backend deployed on **Render**, with automatic CUDA/CPU device detection so the same codebase runs full-speed on a GPU or gracefully degrades on Render's free CPU tier. Frontend deployed as a static build on **Vercel**.
- 🔄 **Resilient Live Connection** — The dashboard's WebSocket auto-reconnects with backoff (~90s window) to ride out Render free-tier cold starts, pinging the backend awake first, with a "waking up" status banner and a dismissible error banner instead of a dead end.
- 📊 **Live Dashboard** — Video preview with counting line overlay, live stat cards, and smoothed density charts.
- 🔐 **Authentication** — Registration, login, JWT access + refresh tokens, and email-based password reset via Gmail SMTP.
- ⚙️ **Per-User Settings** — Customizable density thresholds, adjustable counting line position (10%–90%), smoothing window, and detection sensitivity.
- 📧 **Live Density Alerts** — Optional automated email notification sent the moment a session hits Heavy traffic density.
- 👤 **User Profiles** — Editable name/email, password change, real lifetime statistics, and profile photo upload.
- 📄 **PDF Reports** — Downloadable server-generated PDF report for completed sessions, featuring session metadata, embedded Matplotlib trend charts, and class breakdown tables.
- 📈 **Aggregate Analytics** — Cross-session analytics computed server-side via SQL aggregate queries.

- ## 🚀 Model Architecture & Benchmark Results
The system was upgraded from a stock nano baseline to a **custom fine-tuned YOLOv8s (11.1M parameters)** trained for **100 epochs** on **14,475 annotated images** from the **India Driving Dataset (IDD)**.
### Overall Benchmark Metrics
| Metric | Baseline (YOLOv8n - 50 ep, 3k img) | Fine-Tuned (YOLOv8s - 100 ep, 14.5k img) | Net Gain |
|---|---|---|---|
| **mAP@50** | `0.524` (52.4%) | **`0.704` (70.4%)** | **+18.0% 🚀** |
| **mAP@50-95** | `0.344` (34.4%) | **`0.490` (49.0%)** | **+14.6% 🚀** |
| **Precision** | `0.665` (66.5%) | **`0.845` (84.5%)** | **+18.0% 🎯** |
| **Recall** | `0.475` (47.5%) | **`0.624` (62.4%)** | **+14.9% 🔍** |

### Per-Class Accuracy (mAP@50)
| Vehicle Class | Baseline mAP@50 | Fine-Tuned mAP@50 | Gain |
|---|---|---|---|
| **Bus** | 58.5% | **78.2%** | **+19.7%** 🔥 |
| **Autorickshaw** | 61.3% | **77.9%** | **+16.6%** 🔥 |
| **Truck** | 50.7% | **74.0%** | **+23.3%** 🔥 |
| **Car** | 60.0% | **72.4%** | **+12.4%** 🔥 |
| **Motorcycle** | 58.6% | **71.6%** | **+13.0%** 🔥 |
| **Bicycle** | 25.4% | **48.4%** | **+23.0%** 🔥 |

### Inference Latency (NVIDIA RTX 3050 Laptop GPU)
- **Preprocess:** `0.2 ms` | **Inference:** `3.7 ms` | **Postprocess:** `2.2 ms`
- **Total Latency:** **~6.1 ms per frame (~160 FPS real-time throughput)**
---

## 🛠️ Tech Stack
| Layer | Technology |
|---|---|
| 🧠 Computer Vision | Fine-tuned Ultralytics YOLOv8s (`models/indian_vehicles.pt`) + OpenCV |
| 🎯 Tracking | ByteTrack (`bytetrack.yaml`) with persistent side-crossing state |
| ⚙️ Backend | Python 3.12, FastAPI, WebSockets, Uvicorn |
| 🗄️ Cloud Database | **Supabase PostgreSQL** via SQLAlchemy ORM & `psycopg2-binary` (Session/Transaction Pooler) |
| 🔐 Auth & Security | JWT (access + refresh tokens), bcrypt password hashing, Gmail SMTP |
| 📄 Reporting | ReportLab (PDF layout) + Matplotlib (chart rendering) |
| 📈 Analytics | SQLAlchemy aggregate queries (`func.count`, `func.sum`, `func.coalesce`) |
| 🎨 Frontend | React, TypeScript, Vite, Tailwind CSS v4, Lucide Icons |
| 🖼️ File Storage | Local storage for uploads/avatars + Supabase Cloud for relational data |
| 🐳 Containerization | Docker (slim Python 3.12 image, CPU-only PyTorch build to keep image size down) |
| ☁️ Hosting | Backend on **Render** (Docker), Frontend on **Vercel** (static build + SPA rewrites) |
---

## 🔄 System Pipeline

```mermaid
flowchart TD
    A[🎥 Video Input] --> A2{GPU available?}
    A2 -->|Yes| B[🧠 Fine-Tuned YOLOv8s Model - IDD Trained]
    A2 -->|No - e.g. Render free tier| A3[📉 Downscale to 960px + skip every 2nd frame]
    A3 --> B
    B --> B2[🚫 Strict Vehicle Class Filter]
    B2 --> C[🎯 Object Tracking - ByteTrack]
    C --> D[📏 Counting and Classification]
    D --> E[🌡️ Density Estimation]
    E --> F[⚡ Authenticated WebSocket Streaming]
    F --> G[📊 Live Dashboard]
    F --> H[🗄️ Supabase PostgreSQL Persistence, per user]
    F --> J[📧 Heavy-density email alert, if enabled]
    H --> I[📜 History and Trends]
    H --> L[📄 On-demand PDF Report]
    H --> M[📈 Aggregate Analytics across all sessions]
    K[⚙️ Per-User Settings] --> E
    K --> D
```

## 🔐 Authentication

Every session is tied to a real, backend-verified account — not just a UI login screen.

```mermaid
flowchart LR
    A[Register] --> B[bcrypt-hashed password stored]
    B --> C[Login]
    C --> D[JWT Access Token - 30 min]
    C --> E[JWT Refresh Token - 7 days]
    D --> F[Protected API routes and WebSocket]
    E -->|expired access token| D
    G[Forgot Password] --> H[Single-use reset token]
    H --> I[Emailed via Gmail SMTP]
    I --> J[Reset Password]
    J --> B
```

- Passwords are hashed with **bcrypt**, never stored or logged in plain text.
- Access tokens expire in 30 minutes; a shared `httpClient` used by every API service file automatically refreshes them using the longer-lived refresh token, so an active user is never unexpectedly logged out mid-session — including on the Profile page, where this previously did not work correctly (see Quality Assurance section).
- Password reset links are single-use, expire after 30 minutes, and are sent via real email (Gmail SMTP), not just simulated.
- All video upload, analytics streaming, session-history, report, and analytics endpoints require a valid token — every user only ever sees their **own** analysis history, settings, profile, reports, and aggregate stats.

## 📁 Project Structure

```
AI_Traffic_Analyzer/
├── backend/
│   ├── .env                        # SECRET_KEY, DATABASE_URL, SMTP credentials (never committed)
│   ├── Dockerfile                  # CPU-only PyTorch build, used for Render deployment
│   ├── requirements.txt            # Pinned deps, incl. lap==0.5.13 (YOLO autoinstall disabled)
│   └── app/
│       ├── main.py                 # FastAPI app, routes, authenticated WebSocket, PDF endpoint
│       ├── api/
│       │   ├── auth_router.py      # register / login / refresh / forgot / reset / profile / avatar
│       │   ├── settings_router.py  # GET/PUT per-user pipeline settings
│       │   └── analytics_router.py # GET aggregate stats across all of a user's sessions
│       ├── schemas/
│       │   ├── auth_schemas.py     # Auth + profile request/response models
│       │   ├── settings_schemas.py # Settings request/response models
│       │   └── analytics_schemas.py# Analytics summary response models
│       └── core/
│           ├── pipeline.py         # Detection + tracking + counting + density; auto CUDA/CPU device select
│           ├── database.py         # SQLAlchemy engine/session setup (normalizes postgresql+psycopg2://)
│           ├── db_models.py        # User, UserSettings, Session, FrameSnapshot, VehicleCount
│           ├── security.py         # bcrypt hashing, JWT creation/verification
│           ├── dependencies.py     # get_current_user route guard
│           ├── email_service.py    # SMTP password-reset + density-alert emails
│           ├── report_generator.py # PDF report generation (ReportLab + Matplotlib)
│           └── config.py           # env-based settings, shared directory constants
├── frontend/
│   ├── vercel.json                  # SPA rewrite rules for Vercel static hosting
│   └── src/
│       ├── App.tsx                 # Root app shell, auth-aware routing
│       ├── contexts/
│       │   └── AuthContext.tsx     # Global auth state, session restore, profile/avatar updates
│       ├── hooks/
│       │   └── useAnalyticsSocket.ts
│       ├── services/
│       │   ├── httpClient.ts       # Single shared authFetch + token-refresh implementation
│       │   ├── api.ts              # Session, upload, and PDF download calls
│       │   ├── authApi.ts          # Auth, profile, password, avatar calls
│       │   ├── settingsApi.ts      # Settings GET/PUT calls
│       │   ├── analyticsApi.ts     # Aggregate analytics summary call
│       │   └── tokenStorage.ts     # Token persistence
│       └── components/
│           ├── LandingView.tsx
│           ├── LoginView.tsx
│           ├── RegisterView.tsx
│           ├── ForgotPasswordView.tsx
│           ├── ResetPasswordView.tsx
│           ├── DashboardView.tsx
│           ├── ReportsView.tsx      # Real session list + PDF download
│           ├── HistoryView.tsx      # Real archive: search, density filter, CSV + PDF export
│           ├── AnalyticsView.tsx    # Real cross-session aggregate insights
│           ├── SettingsView.tsx     # Real, backend-connected pipeline settings
│           ├── ProfileView.tsx      # Real editing, password change, stats, photo upload
│           ├── AboutView.tsx
│           └── UploadModal.tsx
├── database/                       # Local DB tooling/migrations folder (production data lives in Supabase PostgreSQL)
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) (for password reset and density alert emails)
- A [Supabase](https://supabase.com) project (free tier) for the PostgreSQL database, or any PostgreSQL connection string
- (Optional) NVIDIA GPU + CUDA for faster inference — otherwise the pipeline auto-detects and runs on CPU

### Clone the repository
```bash
git clone https://github.com/adityyapratapsingh22/YatayatAi.git
cd YatayatAi
```

### Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\Activate.ps1       # Windows PowerShell
# source venv/bin/activate      # Linux / macOS

pip install -r requirements.txt
# GPU machines: optionally reinstall torch/torchvision with CUDA wheels afterward for full-speed inference;
# the pinned requirements.txt installs CPU-only PyTorch by default (matches the Docker/Render build).

# Configure your environment variables
copy .env.example .env          # Windows
# cp .env.example .env          # Linux / macOS
# Fill in SECRET_KEY, SMTP_*, and DATABASE_URL (your Supabase PostgreSQL connection string)
```

### Frontend setup
```bash
cd frontend
npm install

# Create a .env file:
# VITE_API_BASE_URL=http://localhost:8000
# VITE_WS_BASE_URL=ws://localhost:8000/ws/analytics   # optional — auto-derived from VITE_API_BASE_URL if omitted

npm run dev
```

Open **http://localhost:3000** with the backend running at **http://localhost:8000**. Register a new account to get started — all analysis features require being signed in.

## ☁️ Deployment

The app runs as two separately deployed services talking to a shared Supabase PostgreSQL database — no server to manage by hand.

| Service | Platform | Notes |
|---|---|---|
| Backend (FastAPI + YOLO) | **Render** | Built from `backend/Dockerfile`; CPU-only PyTorch wheels keep the image small and buildable on Render's free tier. |
| Frontend (React build) | **Vercel** | Static build; `frontend/vercel.json` adds SPA rewrites so client-side routes don't 404 on refresh. |
| Database | **Supabase PostgreSQL** | Session/transaction pooler connection string, shared by both environments. |

**Backend environment variables (Render):**
- `DATABASE_URL` — Supabase connection string. Accepts `postgres://` or `postgresql://`; the app normalizes either to `postgresql+psycopg2://` so SQLAlchemy 2.x doesn't try to load `psycopg` v3 instead of the installed `psycopg2-binary`.
- `FRONTEND_URL` — your Vercel URL, added to the CORS allow-list alongside an `allow_origin_regex` for any `*.vercel.app` preview deployment.
- `SECRET_KEY`, `SMTP_*` — same as local setup.

**Frontend environment variables (Vercel):**
- `VITE_API_BASE_URL` — your Render backend URL. `VITE_WS_BASE_URL` can be left unset; it's derived automatically (`http`→`ws`, `https`→`wss`).

**CPU-only free-tier behavior:**
- `pipeline.py` auto-detects `torch.cuda.is_available()` and falls back to CPU with no config needed.
- On CPU, video is downscaled to a max width of 960px and every 2nd frame is skipped (`vid_stride=2`) to stay within Render's 512MB free-tier memory limit, with a periodic `gc.collect()` pass.
- YOLO inference now runs inside a `ThreadPoolExecutor`, bridged to the WebSocket via an `asyncio.Queue`, so the event loop stays responsive to Render's health-check pings instead of blocking during analysis.
- Ultralytics' runtime auto-install is disabled (`YOLO_AUTOINSTALL=False`) and `lap==0.5.13` is pinned in `requirements.txt`, since an on-the-fly dependency install previously crashed the pipeline on Render.

**Cold-start handling:** Render's free tier spins the backend down after inactivity and can take up to ~60–90 seconds to wake. The dashboard pings the backend's root endpoint first, then opens the WebSocket with automatic retries (backoff up to ~90s total) and shows a "waking up" status banner instead of a dead connection.

## 🖥️ Application Pages

| Page | Purpose | Status |
|---|---|---|
| 🏠 Landing | Marketing/intro page explaining the project | ✅ Live |
| 🔐 Login/Register | Authentication backed by Supabase PostgreSQL | ✅ Live |
| 🔑 Forgot Password | Request a real emailed reset link | ✅ Live |
| 🔓 Reset Password | Set a new password via the emailed token | ✅ Live |
| 📊 Dashboard | Live analysis — upload a video and watch real-time detection, tracking, and density stats | ✅ Live |
| 📄 Reports | Real session list with genuine, downloadable PDF reports | ✅ Live |
| 📜 History | Searchable, filterable archive of real sessions, with CSV and PDF export per session | ✅ Live |
| 📈 Analytics | Aggregate insights across your entire session history | ✅ Live |
| ⚙️ Settings | Configure density thresholds, counting line, smoothing, and detection sensitivity — saved per account | ✅ Live |
| 👤 Profile | Edit name/email, change password, real lifetime stats, upload a profile photo | ✅ Live |
| ℹ️ About | Project explanation, pipeline diagram, and tech stack credits | ✅ Live |

---

## ✅ Project Task Tracker

### Phase 1–5: Computer Vision Pipeline
| Task | Status |
|---|---|
| Vehicle detection (YOLOv8s) | ✅ Done |
| Fine-tune YOLOv8s on Indian Driving Dataset (14.5k images) | ✅ Done |
| Train full 100 epochs with close-mosaic optimization (70.4% mAP@50) | ✅ Done |
| Multi-object tracking (ByteTrack) | ✅ Done |
| ID-switch / class-flicker noise filtering | ✅ Done |
| Line-crossing vehicle counting | ✅ Done |
| Traffic density estimation | ✅ Done |
| Vehicle-only class filtering (excludes pedestrians etc.) | ✅ Done |

### Phase 6–7: Backend
| Task | Status |
|---|---|
| FastAPI backend with `/api/upload` | ✅ Done |
| Live WebSocket analytics streaming | ✅ Done |
| Cloud persistence via Supabase PostgreSQL (sessions, snapshots, counts) | ✅ Done |
| Session history REST endpoints | ✅ Done |
| User registration & login (bcrypt + JWT) | ✅ Done |
| JWT access + refresh token flow | ✅ Done |
| Forgot / reset password via real email | ✅ Done |
| Per-user session ownership (sessions scoped to account) | ✅ Done |
| Authenticated WebSocket (token-verified handshake) | ✅ Done |
| Per-user settings stored and actually driving the pipeline | ✅ Done |
| Real-time YOLO confidence tuning (detection sensitivity) | ✅ Done |
| Heavy-density email alerts | ✅ Done |
| Profile editing (name/email) endpoint | ✅ Done |
| Secure password change (current-password verified) | ✅ Done |
| Real lifetime stats (videos analyzed, vehicles counted) | ✅ Done |
| Profile photo upload + static serving | ✅ Done |
| Server-generated PDF reports (chart + tables) | ✅ Done |
| Aggregate analytics endpoint (SQL GROUP BY across sessions) | ✅ Done |
| WebSocket error handling (clean failure messages, server-side logging) | ✅ Done |

### Phase 8: Frontend
| Task | Status |
|---|---|
| Live Analysis dashboard wired to real data | ✅ Done |
| Video preview panel | ✅ Done |
| Real-time trend + class-breakdown charts | ✅ Done |
| History page wired to real sessions (search, filter, CSV/PDF export) | ✅ Done |
| Landing / About pages (UI) | ✅ Done |
| Login page (real, functional) | ✅ Done |
| Register page (real, functional) | ✅ Done |
| Forgot / Reset Password pages (real, functional) | ✅ Done |
| Auto token refresh on expiry (consistent across all pages) | ✅ Done |
| Protected routes (redirect unauthenticated users) | ✅ Done |
| Settings page (functional, saved to backend) | ✅ Done |
| Profile page (editable, saved to backend, correct photo cache-busting) | ✅ Done |
| Profile photo upload UI | ✅ Done |
| Reports page with real PDF export | ✅ Done |
| Analytics page (real, distinct from Reports) | ✅ Done |

### Deployment & Extras
| Task | Status |
|---|---|
| Docker packaging (CPU-only PyTorch image) | ✅ Done |
| Backend deployed on Render | ✅ Done |
| Frontend deployed on Vercel (SPA rewrites configured) | ✅ Done |
| Automatic CUDA/CPU device detection in the pipeline | ✅ Done |
| CPU-tier performance tuning (resolution cap, frame skip, GC) | ✅ Done |
| Pipeline moved off the event loop (ThreadPoolExecutor + asyncio.Queue) | ✅ Done |
| WebSocket auto-retry with backoff for cold starts | ✅ Done |

---

## 🔧 Quality Assurance & Bug Fixes

A deliberate audit pass was done before deployment work began, plus one bug caught via independent third-party review (ChatGPT was asked to compare a generated report against the source video). Documented here for transparency:

| Issue | Severity | Fix |
|---|---|---|
| **Pedestrians counted as vehicles** — YOLO's default model detects 80 COCO classes, not just vehicles. `person`, `stop sign`, and every other non-vehicle class were being tracked and counted alongside real vehicles, inflating every count. | 🔴 Critical | Added an explicit `VEHICLE_CLASSES` allowlist in `pipeline.py`; only `car`, `truck`, `bus`, `motorcycle`, `bicycle` are now tracked or counted. |
| Token auto-refresh was inconsistent — implemented in 3 of 4 API service files, missing from `authApi.ts` (Profile/password/avatar calls) | 🟠 Bug | Centralized all token-refresh logic into one shared `httpClient.ts`, used by every service file identically. |
| Profile photo could show stale cached image after re-upload | 🟡 Bug | Added an `avatarVersion` counter that busts the image cache on every successful upload. |
| A pipeline crash mid-analysis (corrupt file, model error) failed silently with no message to the user | 🟠 Robustness | WebSocket handler now catches unexpected exceptions, logs them server-side, and sends a clean error message to the client. |
| A failed density-alert email (bad SMTP credentials) would fail silently with no record | 🟡 Robustness | Wrapped in a logged, error-handled function instead of a bare fire-and-forget task. |
| Fake "Deploy Model" button/modal (fictional edge-deployment simulation) | 🟢 Cleanup | Removed entirely. |
| Fake hardcoded notification alerts | 🟢 Cleanup | Replaced with an honest empty state. |
| Non-functional "Search Nodes" search bar | 🟢 Cleanup | Removed. |
| Duplicate `AVATAR_DIR` constant defined in two files | 🟢 Cleanup | Consolidated into one shared setting in `config.py`. |
| SQLAlchemy 2.x loaded `psycopg` v3 instead of the installed `psycopg2-binary` on a bare `postgresql://` URL | 🔴 Critical | `database.py` now normalizes `postgres://`/`postgresql://` to `postgresql+psycopg2://` before creating the engine, and adds `pool_pre_ping=True`. |
| Blocking YOLO inference ran directly on the asyncio event loop, starving Render's HTTP health-check requests and risking the dyno being killed mid-analysis | 🔴 Critical | Pipeline now runs in a `ThreadPoolExecutor`, bridged to the WebSocket sender via an `asyncio.Queue`, keeping the event loop free. |
| Full-resolution CPU inference could exhaust memory and crash on Render's 512MB free tier | 🟠 Bug | Capped processing width to 960px and added frame-skipping (`vid_stride=2`) plus periodic `gc.collect()` when running on CPU. |
| Ultralytics' runtime auto-install of the `lap` dependency failed or crashed mid-pipeline on Render | 🟠 Bug | Pinned `lap==0.5.13` in `requirements.txt` and set `YOLO_AUTOINSTALL=False`. |
| WebSocket failed immediately (no retry) on Render's cold start, leaving the dashboard stuck on a generic error | 🟠 Bug | Added an HTTP pre-ping to wake the backend, then automatic WebSocket reconnect with backoff (~90s window) and a visible "waking up" status banner. |
| Upload failure message hardcoded a `localhost:8000` reference even in production | 🟢 Cleanup | Removed the hardcoded URL from the error message. |

**Note:** the vehicle-classification fix only affects analyses run *after* the fix — any session recorded before it may have inflated counts from nearby pedestrians. Clearing the database for a fresh start is recommended before any formal accuracy evaluation.

## 📊 Dataset Notes

Detection uses YOLO pretrained on COCO out of the box — no training required to get started, since it already covers `car`, `truck`, `bus`, `motorcycle`, and `bicycle`. For improved accuracy on regional traffic (e.g. auto-rickshaws, mixed lane discipline), fine-tuning on **IDD (India Driving Dataset)** or **UA-DETRAC** is recommended.

## ⚠️ Known Limitations

- Vehicle classification can flicker between similar classes (e.g. truck vs. bus) on lightweight models like `yolov8n` — resolved for counting purposes via majority-vote classification per track ID.
- ByteTrack can occasionally lose and re-acquire a vehicle mid-frame ("ID switch"), which the line-crossing counter naturally filters out in most cases.
- No formal accuracy evaluation has been performed (no mAP/precision-recall against a labeled ground-truth set) — accuracy claims are based on manual observation and testing, not benchmarked metrics.
- PDF reports can only be generated for sessions that have finished processing (`ended_at` is set) — an in-progress session's report button is disabled by design.
- Password reset and density-alert emails require a real Gmail App Password to be configured — without it, those flows fail at the email-sending step.
- Profile photos are stored on local disk, not cloud storage — fine for a single-instance deployment, but wouldn't survive a container redeploy without a persistent volume.
- On Render's free tier, the backend spins down after inactivity and can take ~60–90 seconds to cold-start; the frontend retries automatically and shows a status banner, but the first analysis after idle time will be slower to connect.
- Cloud (CPU-only) inference runs at a capped 960px width with every 2nd frame skipped to fit Render's 512MB memory limit — detection accuracy and smoothness are slightly reduced versus a local GPU run.

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

**Author:** Aditya Pratap Singh · [@adityyapratapsingh22](https://github.com/adityyapratapsingh22)
