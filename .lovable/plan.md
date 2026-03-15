
Issue recap:
- Calls still fail with generic toast: “Edge Function returned a non-2xx status code.”
- Current code hides the real backend error because `src/lib/videosdk.ts` throws only `error.message` from `functions.invoke`.
- The backend function is present, but the failure reason (auth/session vs VideoSDK API rejection) is not surfaced in UI.

What I will build:

1) Make VideoSDK client invocation explicit and debuggable
- File: `src/lib/videosdk.ts`
- Replace the current simple wrappers with a shared `invokeVideoSDK(action)` helper that:
  - Reads current auth session first (`supabase.auth.getSession()`).
  - Sends `Authorization: Bearer <access_token>` explicitly in `functions.invoke` headers.
  - Handles `FunctionsHttpError` by parsing `error.context.json()` / text to extract backend `error` + `details`.
  - Throws actionable messages (e.g. “Session expired, please log in again”, “Video provider rejected credentials”, etc.) instead of generic non-2xx.

2) Harden and instrument the backend function responses
- File: `supabase/functions/videosdk-token/index.ts`
- Keep current auth guard, but improve failure clarity and runtime safety:
  - Add structured logs at key points (auth received, action type, room-create response code).
  - Return clean JSON error payloads for all branches (invalid/missing action, auth fail, credentials missing, upstream API fail).
  - Safely parse upstream room-create response (avoid hard crash on non-JSON response body).
  - Include upstream status in error payload when room creation fails.

3) Improve UI error feedback at call entry points
- Files:
  - `src/components/videosdk/VideoCallModal.tsx`
  - `src/components/therapist/TherapistDashboardContent.tsx` (and any other call launchers using same helper)
- Ensure the parsed detailed error from step 1 is shown in toast so users/admins immediately know what to fix.

Why this approach:
- It fixes the likely auth-header/session ambiguity by sending token explicitly.
- It removes the current “black box” failure mode by surfacing exact backend/upstream error details.
- It resolves both video and audio flows since both depend on the same `videosdk-token` path.

Validation plan after implementation:
1. Test from each flow:
   - Appointment video call
   - Peer-connect audio call
   - Therapist/BlackBox accept-and-connect flow
2. Confirm no generic non-2xx toast appears; instead, clear actionable errors (or successful join).
3. Verify backend logs show action + status details for each attempt.
