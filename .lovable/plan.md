

## Plan: Fix BlackBox Call Not Connecting on User Side + QR Camera Error

### Error 1: BlackBox — User side never connects after therapist accepts

**Root cause:** The realtime subscription in `useBlackBoxSession.ts` (line 32-69) has a stale closure problem. The `token` variable captured in the closure is from when the effect was created, but the real issue is more subtle: when the therapist accepts and sets `room_id` + `status = "active"`, the realtime event fires, `setActiveSession(updated)` triggers a re-render, then `getVideoSDKToken()` is called asynchronously. However, if `getVideoSDKToken()` fails silently or the realtime event isn't received at all, the user stays stuck.

The more likely culprit: **Supabase Realtime may not be delivering the update** due to the `token` dependency being stale. The effect depends on `[activeSession?.id]` but uses `token` inside the callback without it being in the dependency array. If a re-render happens between `setActiveSession` and `setToken`, the effect could be torn down and re-created (since `activeSession?.id` is the same, it wouldn't re-create — so this is actually fine).

After closer inspection, the most probable issue is: **the realtime event IS received**, the token IS fetched, but the UI condition `isInSession` requires both `activeSession.room_id` AND `token` to be truthy simultaneously. Since `setActiveSession(updated)` and `setToken(t)` are separated by an `await`, they cause two separate renders. The first render has the updated session but no token — fine. The second render should have both — this should work.

**Actual likely issue:** The `token` state is set but the `useEffect` dependency `[activeSession?.id]` doesn't include `token`, so if a second realtime event fires, the stale `!token` check passes and triggers another token fetch. But more critically — **testing confirms the flow should work in theory**. The problem may be that `getVideoSDKToken()` is throwing an error that gets swallowed, or that the Realtime subscription filter isn't matching.

**Fix approach — make the flow more robust:**
1. Add `token` to the useEffect dependency array to prevent stale closures
2. Add explicit logging to the realtime handler so we can debug
3. Add a polling fallback: if session is queued, poll every 5 seconds for status changes (in case realtime fails)
4. Show a "Connecting..." state to the user when session transitions from queued to active

**Changes to `src/hooks/useBlackBoxSession.ts`:**
- Add `token` to the realtime useEffect dependency array
- Add a polling fallback that checks session status every 5 seconds while queued
- Add better error logging in the realtime handler

**Changes to `src/pages/dashboard/BlackBox.tsx` and `src/components/mobile/MobileBlackBox.tsx`:**
- Add a "Connecting..." intermediate state between queued and in-session (when session has room_id but no token yet)

---

### Error 2: QR Scanner — "Camera not available" error

**Root cause:** The `html5-qrcode` library's `Html5Qrcode.start()` calls `navigator.mediaDevices.getUserMedia()`. This fails in certain contexts:
1. **Lovable preview iframe** doesn't have `allow="camera"` permission attribute
2. **HTTP (non-HTTPS)** contexts don't expose `navigator.mediaDevices`
3. **Cross-origin iframes** block camera access by default

The current error handling (lines 114-126) catches the error but shows a generic "Could not access camera" message. The library throws before even attempting — it can't enumerate cameras.

**Fix approach:**
1. Before calling `Html5Qrcode.start()`, explicitly check if `navigator.mediaDevices` exists and call `getUserMedia` directly first to trigger the browser permission prompt
2. Use `Html5Qrcode.getCameras()` first to enumerate available cameras — if none found, show a specific helpful error instead of the generic one
3. Improve error messages to guide the user (e.g., "Open in your phone's browser" if in an iframe context)

**Changes to `src/pages/auth/QRScan.tsx`:**
- Add `navigator.mediaDevices` availability check before starting scanner
- Call `Html5Qrcode.getCameras()` first, then use the back camera ID explicitly
- Better error messaging for different failure modes (no camera hardware, permission denied, insecure context)

---

### Summary of files to modify
- `src/hooks/useBlackBoxSession.ts` — Add polling fallback + fix stale closure
- `src/pages/dashboard/BlackBox.tsx` — Add "Connecting" intermediate state
- `src/components/mobile/MobileBlackBox.tsx` — Same intermediate state
- `src/pages/auth/QRScan.tsx` — Camera enumeration + better error handling

