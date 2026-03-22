

## Plan: Fix CSP blocking Wreck the Buddy iframe

### Root Cause

The console errors show: `Framing 'https://eternia.eliteforums.in/games/ragdoll-bash.html' violates the following Content Security Policy directive: "frame-src 'none'"`.

The `vercel.json` CSP header has `frame-src 'none'` which blocks ALL iframes, including same-origin ones.

### Fix

**1. Update `vercel.json`** — Change `frame-src 'none'` to `frame-src 'self'` in the Content-Security-Policy header. This allows same-origin iframes (the game file served from `/games/ragdoll-bash.html`) while still blocking external frames.

Single line change in the CSP value string.

