# DRISHTI ದೃಷ್ಟಿ — Design System

---

## Design Philosophy

DRISHTI's UI should feel like a **mission control interface** — dark, authoritative, precise, and alive. It is not a consumer app. It is a professional intelligence tool that should inspire confidence in the officer using it.

Three principles:

1. **Clarity over decoration** — every element serves a function
2. **State communicates** — the orb is the primary status indicator; its state is never ambiguous
3. **Dark by default** — control rooms are dimly lit; high contrast dark UI is non-negotiable

---

## Color System

### Base Palette

```css
--color-bg-primary:     #030712;  /* Near black — main background */
--color-bg-secondary:   #0a0f1e;  /* Dark navy — panels, cards */
--color-bg-tertiary:    #0f172a;  /* Slate navy — input areas */
--color-border:         #1e293b;  /* Subtle border */
--color-border-active:  #334155;  /* Active/hover border */
```

### Text

```css
--color-text-primary:   #f1f5f9;  /* Primary text */
--color-text-secondary: #94a3b8;  /* Secondary/muted text */
--color-text-accent:    #e2e8f0;  /* Slightly dimmer primary */
```

### DRISHTI Orb States

```css
/* Idle — deep blue aurora */
--orb-idle-primary:     #1e40af;
--orb-idle-secondary:   #3b82f6;
--orb-idle-glow:        rgba(59, 130, 246, 0.3);

/* Listening — electric green */
--orb-listen-primary:   #065f46;
--orb-listen-secondary: #10b981;
--orb-listen-glow:      rgba(16, 185, 129, 0.4);

/* Thinking — golden amber */
--orb-think-primary:    #78350f;
--orb-think-secondary:  #f59e0b;
--orb-think-glow:       rgba(245, 158, 11, 0.4);

/* Speaking — cyan mercury */
--orb-speak-primary:    #164e63;
--orb-speak-secondary:  #06b6d4;
--orb-speak-glow:       rgba(6, 182, 212, 0.4);
```

### UI Accents

```css
--color-accent-blue:    #3b82f6;
--color-accent-green:   #10b981;
--color-accent-amber:   #f59e0b;
--color-accent-cyan:    #06b6d4;
--color-accent-red:     #ef4444;  /* Urgency: critical */
--color-accent-orange:  #f97316;  /* Urgency: high */
```

---

## Typography

```css
/* Primary UI font */
font-family: 'Inter', system-ui, sans-serif;

/* Monospace — data, IDs, timestamps */
font-family: 'JetBrains Mono', 'Fira Code', monospace;

/* DRISHTI label */
font-family: 'Space Grotesk', 'Inter', sans-serif;
letter-spacing: 0.15em;
text-transform: uppercase;
```

### Type Scale

| Role | Size | Weight |
| :--- | :--- | :--- |
| Page title | 24px | 600 |
| Section header | 18px | 600 |
| Body | 14px | 400 |
| Caption / micro | 12px | 400 |
| Data value | 13px mono | 500 |
| DRISHTI label | 11px | 700 |

---

## Component Patterns

### Glassmorphism Card

```css
background: rgba(10, 15, 30, 0.6);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.06);
border-radius: 16px;
```

### Active Glow Border

```css
border: 1px solid rgba(59, 130, 246, 0.4);
box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
```

### Urgency Indicators

| Level | Color | Treatment |
| :--- | :--- | :--- |
| `low` | `#10b981` green | Subtle left border |
| `medium` | `#f59e0b` amber | Amber left border + mild glow |
| `high` | `#f97316` orange | Orange border + pulse animation |
| `critical` | `#ef4444` red | Red border + fast pulse + shake |

---

## Layout

### Dashboard Grid

```text
┌─────────────────────────────────────────────────┐
│  TOP BAR: KSP Logo | DRISHTI | Time | Status    │
├─────────────────────────────────────────────────┤
│                                                  │
│           MAIN CONTENT AREA                      │
│     (Visualization renders here)                 │
│                                                  │
│                                                  │
├─────────────────────────────────────────────────┤
│  CHAT PANEL (slides up from bottom when active) │
└──────────────────────────── [DRISHTI ORB] ──────┘
```

### Orb Position

- Fixed: `bottom: 32px`, `right: 32px`
- Size: 120×120px idle, 160×160px active
- Z-index: 9999 (always on top)

---

## Animation Principles

### Orb State Transitions

- Duration: 400ms ease-in-out
- Never abrupt — always cross-fade between states
- Glow expands before color changes

### Response Panel

- Slides up from bottom: `translateY(100%) → translateY(0)`
- Duration: 300ms cubic-bezier(0.34, 1.56, 0.64, 1) (spring)

### Follow-up Chips

- Stagger in: 50ms delay between each chip
- Fade + translateY(8px) → translateY(0)

### Urgency Pulse (high/critical)

- Box-shadow pulse: 0.8s infinite alternate
- Critical adds subtle shake: 50ms keyframe shake

---

## Iconography

- Use **Lucide React** or inline SVG only
- No icon fonts
- Mic icon: shown inside orb during `listening`
- Spinner: inside orb during `thinking`
- Sound waves: around orb during `speaking`
- All icons: white/near-white, 20-24px

---

## Accessibility

- Minimum contrast ratio: 4.5:1 for all text
- Focus rings: visible on all interactive elements
- Orb state announced via `aria-live` region
- Text fallback always available alongside voice
