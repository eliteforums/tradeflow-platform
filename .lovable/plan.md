

## Analysis: Performance + BlackBox Call Issues

### What I Found

**1. BlackBox calls ARE working (edge function logs confirm it)**
The latest logs show: auth headers arriving correctly, token generation succeeding, room creation returning upstream status 200, and completed sessions with room IDs in the database. The user `nhibataunga` has 540 ECC (well above the 30 ECC requirement). The issue is likely a **stale deployed version** of the edge function or a **client-side error swallowing** problem.

**2. `grant-credits` missing from `supabase/config.toml`**
The edge function exists but was never added to the config file, meaning it might not be deployed or might require JWT verification (blocking unauthenticated pre-flight).

**3. Performance issues for 60k concurrent users**
Several bottlenecks identified:

- **Google Fonts loaded synchronously** in CSS (`@import url(...)`) — blocks rendering
- **ProtectedRoute makes 2 extra DB queries per page load** (recovery check + device validation) — adds latency on every navigation
- **No query deduplication** — `useCredits` hook fetches transactions even when only balance is needed (Dashboard imports it just for balance)
- **`useAdmin` fires 6+ parallel unbounded queries** without pagination — will crash at scale
- **`usePeerConnect` queries ALL interns on mount** — scales poorly
- **Realtime channels opened per-component** without connection pooling
- **`useEccEarn` polls every 30 seconds** regardless of page — unnecessary network traffic
- **`@videosdk.live/react-sdk` eagerly imported** on BlackBox and PeerConnect pages (even before user clicks "call") — heavy bundle

---

### Plan

#### A. Fix `grant-credits` config (1 file)
- Add `[functions.grant-credits]` with `verify_jwt = false` to `supabase/config.toml`

#### B. Fix BlackBox call reliability (2 files)
- **`src/hooks/useBlackBoxSession.ts`**: Add detailed console logging at each step (spend credits, insert session, get token) so errors are visible. Add try/catch around `spendCredits` with specific error messages.
- **`src/lib/videosdk.ts`**: Add `console.error` with full error object before throwing, so we can see exact failure in console logs.

#### C. Performance optimizations for 60k scale (6 files)

1. **`index.html`** — Add `<link rel="preload">` for Google Fonts with `font-display: swap` instead of CSS `@import`
2. **`src/index.css`** — Remove blocking `@import url(...)` for fonts
3. **`src/hooks/useDeviceValidation.ts`** — Add `staleTime: 5 min` to avoid re-checking on every navigation; cache result
4. **`src/components/ProtectedRoute.tsx`** — Add `staleTime` to recovery check query, skip device check if already validated this session
5. **`src/pages/dashboard/Dashboard.tsx`** — Use `creditBalance` from AuthContext directly instead of importing `useCredits` (avoids extra transaction fetch)
6. **`src/pages/dashboard/BlackBox.tsx`** — Lazy-load `MeetingProvider` and `MeetingView` only when a call is active (dynamic import)
7. **`src/pages/dashboard/PeerConnect.tsx`** — Same: lazy-load `VideoCallModal`
8. **`src/hooks/useEccEarn.ts`** — Increase polling to 60s or disable polling when tab is not visible

#### D. Deploy edge functions
- Redeploy `videosdk-token` and `grant-credits` to ensure latest code is live

### Files to change
- `supabase/config.toml` — add grant-credits config
- `src/index.css` — remove blocking font import
- `index.html` — add preload fonts
- `src/hooks/useBlackBoxSession.ts` — add logging, improve error handling
- `src/lib/videosdk.ts` — add error logging
- `src/components/ProtectedRoute.tsx` — cache device + recovery checks
- `src/hooks/useDeviceValidation.ts` — add staleTime caching
- `src/pages/dashboard/BlackBox.tsx` — lazy-load VideoSDK components
- `src/pages/dashboard/PeerConnect.tsx` — lazy-load VideoCallModal
- `src/hooks/useEccEarn.ts` — reduce polling frequency

