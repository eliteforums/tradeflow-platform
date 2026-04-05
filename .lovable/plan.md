

## BlackBox Portal Redesign

Three changes to the BlackBox experience:

### 1. Blank Entry Screen After Login
**Files:** `src/pages/dashboard/BlackBox.tsx`, `src/components/mobile/MobileBlackBox.tsx`

- Remove `DashboardLayout` wrapper from both desktop and mobile BlackBox components
- When `callState === "idle"` (no active session), render a completely blank white screen — no header, nav, buttons, or text
- After a short delay (~2s), fade in the text: *"Hi, This is your anonymous space."*
- Then fade-transition to the "Request Voice Call" button after another ~2s
- Use `framer-motion` `AnimatePresence` for smooth text transitions
- Background: pure white (`bg-white`), full viewport height, centered content

### 2. Dynamic Single-Line Message Display During Session
**Files:** `src/pages/dashboard/BlackBox.tsx`, `src/components/mobile/MobileBlackBox.tsx`

- When `isJoined`, instead of static "Hello! I am Nova..." text, show a single dynamic text line that replaces itself (no scrolling feed)
- Messages cycle through contextual phrases:
  - Initial: "Hi, This is your anonymous space."
  - After 5s: "Take your time. I'm here."
  - After voice activity: "I'm listening..."
  - On session end: "You did something brave today."
- Each transition uses a fade-out/fade-in animation
- Keep the interface minimal — only the orb, the single text line, and bottom controls visible

### 3. Voice-Reactive Orb
**Files:** `src/components/blackbox/NovaOrb.tsx`

- Add a new `audioLevel` prop (0-1 float) representing current mic input volume
- Map `audioLevel` to orb `scale` and outer glow intensity for real-time reactivity
- Use `framer-motion` `useSpring` for smooth interpolation
- Create a new `useVoiceLevel` hook that captures real-time mic volume via `AnalyserNode` + `requestAnimationFrame`
- Pass the level to `NovaOrb` — only active when session is joined

### Files to Create
- `src/hooks/useVoiceLevel.ts` — mic volume analyzer hook

### Files to Edit
- `src/components/blackbox/NovaOrb.tsx` — add `audioLevel` prop, voice-reactive animations
- `src/pages/dashboard/BlackBox.tsx` — blank entry, dynamic messages, voice level integration
- `src/components/mobile/MobileBlackBox.tsx` — same changes for mobile

