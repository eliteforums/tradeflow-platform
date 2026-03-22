

## Plan: Fix Expert Visibility + Auto-Join Sessions

### Issue 1: Experts/therapists not shown on student panel

**Root cause**: The `profiles` table RLS only lets students SELECT their own row (`auth.uid() = id`). When `useAppointments` queries `profiles.eq("role", "expert")`, it returns zero rows for students because RLS blocks access to other users' profiles.

Staff (expert/therapist/intern) can see all profiles, but students cannot. The expert availability table itself is readable (`USING (true)`), but the JOIN to profiles fails silently — returning null expert data.

**Fix**: Add a new RLS policy on `profiles` allowing all authenticated users to view basic expert/therapist/intern profiles:

```sql
CREATE POLICY "Students can view staff profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (role IN ('expert', 'therapist', 'intern'));
```

This is safe — profiles don't contain PII (no emails/phones; those are in `user_private`).

---

### Issue 2: Sessions stuck at "Joining" / voice calls not initiated

**Root cause**: `MeetingView` renders a "Join Session" button and waits for a manual click. After clicking, it calls `join()` and shows "Joining the session..." indefinitely if the VideoSDK meeting fails to connect. For BlackBox, neither student nor therapist auto-joins — they both see a "Join Session" screen after the MeetingProvider mounts.

**Fix**: Add an `autoJoin` prop to `MeetingView`. When true, automatically call `join()` on mount instead of showing the "Join Session" button. Pass `autoJoin={true}` from:
- BlackBox page (both desktop and mobile) — student side
- TherapistDashboardContent — therapist side accepting sessions
- VideoCallModal — for appointment calls (trigger join after "Start Call" already clicked)

Also add a timeout fallback: if join doesn't complete within 15 seconds, show a retry button instead of infinite spinner.

---

### Files Modified

| File | Change |
|------|--------|
| **DB Migration** | Add RLS policy: students can view staff profiles |
| `src/components/videosdk/MeetingView.tsx` | Add `autoJoin` prop with auto-join on mount + 15s timeout retry |
| `src/pages/dashboard/BlackBox.tsx` | Pass `autoJoin={true}` to MeetingView |
| `src/components/mobile/MobileBlackBox.tsx` | Pass `autoJoin={true}` to MeetingView |
| `src/components/therapist/TherapistDashboardContent.tsx` | Pass `autoJoin={true}` to MeetingView |
| `src/components/videosdk/VideoCallModal.tsx` | Pass `autoJoin={true}` to MeetingView |

