

## Plan: Fix QR Generation Error Handling

### Problem
The `generate-spoc-qr` edge function returns HTTP 400 for business errors (not SPOC, no temp IDs, etc.). The Supabase client's `functions.invoke()` treats any non-2xx as a `FunctionsHttpError` with a generic message "Edge Function returned a non-2xx status code", hiding the actual error reason.

Most likely cause: the logged-in user either isn't a SPOC, has no institution, or there are no unused temp credentials in the pool. The real error message is lost because of the 400 status code.

### Fix

#### 1. Edge Function: Return 200 with error in body
Change the catch block in `generate-spoc-qr/index.ts` to return HTTP 200 with `{ error: "..." }` in the JSON body instead of HTTP 400. This lets `supabase.functions.invoke()` pass the response through to `data`, where the client already checks `data?.error`.

**File**: `supabase/functions/generate-spoc-qr/index.ts`  
**Change**: Line 83 — change `status: 400` to `status: 200`

#### 2. Client: Better error extraction (defensive)
Update `SPOCTools.tsx` query to also try parsing the error context from `FunctionsHttpError` as a fallback, so even if status is non-200 the real message surfaces.

**File**: `src/components/admin/SPOCTools.tsx`  
**Change**: In the queryFn, when `error` is present, attempt to read `error.context?.json()` to get the actual message.

### Files Modified

| File | Change |
|------|--------|
| `supabase/functions/generate-spoc-qr/index.ts` | Return 200 instead of 400 for errors |
| `src/components/admin/SPOCTools.tsx` | Better error message extraction |

