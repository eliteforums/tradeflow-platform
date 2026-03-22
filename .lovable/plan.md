

## Plan: Fix QR Camera Scanning + Add BlackBox Silent User Handling

### Issue 1: QR Scanner — Camera Never Opens

The current `handleScan` in `QRScan.tsx` is a **fake stub** — it just waits 2 seconds and shows "Camera not available." There is no actual camera/QR scanning implementation.

**Fix**: Integrate a real browser-based QR scanner library (`html5-qrcode`) that uses the device camera via the MediaDevices API.

**Changes to `src/pages/auth/QRScan.tsx`:**
- Install `html5-qrcode` package
- Replace the fake `handleScan` with a real camera-based QR scanner using `Html5Qrcode`
- On successful scan, pass the decoded text through `parseQRPayload` and verify it (same logic as manual entry)
- Add a scanner container div that the library renders into
- Keep the manual fallback for browsers that block camera access
- Add proper cleanup (stop scanner on unmount or when switching to manual)

---

### Issue 2: BlackBox — User Won't Talk to Therapist

Currently there's no silence detection or therapist controls for unresponsive users.

**Changes:**

**A. Silence detection in `MeetingView.tsx`**
- Track when the last audio was detected from the student's mic
- After 2 minutes of silence, emit a "user_silent" event/callback
- Show a subtle "User has been silent" indicator in the therapist's view

**B. Therapist alert in therapist's BlackBox dashboard**
- When silence is detected, show a notification/badge: "Student hasn't spoken for 2+ minutes"
- Give the therapist an "End & Refund" button that:
  1. Sets session status to `completed`
  2. Refunds the student's 30 ECC via a credit transaction insert

**C. Auto-end after extended silence**
- If no audio detected for 5 minutes total, auto-end the session
- Refund the student's credits automatically
- Show toast to both sides: "Session ended due to inactivity"

**D. New edge function: `refund-blackbox-session`**
- Takes `session_id`, verifies the caller is the assigned therapist
- Inserts a +30 ECC `grant` credit transaction for the student
- Updates session status to `completed` with metadata noting the refund reason

**E. Database migration**
- Add `refunded` boolean column to `blackbox_sessions` (default false)
- Add `silence_duration_sec` integer column (nullable) to track silence metrics

### Files to create/modify
- `package.json` — add `html5-qrcode`
- `src/pages/auth/QRScan.tsx` — real camera scanner
- `src/components/videosdk/MeetingView.tsx` — silence detection logic
- `src/hooks/useBlackBoxSession.ts` — add refund + auto-end capability
- `src/components/blackbox/TherapistSessionControls.tsx` — new component for therapist end/refund UI
- `supabase/functions/refund-blackbox-session/index.ts` — new edge function
- Database migration — add `refunded` and `silence_duration_sec` columns

