
## Plan: Fix Wreck the Buddy embed (root cause + permanent fix)

### Why it is still broken
From your screenshot + current code, there are **3 blockers**:

1. **`X-Frame-Options: DENY`** in `vercel.json` blocks any iframe render (including your own `/games/ragdoll-bash.html`).
2. Your game file loads Three.js from CDN (`cdnjs`), but CSP currently has `script-src 'self'`, so once iframe is allowed, that script will be blocked next.
3. PWA navigation fallback can hijack iframe document requests and return app shell HTML instead of the game page (current denylist only excludes `/~oauth`).

### Changes to implement

1. **Update `vercel.json` security headers**
   - Change `X-Frame-Options` from `DENY` → `SAMEORIGIN`.
   - Update CSP `script-src` to allow the exact game dependency:
     - add `https://cdnjs.cloudflare.com`
   - Keep `frame-src 'self'` as-is.

2. **Update PWA fallback behavior in `vite.config.ts`**
   - In `VitePWA.workbox.navigateFallbackDenylist`, add `/^\/games\//` so `/games/ragdoll-bash.html` is not replaced by SPA fallback.

3. **Cache-bust the iframe URL in `src/components/selfhelp/WreckBuddy3D.tsx`**
   - Set iframe src to `/games/ragdoll-bash.html?v=2` (or similar) so users don’t stay stuck on stale cached behavior after deploy.

4. **Quick validation pass**
   - Open `/games/ragdoll-bash.html` directly (should show the game, not app shell).
   - Open `/dashboard/wreck-buddy` on mobile + desktop and confirm interaction works.
   - Confirm no iframe/XFO errors remain in console for this route.

### Technical details (concise)

- Current conflict is security-policy mismatch:
  - iframe allowed by `frame-src 'self'`
  - but blocked by `X-Frame-Options: DENY`
- The game is standalone HTML and depends on external Three.js CDN (`public/games/ragdoll-bash.html`, line with `cdnjs`), so CSP must explicitly allow it.
- PWA fallback exclusion for `/games/*` avoids service worker serving wrong HTML in iframe contexts.
