# Superhuman-Style Hackathon Implementation Plan

## Goal
Build a hyper-optimized Gmail and Google Calendar app using Next.js, Postgres, Vector DB, and Corsair. The goal is to achieve sub-second speeds, keyboard-first navigation (Cmd+K), and "Inbox Zero" AI triage workflows. Deadline: 6 days.

## Strategic Decision: Where to Start?

You asked: *"Should we focus on building the Cmd+K command palette... or should we start by setting up the Postgres/vector DB caching...?"*

**Recommendation:** We absolutely must start with the **Postgres / Vector DB Caching**. 

**Why?**
The entire Superhuman philosophy (instant UI, optimistic updates, lightning-fast Cmd+K search) falls apart without a fast data layer. If we build the UI first, we'll have to fake the speed and then painstakingly wire up the real data later. By building the real-time cache and vector database first, our Next.js frontend will be connecting to a genuinely sub-second data source from day one. 

## 6-Day Build Strategy

### Phase 1: The Data Engine (Days 1-2)
*Focus: Guaranteed sub-second speed.*
- Set up the Postgres schema using Drizzle ORM for `emails`, `events`, and `users`.
- Integrate `pgvector` for semantic search embeddings.
- Set up Corsair integrations (Gmail & Calendar API) and create Next.js API routes to sync initial data.
- Wire up Corsair webhooks via Ngrok so new emails/invites hit our DB instantly.

### Phase 2: AI Triage & The MCP Agent (Days 3-4)
*Focus: Inbox Zero & Contextual Intelligence.*

This phase is where the "Superhuman" magic happens. We will integrate OpenAI to act as your personal AI assistant that categorizes emails the millisecond they arrive and allows you to control your inbox with natural language.

#### Part A: The AI Triage (Inbox Split)
When Google pushes a new email to our webhook, the payload only tells us *that* an email arrived (it gives us the `messageId`), but it doesn't give us the actual text. Here is our pipeline:
1. **Intercept**: Inside `src/app/api/webhooks/route.ts`, when we detect a Gmail webhook, we will use the `gmail.messages.get` function from Corsair to instantly fetch the raw email body.
2. **Classify**: We will pass the email sender and body to OpenAI using structured outputs. We will prompt OpenAI to classify it as either `Important` (real humans/urgent), `Newsletter` (subscriptions), or `Other` (receipts/promos).
3. **Embed**: While we are calling OpenAI, we will simultaneously generate a vector embedding using `text-embedding-3-small`.
4. **Store**: We save the email text, the AI classification, and the vector embedding directly into your Postgres `emails` table via Drizzle. This completely powers the "Split Inbox" UI we will build in Phase 3.

#### Part B: The MCP Agent (Command Palette Brain)
Superhuman relies on keyboard shortcuts, but we are taking it a step further. We will build an AI agent that you can chat with to execute complex tasks.
1. **MCP Tools**: Corsair has a built-in package (`@corsair-dev/mcp`) that automatically converts all of your installed plugins (Gmail, Calendar) into standardized Model Context Protocol (MCP) tools.
2. **The Agent Route**: We will create a new API route (e.g., `src/app/api/agent/route.ts`) that takes a user prompt (e.g., *"Schedule a sync with Rajib for tomorrow at 2 PM and draft an email to him"*).
3. **Execution**: We pass the prompt and the Corsair MCP tools to an OpenAI Agent. The Agent will intelligently figure out that it needs to call the Calendar API to book the event and the Gmail API to draft the email, and it will execute them for you instantly.

### Phase 3: The 3-Column Workspace UI & AI Ghost-Typing
*Focus: Ruthless Minimalism, Real-Time AI Control, & Flagship Demo Flow.*

This phase transforms the app into a true "Superhuman + Agent" product. The UI skeleton is already built in `src/components/workspace`.

#### Part A: API Architecture Strategy
**Decision:** We will exclusively use **Next.js Server Actions** and **Next.js App Router API Routes**. 
**Why not tRPC?** We already built our complex backend (`/api/agent`, `/api/webhooks`) natively in Next.js. Next.js Server Actions integrate perfectly with our Drizzle ORM, allowing us to fetch database emails directly inside Server Components without writing *any* API boilerplate. Adding tRPC now would only burn valuable hackathon time for zero benefit.

#### Part B: The 3-Column Layout (`WorkspaceLayout.tsx`)
We will populate the beautiful glassmorphism layout you already scaffolded:
1. **Left (GmailPanel):** We will wire this to a Next.js Server Action to fetch categorized emails from our Drizzle `emails` table in real-time.
2. **Center (AgentChatPanel):** This is the brain. We will wire the chat input to send commands to our `/api/agent` route.
3. **Right (CalendarPanel):** Displays upcoming schedule.

#### Part C: The Flagship Demo Flow (The "Wow" Factor)
To prove the AI isn't just generating text, we will implement this exact sequence for the judges:
1. User types in the center: *"Schedule a meeting and draft an email to Rajib."*
2. **Ghost Typing:** The AI physically takes control of the Left (Gmail) column and types the email draft out character-by-character. (The input is disabled during typing to prevent race conditions).
3. **Human-in-the-Loop:** The AI finishes typing and makes the text editable. The user tweaks a word.
4. **Edit Detection:** The AI runs a simple diff against its snapshot, detects the change, and asks in the center chat: *"I see you changed the subject. Should I send it?"*
5. **Execution:** User clicks Approve. The email sends, and the event pops up on the Right (Calendar) column.

### Phase 4: Polish & Submission (Day 6)
*Focus: Winning.*
- Add keyboard shortcuts for every action (j/k for navigation, e for archive).
- Record the YC-style demo video.
- Final deploy and GitHub README polish.

## User Review Required

> [!IMPORTANT]
> Do you agree with starting on Phase 1 (Postgres/Vector DB) before tackling the UI? If yes, I will create `task.md` and begin setting up the Drizzle schema and `pgvector` extension for email caching.

## Open Questions

> [!WARNING]
> 1. Which Vector DB solution do you prefer? Since we're using Postgres, we can simply enable the `pgvector` extension. Is that acceptable, or did you have a dedicated Vector DB (like Pinecone/Weaviate) in mind?
> 2. For the "cheap LLM" used in priority filtering, should we default to Gemini Flash, or do you have another provider configured in mind?
