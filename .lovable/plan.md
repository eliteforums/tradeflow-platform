

## Plan: Add Vercel Analytics

### Note
This is a Vite + React project, not Next.js. The correct import is `@vercel/analytics/react`, not `@vercel/analytics/next`.

### Changes

1. **Install package** — `npm i @vercel/analytics`

2. **`src/App.tsx`** — Add the Analytics component inside the app tree:
   ```typescript
   import { Analytics } from "@vercel/analytics/react";
   ```
   Place `<Analytics />` alongside the other global components (Toaster, Sonner, PWAUpdatePrompt, CookieConsent).

### Files Modified
- `package.json` — add `@vercel/analytics`
- `src/App.tsx` — import and render `<Analytics />`

