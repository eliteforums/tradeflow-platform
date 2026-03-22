

## Plan: Fix Therapist Add Member — CORS Header Mismatch

### Root Cause
The `add-member` edge function has outdated CORS `Access-Control-Allow-Headers` that don't include the `x-supabase-client-*` headers the supabase-js client now sends. The browser blocks the request at the preflight (OPTIONS) stage, so the function body never executes — explaining why there are zero logs.

Compare:
- **add-member** (broken): `authorization, x-client-info, apikey, content-type`
- **bulk-add-members** (working): includes `x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version`

### Changes

| # | File | Change |
|---|------|--------|
| 1 | `supabase/functions/add-member/index.ts` | Update CORS headers to match `bulk-add-members` |
| 2 | `src/components/admin/MemberManager.tsx` | Improve error extraction from `FunctionsHttpError` to show actual error messages instead of generic "Failed" |

### Technical Details

**1. Fix CORS headers** in `add-member/index.ts` line 5-7:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
```

**2. Fix error handling** in MemberManager mutation:
```typescript
if (error) {
  let msg = "Failed to create member";
  try { msg = (await error.context?.json())?.error || error.message; } catch {}
  throw new Error(msg);
}
```

### Summary
2 files, 2 small edits. The CORS fix is the critical one — without it, the browser silently blocks the request.

