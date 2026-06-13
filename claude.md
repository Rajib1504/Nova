# Nova - Design System Reference (claude.md)

This document serves as the absolute source of truth for the Nova design pattern, merging the premium glassmorphic background feel with tactile neumorphic components.

## 1. Core Aesthetic: "Glass-Neumorphism"

- **Backgrounds:** Use glassmorphism (frosted blur, backdrop-blur-xl) to create depth over the animated background elements.
- **Components/Cards:** Use **Neumorphism (Soft UI)**. Elements use subtle dual shadows (light shadow top-left, dark shadow bottom-right) matching the background color, creating an extruded/embossed tactile feel.
- **Micro-interactions:** Buttons have a soft press-down neumorphic effect (inset shadow) on click, coupled with a framer-motion ripple effect.

## 2. Color Palette

### Light Mode

- **Background Base:** `#FFF5E4` (warm cream)
- **Panel/Section Backgrounds:** `#FFE3E1` (soft pink) with `backdrop-blur-xl`.
- **Card Backgrounds (Neumorphic):** `#FFE3E1` (matching panel for seamless extrusion) or `#FFF5E4`.
- **Primary Accent/CTA:** `#FF9494` (coral red)
- **Hover/Active Highlight:** `#FFD1D1` (light coral)
- **Text:** `#2D2A26` (dark charcoal)
- **Neumorphic Shadows (Light):** Top-left white/light shadow, bottom-right dark/tinted shadow.

### Dark Mode

- **Background Base:** `#1A1D23` (deep charcoal)
- **Panel/Section Backgrounds:** `rgba(35,35,42,0.5)` with `backdrop-blur-xl`.
- **Card Backgrounds (Neumorphic):** `#22262E` (slightly lighter charcoal).
- **Accent:** `#FF9494` (used with soft glows).
- **Text:** `#F0EEEC` (off-white).
- **Neumorphic Shadows (Dark):** Subtle top-left glow (lighter gray), bottom-right deep shadow (`#0d0f12`).

## 3. Typography

- **Headings:** Plus Jakarta Sans (bold/semi-bold, tight letter spacing).
- **Body & UI:** Inter (regular, comfortable line-height).

## 4. Key Animations (Framer Motion)

- **Real-Time Rendering & Scrollytelling:** Implement dynamic scroll-based animations where elements (like the Navbar and features) react fluidly to the user's scroll position.
- **Expressive Typography Animations:** Add thoughtful micro-interactions to text, such as animated underlines, staggered letter reveals, and hover-state transformations.
- **Ambient Background Motion:** Ensure top-level background elements (like the soft gradient blobs/orbs) animate slowly and continuously, creating a living, breathing feel to the UI.
- **Custom Cursor:** Soft circular coral blur that smoothly follows mouse movement with elastic easing and scales up on interactive elements.
- **Scroll Reveal Animations:** Sections fade up and stagger into view.
- **Theme Toggle:** Circular wipe transition expanding from the toggle position.
- **Panel Resizing:** Smooth 300ms ease width adjustments for the 3-column dashboard layout.

## 5. Technology Stack

- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS, Shadcn UI
- **Animations:** Framer Motion

## 6. Copywriting & Vocabulary (Advanced SaaS Aesthetic)

- **Terminology:** Avoid generic or basic phrasing (e.g., "Search", "Ready", "Inbox", "Messages", "Plans"). Use advanced, technical, and strategic SaaS terminology (e.g., "Query Workspace", "Authorize Deployment", "Telemetry", "Synthesis", "Orchestrate", "Protocol").
- **Tone:** Confident, autonomous, highly intelligent, and premium. The product should sound like an advanced neural engine, not just a standard app.
- **Rule:** This vocabulary rule applies globally to all UI elements, placeholders, headings, badges, and dummy content across the entire website.
