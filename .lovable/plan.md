
Issue restated:
Voice/video call still fails with the generic toast “Edge Function returned a non-2xx status code,” and you suspect missing VideoSDK API keys.

What I found from live backend diagnostics:
- Secret names exist for both `VIDEOSDK_API_KEY` and `VIDEOSDK_API_SECRET` (so keys are configured at least by name).
- Recent `videosdk-token` logs show: `invalid JWT ... token is malformed: token contains an invalid number of segments`.
- That means the request is failing at auth validation before room creation, so this is currently an auth-token formatting/session issue first, not an API-key check yet.

Do I know what the issue is?
- Yes: malformed auth token handling path is the blocker. API-key validation is not being reached consistently.

Implementation plan (concise):

1) Fix client invocation so auth is not manually forced
- File: `src/lib/videosdk.ts`
- Remove manual `Authorization` header injection in `supabase.functions.invoke(...)`.
- Keep a strict pre-check using `supabase.auth.getUser()` (or validated session) before invoking.
- If session is invalid, throw a clear user-facing error: “Session expired, please sign in again.”
- Keep robust `FunctionsHttpError` JSON parsing to surface backend `details`.

2) Make backend auth parsing resilient and unambiguous
- File: `supabase/functions/videosdk-token/index.ts`
- Replace fragile token extraction with robust bearer parsing (`/^Bearer\s+/i`) and trim.
- Validate JWT structure (`3 segments`) before calling auth lookup; return clear 401 detail if malformed.
- Use a single auth verification path (avoid mixed header+token ambiguity), then continue.
- Return structured error payloads with stable codes (e.g. `SESSION_INVALID`, `VIDEOSDK_CONFIG_MISSING`, `VIDEOSDK_UPSTREAM_ERROR`) so UI can map cleanly.

3) Ensure UI always shows actionable error text
- Files: `src/components/videosdk/VideoCallModal.tsx` and any other call launcher using this helper.
- Keep displaying thrown error message directly from `createVideoSDKRoom/getVideoSDKToken` so users see root cause (session expired vs invalid provider credentials).

4) Add targeted runtime logs for one-pass debugging
- File: `supabase/functions/videosdk-token/index.ts`
- Log only safe diagnostics: action type, whether auth header exists, JWT segment count, upstream status code.
- Do not log token values or secrets.

Validation plan after implementation:
1. Logged-in call test (video and audio): should no longer show generic non-2xx; should either connect or show specific reason.
2. Check backend logs:
   - Expected success path: authenticated user id logged, action processed.
   - If key/secret truly wrong, now you’ll get explicit upstream provider error (e.g., invalid API key/secret), confirming credential issue.
3. Logged-out test: should show “please sign in” (not generic non-2xx).

If error persists after this:
- Next likely cause is invalid VideoSDK credential values (not missing names). With the above changes, the UI/backend will explicitly report that and we can correct secrets directly.
