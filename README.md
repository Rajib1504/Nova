# 🌌 Nova AI — Your Neural Core for Workflow Automation

**Nova AI** is an intelligent, unified workspace designed to seamlessly orchestrate your digital communications and calendar logistics. Built for the Corsair Automation AI Hackathon, Nova combines a beautiful Superhuman-style interface with an advanced autonomous AI agent that drafts emails, schedules meetings, and organizes your life.

![Nova AI Workspace](public/logo.svg)

---

## ✨ Features

- **🧠 Autonomous Agent:** Powered by OpenAI (`gpt-4o-mini`) and Corsair MCP, Nova can read your emails, draft responses, and manage your calendar entirely through natural language chat.
- **⚡ Superhuman Navigation:** A fully keyboard-driven interface. Use `j`/`k` to navigate emails, `/` to search, `Ctrl+K` to command the AI, and `Enter` to dive into threads without ever touching your mouse.
- **👻 AI Ghost-Typing:** Watch the AI agent type out drafts directly into your floating compose window in real-time, waiting for your final review and confirmation.
- **🗓️ Smart Calendar Sync:** A beautiful, dynamic timeline view of your day and week, instantly synced with Google Calendar via background webhooks.
- **🎨 Glassmorphic Design:** A stunning dual-theme (Dark/Light mode) UI with circular reveal transitions, neumorphic elements, and micro-animations.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router), React 19
- **Database:** PostgreSQL (Neon) with `pgvector` for semantic search
- **ORM:** Drizzle ORM
- **AI & Integrations:** 
  - Corsair Platform (Gmail & Google Calendar Webhooks/OAuth)
  - `@corsair-dev/mcp` for Tool Calling
  - OpenAI API (`gpt-4o-mini` & `text-embedding-3-small`)
- **Styling:** Tailwind CSS, Framer Motion, Vanilla CSS Modules

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd nova-workflow-automation
pnpm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```env
# Database
DATABASE_URL="postgres://..."

# Corsair Configuration
CORSAIR_API_KEY="..."
CORSAIR_WEBHOOK_SECRET="..."

# Next Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
APP_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="..."
```

### 3. Database Migrations
Generate and push the Drizzle schema to your Postgres database:
```bash
pnpm db:generate
pnpm db:push
```

### 4. Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚠️ Important Note for Testers & Judges
Because Nova requests powerful scopes (`gmail.send`, `gmail.modify`) to perform actions on your behalf, our Google OAuth app is in **Unverified Production** status. 

When connecting your Google account, you will see a screen warning that **"Google hasn’t verified this app."**
1. Click **Advanced** at the bottom left.
2. Click **Go to nova.rajibdev.me (unsafe)**.
3. You will then be able to connect your account and use the app normally!

---

## 🏆 Built for the Corsair Automation AI Hackathon 2026
