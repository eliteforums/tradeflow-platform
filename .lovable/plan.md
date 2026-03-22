

## Plan: Add Tibetan Bowl as Active Tool + Mobile Responsive HTML

### Overview
Copy the uploaded `tibetan-bowl.html` to `public/games/`, make minor CSS tweaks for mobile responsiveness, then activate the Tibetan Bowl tool (move from "coming soon" to active) with a new page and route — following the same iframe pattern as Wreck the Buddy.

### Changes

**1. `public/games/tibetan-bowl.html`** — Copy uploaded file with mobile fixes
- Change `height: 100dvh` to `height: 100%` on body so it fills the iframe container instead of viewport
- Add `html { height: 100%; }` so the canvas fills available space
- Adjust HUD bottom position: use `clamp(12px, 3vh, 24px)` for mobile
- Scale down `#corner-info` font on small screens with a media query
- Ensure touch events work properly (already has `touch-action: none`)

**2. `src/pages/dashboard/TibetanBowl.tsx`** — New page (mirrors WreckBuddy pattern)
- DashboardLayout wrapper
- Title + subtitle
- Iframe component pointing to `/games/tibetan-bowl.html`

**3. `src/App.tsx`** — Add route
- Lazy import TibetanBowl page
- Add `/dashboard/tibetan-bowl` protected route

**4. `src/pages/dashboard/SelfHelp.tsx`** — Move Tibetan Bowl to active
- Move from `comingSoonTools` to `activeTools` with path `/dashboard/tibetan-bowl`
- Remove "Coming Soon" section if no items remain (or keep it empty for future)

**5. `src/components/mobile/MobileSelfHelp.tsx`** — Same change as SelfHelp

### Files
- Create: `public/games/tibetan-bowl.html`
- Create: `src/pages/dashboard/TibetanBowl.tsx`
- Edit: `src/App.tsx` (add route)
- Edit: `src/pages/dashboard/SelfHelp.tsx` (activate tool)
- Edit: `src/components/mobile/MobileSelfHelp.tsx` (activate tool)

