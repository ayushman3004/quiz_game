# QuizArena — Production Cross-Platform Multiplayer Quiz Platform

An esports-inspired, real-time multiplayer academic & competitive quiz platform for **Android and iOS (Flutter)** backed by a **Node.js + TypeScript + Express + Socket.IO + MongoDB + Redis** backend with a Web Admin Moderation Console.

---

## Architecture Overview

```text
/quizApp
├── /mobile              # Flutter (Android & iOS)
│   ├── lib/core         # Material 3 esports theme, Dio HTTP, Socket.IO, Storage
│   ├── lib/features     # Auth, Home, Journey, Compete, QuizEngine, GovtArena, Creator, Social, Profile
│   └── lib/router       # GoRouter with ShellRoute and overlay navigation
│
├── /backend             # Node.js + TypeScript + Express + Socket.IO
│   ├── src/config       # Env (Zod validation), MongoDB, Redis (live + mock fallback)
│   ├── src/models       # Mongoose schemas (User, Quiz, Question, Match, MatchResult, etc.)
│   ├── src/sockets      # Real-time anti-cheat game engine, room manager, server ticks
│   ├── src/services     # Server-side scoring (speed + streak bonuses), matchmaking queue, Gemini AI
│   └── src/controllers  # Auth, User, Quiz, GovtExams, Social, AI, Admin
│
├── /admin               # React + Vite + TypeScript Admin Moderation Console
│   └── src              # User management, quiz approval, live telemetry
│
└── docker-compose.yml   # Orchestration for MongoDB, Redis, and Backend
```

---

## Key Features

1. **Anti-Cheat Server-Authoritative Engine**:
   - Server controls all clocks (`qStartedAt`, `qEndsAt`).
   - Answer correctness is evaluated server-side.
   - Scoring combines:
     - Base Points: 100
     - Speed Bonus: up to 50 pts (linear scale based on remaining time)
     - Streak Bonus: up to 25 pts (5 pts per consecutive correct answer)
   - Live leaderboards recalculated and broadcast to all participants after every question.
2. **Multiplayer Matchmaking & Private Rooms**:
   - Redis-backed matchmaking queue by category and difficulty.
   - Private rooms with short 6-character room codes (e.g. `QZ8K2`).
   - Disconnection grace period (30 seconds) with full match state resumption.
3. **Govt Job Arena & Journey Learning Progression**:
   - Dedicated test series for GATE, SSC CGL, UPSC, Banking, and Railways.
   - Visual progress tree (Exam → Subject → Topic → Solo Drill).
4. **Quiz Creator & Gemini AI Generator**:
   - In-app wizard to author custom quizzes with 4 options and explanations.
   - Google Gemini generative AI service to generate high-yield quizzes on any topic.
5. **Gamification & Social**:
   - Streaks (daily checks & match play), XP levels, Coins, and ELO rating.
   - Friends list, 1v1 challenges, clubs hub, and global/weekly leaderboards.
6. **Web Admin Dashboard**:
   - Telemetry overview, user moderation (banning/unbanning), quiz review and approval.

---

## Quick Start Guide

### 1. Run the Backend & Databases

Using Docker Compose:
```bash
docker compose up -d
```

Or run locally:
```bash
# Start backend
cd backend
npm install
npm run dev
# Server starts at http://localhost:5001
```

### 2. Run the Flutter Mobile App (Android / iOS / macOS / Web)

```bash
cd mobile
flutter pub get
flutter run
```

### 3. Run the Admin Dashboard

```bash
cd admin
npm install
npm run dev
# Dashboard available at http://localhost:3000
```

---

## Testing & Verification

- **Backend Tests**:
  ```bash
  cd backend
  npm test
  ```
  Runs Jest tests for scoring formulas, streak calculations, and ELO delta rules.

- **Flutter Tests**:
  ```bash
  cd mobile
  flutter test
  ```
  Runs unit and widget tests for models, accuracy formulas, and UI widgets.
