

## Plan: Replace WreckBuddy3D with Ragdoll Bash HTML Game (iframe embed)

The uploaded file is a complete standalone HTML game (1552 lines) with its own Three.js renderer, physics engine, UI, and game loop. It cannot be converted to a React component — it must be embedded as-is via an iframe.

### Changes

**1. Copy the HTML file to `public/games/ragdoll-bash.html`**
- Place in `public/` so it's served as a static asset accessible via iframe.

**2. Rewrite `src/components/selfhelp/WreckBuddy3D.tsx`**
- Remove all Three.js/R3F code and the 2D fallback.
- Replace with a simple iframe that loads `/games/ragdoll-bash.html`.
- The iframe fills its container, works on both mobile and desktop.
- Remove the `hitCount`/`onHit` props since the game handles all interaction internally.

**3. Create a new route `/dashboard/wreck-buddy`**
- New page `src/pages/dashboard/WreckBuddy.tsx` that renders the game full-height inside `DashboardLayout`.
- No longer "coming soon" — move it to the active tools list.

**4. Update `src/pages/dashboard/SelfHelp.tsx`**
- Move "Wreck the Buddy" from `comingSoonTools` to `activeTools` with path `/dashboard/wreck-buddy`.

**5. Update mobile equivalent `src/components/mobile/MobileSelfHelp.tsx`**
- Same change — move from coming soon to active with the route link.

**6. Add route in `src/App.tsx`**
- Add `/dashboard/wreck-buddy` route pointing to the new WreckBuddy page.

### Technical Notes
- The HTML file uses CDN-loaded Three.js r128 — fully self-contained, no project dependency conflicts.
- iframe sandbox will isolate the game's global styles/scripts from the React app.
- The `WreckBuddy3D` component props interface will be simplified since the game is self-contained.

