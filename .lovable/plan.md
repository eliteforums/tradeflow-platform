

## Plan: Relax security headers for game embedding

### Problem
Every time a new game is added, CSP and cross-origin headers block scripts, styles, or iframes — requiring repeated fixes.

### Changes

**1. Update `vercel.json` CSP to be permissive for game content**
- `script-src`: add `https:` to allow any HTTPS CDN (games often pull from various CDNs)
- `style-src`: add `https:` for the same reason
- `img-src`: add `https: http:` to allow game assets from anywhere
- `frame-src`: change to `'self' https:` to allow embedding external game content too if needed
- `media-src`: add `https:` for game audio/video assets
- `font-src`: add `https:` for game fonts

**2. Remove restrictive cross-origin headers that break iframes**
- Remove `Cross-Origin-Embedder-Policy` (blocks cross-origin resources in iframes)
- Remove `Cross-Origin-Resource-Policy` (blocks cross-origin asset loading)
- Keep `Cross-Origin-Opener-Policy` as `same-origin` (doesn't affect iframes)

**3. Keep essential security**
- Keep `X-Frame-Options: SAMEORIGIN` (prevents others from framing your site)
- Keep `Strict-Transport-Security` (HTTPS enforcement)
- Keep `X-Content-Type-Options: nosniff`
- Keep `Referrer-Policy`

### Files changed
- `vercel.json` — single file edit

