# Corsair Hackathon Context

## Objective
Build a hyper-optimized, Superhuman-style Gmail and Google Calendar workflow app. The ultimate goal is to win the hackathon by removing every ounce of friction from reading, organizing, and sending emails. Deadline: 6 days.

## Core Superhuman Philosophy (Our Blueprint)
1. **Ruthless Minimalism (UI/UX)**: A clean, modern canvas stripped of complex menus, sidebars, and widgets. Rely on high-quality typography, precise whitespace, and a monochromatic palette to reduce cognitive load. Hide the complexity.
2. **Keyboard-First Architecture (Zero Mouse)**: Every single action can be executed via keyboard shortcuts. The core interaction is driven by a `Cmd+K` (or `Ctrl+K`) Command Palette (e.g., "Snooze until tomorrow", "Create invite").
3. **Sub-Second Speed via Backend Caching**: The UI feels instantaneous because it never waits for network requests (optimistic UI). Local indexing of emails in Postgres + a Vector DB ensures search and retrieval happen in < 1 second.
4. **"Inbox Zero" Triage Workflow**: Treat the inbox like a to-do list. Implement "Auto-Advance" after archiving/snoozing. Use a lightweight LLM to auto-categorize emails (Split Inbox) to focus on high-priority items.
5. **Contextual Intelligence**: Use the Corsair MCP agent chat to allow users to type natural language commands. The agent handles complex, multi-step workflows like drafting an email and securing a calendar invite simultaneously.

## Core Tech Stack
- Next.js (Frontend & API)
- Postgres + Vector DB (Local Caching & Semantic Search)
- Corsair (Gmail & Calendar Integrations, MCP Agent, Webhooks)
- Ngrok (optional, for webhooks testing)

## Mandatory Requirements
- **Gmail & Google Calendar Integrations**: Must be routed through Corsair.
- **Meaningful Workflow Improvement**: Must go beyond a basic UI clone.
- **No Hardcoded Data**: Real API data only.
- **Submission**: Open source on GitHub, live deployed link, and a YC-style demo video.

## Bonus Tasks (High Value)
- Agent Chat (Corsair MCP)
- Realtime Webhooks
- AI Priority Filtering
- Keyboard Shortcuts / Command Palette
- Corsair Search API & Fast Local Search
