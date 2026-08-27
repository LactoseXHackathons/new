# LUNARC GENIX Assistant

Build a modern, ChatGPT-style Agentic AI Chatbot web app called "AdmitAI" (or similar) — a College Admission Assistant for students.

Design priority: clean, minimal, finely detailed, trustworthy — students should feel this is a reliable official source, not a toy demo.

LAYOUT

- Left sidebar (collapsible): "New Chat" button, past conversation list, quick-access shortcuts (Courses, Eligibility Checker, Fees, Documents, Admission Timeline), logo/app name top, settings icon bottom.

- Main panel: centered chat column (max-width ~760px), assistant messages left-aligned with agent avatar, user messages right-aligned.

- Sticky bottom input bar: rounded pill textarea, auto-grow, send button, attach icon (for uploading marksheets/documents), mic icon optional.

- Top bar: "AdmitAI — Admission Assistant" + green "Agent Online" status dot, dark/light toggle.

VISUAL STYLE

- Light, welcoming, campus-friendly theme by default (soft white/off-white background) with a dark mode toggle.

- Accent color: deep blue or maroon (academic feel) used for buttons, active states, progress indicators.

- Rounded corners (12–16px), soft shadows, subtle hover/press states, 150–200ms transitions.

- Typography: Inter/clean sans-serif, clear hierarchy.

- Generous whitespace, calm and professional, not cluttered.

AGENTIC UI ELEMENTS (core differentiator — show the agent actually reasoning/acting, not just replying)

- "Thinking" shimmer while agent reasons, collapsible "Show reasoning steps" panel after.

- Tool-call cards inline in chat: e.g. "🔍 Checking eligibility criteria...", "📄 Fetching fee structure...", "📅 Looking up admission deadline..." — each expands to show what was retrieved.

- Step tracker for multi-step tasks (e.g. eligibility check): Plan → Verify Criteria → Compare with Student Input → Result, shown as a live-updating vertical stepper.

- Streaming text response with blinking cursor.

- Source citation chips under answers ("Source: Admission Brochure 2026", "Source: Official Website") to reinforce reliability.

CORE FEATURES (beyond basic chat)

1. **Course Finder** — a card-based browsable list of courses/departments (name, duration, seats); clicking one auto-fills a chat query about it.

2. **Eligibility Checker (interactive tool, not just chat)** — a small form widget (12th % / stream / category) the agent can trigger mid-conversation; shows a clear ✅/❌ result card with reasoning ("You meet X, but not Y").

3. **Fee & Scholarship Estimator** — input form → agent returns a fee breakdown card (tuition, hostel, misc) with an optional scholarship eligibility note.

4. **Document Checklist** — dynamic checklist card generated per course/category, with checkboxes students can tick off ("Have you uploaded this?").

5. **Admission Timeline / Important Dates** — visual horizontal timeline component showing key dates (application open, last date, counseling, results) with a "days remaining" countdown.

6. **FAQ Quick-Reply Chips** — under the input bar, tappable chips like "Fees for CSE?", "Documents needed?", "Am I eligible?" to reduce typing.

7. **Application Status Tracker (mock)** — a small dashboard card showing "Application Submitted → Under Review → Admitted" progress, if student has applied.

8. **Human Handoff Prompt** — if the agent can't confidently answer, show a card: "Not sure? Contact Admission Office" with phone/email/office-hours info.

FUNCTIONAL SCREENS

1. Landing/empty state: "Hi! I'm AdmitAI 👋 — Ask me about courses, eligibility, fees, or documents." + 4 suggested prompt cards (Courses / Eligibility / Fees / Documents).

2. Active chat view with tool-call cards, stepper, and citation chips as above.

3. Settings modal: API key input (masked), model selector, theme toggle, language toggle (English/Hindi/Marathi optional).

ACCESSIBILITY & POLISH

- Full keyboard navigation, visible focus states, WCAG AA contrast.

- Responsive: sidebar collapses to hamburger drawer on mobile; input bar and cards remain usable on small screens.

- Designed empty/loading/error states (e.g. "Couldn't find that course — try another name").

TECH

- React + Tailwind CSS, component-based structure, Lucide icons.

- Use mock/placeholder data (sample courses, fees, dates, eligibility rules) and a mock streaming + tool-call simulation function for now — real LLM/API integration will be wired in separately.

Keep everything in one consistent design system — same spacing scale, same icon set, same corner radius throughout.

## Development

Run the development server locally:

```sh
npm install
npm run dev
```
