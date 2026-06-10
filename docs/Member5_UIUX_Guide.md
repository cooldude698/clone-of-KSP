# DRISHTI — ದೃಷ್ಟಿ

## MEMBER 5: UI/UX & Experience Commander
**KSP × Hack2Skill Datathon 2026**

---

> **Your role in one sentence:**
> You are the face of DRISHTI. You build the Next.js visual interfaces. Good code looks mediocre with bad UI, but incredible UI wins hackathons.

---

## 1. Prerequisites & Branch Setup

```bash
git pull origin main
git checkout frontend

cd frontend
# Install shadcn/ui dependencies and animation tools
npm install framer-motion lucide-react class-variance-authority clsx tailwind-merge recharts
```

---

## 2. Step-by-Step Vibe Coding Guides

### Feature 1: Build the Design System
**Where to put it:** `frontend/tailwind.config.ts` and `globals.css`

**Prompt for Claude:**
> "I am setting up a Next.js (Tailwind CSS) project. Generate a complete, highly polished design system theme.
> **Vibe:** 'Karnataka State Police Cyber Intelligence.' Dark mode default.
> Colors: Deep navy background (`#0A1628`), slightly lighter navy for cards, electric blue for primary accents, Karnataka saffron-red for alerts, muted green for success.
> Output the exact CSS variables block for `globals.css` and the exact `tailwind.config.ts` extensions. Include 'Authoritative' sans-serif typography choices."

### Feature 2: High-Impact Landing Page
**Where to put it:** `frontend/app/page.tsx`

**Prompt for Claude:**
> "Write a Next.js React component for a high-end application login/landing screen. 
> Use Framer Motion for cinematic entrance animations.
> 1. Left side taking up 60% of the screen: A large heading 'DRISHTI: Karnataka Police Intelligence'. Below it, three massive animated stat counters counting up from 0: '5,35,000+ Cameras', '7,000+ AI Feeds', '169+ Smart Junctions'.
> 2. Right side (40%): A sleek glass-morphism login card. Needs an Employee ID input, Password input, and a Role dropdown (Inspector / Analyst / Supervisor / Policymaker). When submitted, save the Role to LocalStorage and push router to `/dashboard`."

### Feature 3: The 3-Panel Chat Interface
**Where to put it:** `frontend/app/dashboard/chat/page.tsx`

**Prompt for Claude:**
> "Write a Next.js chat interface using Tailwind CSS. 100vh, no scroll on the body.
> **Layout:**
> *   **Left Panel (Fixed width):** Navigation icons (Lucide react) and Recent Cases list.
> *   **Center Panel (Flex-grow):** The main chat area. User messages right-aligned in blue. AI messages left-aligned in a dark card. Support an embedded React component placeholder inline below the AI text for visual charts. At the bottom, a sleek input bar with an embedded 'Microphone' React component.
> *   **Right Panel (Fixed width, slide-in):** Slides in from the right when an FIR is clicked. Contains 'Case Evidence' and 'Active ANPR Alerts' widgets.
> Ensure perfect mobile responsiveness using Tailwind breakpoints. Add a 'Thinking...' three-dot bouncing animation when the user submits a message."

### Feature 4: Investigator's Digital Wall (The Case Board)
**Where to put it:** `frontend/components/InvestigatorWall.tsx`

**Prompt for Claude:**
> "Write a visually stunning React component called `InvestigatorWall.tsx`. 
> Props: `fir` (object), `accused` (array), `victims` (array), `related_firs` (array).
> Design it strictly like a police detective's pinboard. Center the main FIR on a card. Put Accused and Victims floating around it. Use `framer-motion` to make the cards 'fly' into place on mount. Use SVG lines (with dashed stroke animation) to draw connections from the related FIRs to the center FIR card. Make it look ominous but deeply analytical."

---

## 3. Testing Quality & Performance

**Testing Flow:**
1. Run `npm run dev` in the `frontend` folder.
2. Go to `http://localhost:3000`. Does the counter animation run smoothly? 
3. Log in. Does the 3-panel chat view resize gracefully if you resize the window?
4. **Is it visually breathtaking?** The UI is the only thing the judges will evaluate for 95% of the pitch. If the styling feels 'like a generic template', adjust the CSS variables.

---

## 4. Git Workflow & Pull Request

```bash
git add .
git commit -m "feat(ui): implemented landing page, theme, and 3-panel chat design"
git push origin frontend
```

Go to GitHub. Make a PR from `frontend` into `main`. Ping Member 1 (Captain) on WhatsApp to review and merge the visuals!