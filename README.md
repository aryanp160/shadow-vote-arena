# ⚔️ SHADOW VOTE ARENA

> **LET THE INTERNET DECIDE YOUR FATE. NO ACCOUNTABILITY. NO TAKEBACKS.**

Welcome to the **Shadow Vote Arena** (formerly *Anonymous War Room*), a chaotic, real-time battleground where strangers anonymously vote on your life decisions and argue about it in live comment sections.

Drop your wildest personal dilemmas into the arena:
* *"Should I text my ex at 3 AM?"*
* *"Should I quit my corporate job to breed Alpacas?"*
* *"Should I dump my savings into a meme coin?"*

...and let the internet pull the trigger.

---

## ⚡ The Philosophy

1. **Strangers Control Your Life**: Submit a question, start the timer, and accept the majority's judgment.
2. **Infinite Chaos**: Live comment sections per question allow absolute chaos. React (👍/👎) to comments in real time.
3. **Ghost Protocol**: Every battle, comment, and vote is vaporized from existence after **15 days** automatically.

---

## 🛠️ The Stack (Battle-Tested)

* **Frontend**: React 18 + TypeScript + Vite
* **Styling**: Tailwind CSS + shadcn/ui (Sleek dark mode, cyberpunk aesthetics, and smooth animations)
* **Real-time Engine**: Firebase Firestore (Listeners via `onSnapshot` for instantaneous state updates)
* **Authentication**: Firebase Anonymous Auth (No emails, no passwords, immediate entry)

---

## 🏛️ Scalability Architecture

This app has been refactored to handle viral traffic and heavy debate without breaking:
* **Subcollection Architecture**: Real-time comments (`/questions/{id}/messages`) and votes (`/questions/{id}/votes`) are stored in isolated Firestore subcollections. This prevents document size limit crashes (1MB) and eliminates write race conditions.
* **Smart Rate Limiting & Deduplication**: Voting is locked using atomic subcollection checkouts (`/votes/{userId}`). One user = one vote, with choices persisted and visually highlighted in the UI.
* **On-Demand Subscriptions**: Front-end comment listeners only boot up when you expand the battle comments drawer, reducing read costs and browser load.
* **Scalable Search**: Search matches are capped at the top 100 most recent questions to ensure lightning-fast client filtering without reading the entire database.
* **Recursive Auto-Purge**: The 15-day cleanup routine recursively sweeps subcollections (messages, reactions, votes) alongside parent battle documents to keep Firestore clean and lightweight.

---

## 🚀 How to Run Locally

### 1. Clone & Setup
```bash
git clone https://github.com/yourusername/shadow-vote-arena.git
cd shadow-vote-arena
```

### 2. Install Dependencies
```bash
# Using bun (recommended)
bun install

# Or using npm
npm install
```

### 3. Setup Firebase Config
Create a `.env` or configure your Firebase config keys in `@/lib/firebase.ts`.

### 4. Run the Dev Server
```bash
# Using bun
bun run dev

# Or using npm
npm run dev
```

---

## 🌐 Live Arena

Join the chaos here: [https://shadow-vote-arena.vercel.app/](https://shadow-vote-arena.vercel.app/)
