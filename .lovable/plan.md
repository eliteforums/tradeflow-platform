

## Deep Analysis and Fix Plan

### Investigation Summary

I thoroughly analyzed both issues by reading all relevant files, checking database state, testing the edge function directly, and reviewing logs.

---

### Issue 1: VideoSDK Calls Fail Before Room Creation

**Root cause confirmed from live edge function logs:**
```
Auth header present: false
Body token present: false
Token source: none
Token segments: 0
```

The auth token is **not reaching the edge function at all**. The current client code sends BOTH a custom `Authorization` header AND a body token, but **neither arrives**. This happens because `supabase.functions.invoke()` with custom `headers: { Authorization: ... }` conflicts with the SDK's own auto-injected auth header, resulting in a malformed or empty header reaching the function.

**Fix (3 files):**

1. **`src/lib/videosdk.ts`** -- Complete rewrite of invocation logic:
   - Remove `accessToken` from body and custom `Authorization` header entirely
   - Let the Supabase SDK handle auth natively (it auto-sends `Authorization: Bearer <session_token>`)
   - Simplify to just `supabase.functions.invoke("videosdk-token", { body: { action } })`
   - Fix `parseInvokeError` to safely handle already-consumed response bodies (try `.text()` in try/catch, fall back to `error.message`)
   - Keep session pre-check and retry logic

2. **`supabase/functions/videosdk-token/index.ts`** -- Simplify auth extraction:
   - Remove body token fallback path (no more `body.accessToken`)
   - Only read from `req.headers.get("authorization")` -- the standard path
   - Keep the robust Bearer extraction and 3-segment JWT validation
   - Keep all VideoSDK token generation and room creation logic as-is

3. **Redeploy** the edge function after changes

---

### Issue 2: Credit Grant Fails with RLS Violation

**Root cause:** The RLS policy `"Admins can insert credit transactions"` exists and looks correct, but the client-side insert is still rejected. Rather than continuing to debug RLS evaluation edge cases, the fix is to use the same proven pattern as `spend-credits`: **move the operation to an edge function using the service role key**.

This is also more secure -- it validates admin/spoc role server-side instead of relying on client-side RLS.

**Fix (2 files + deploy):**

1. **Create `supabase/functions/grant-credits/index.ts`**:
   - Accept `{ username, amount, notes }` in request body
   - Verify caller is admin or spoc via `has_role` RPC (using service role client)
   - Look up target user by username, verify they're a student
   - Insert credit transaction using service role (bypasses RLS)
   - Insert audit log entry
   - Return success with username and amount

2. **Update `supabase/config.toml`**: Add `[functions.grant-credits]` with `verify_jwt = false`

3. **Update `src/components/admin/CreditGrantTool.tsx`**:
   - Replace direct Supabase insert with `supabase.functions.invoke("grant-credits", { body: ... })`
   - Parse response for success/error
   - Keep existing UI unchanged

4. **Update `src/components/admin/SPOCTools.tsx`** (bulk grants):
   - Same pattern: call the edge function per student, or create a bulk variant
   - Alternatively, reuse the same edge function with a loop

---

### Technical Details

**VideoSDK client fix (key change):**
```typescript
// BEFORE (broken - custom header conflicts with SDK)
const { data, error } = await supabase.functions.invoke("videosdk-token", {
  body: { action, accessToken },
  headers: { Authorization: `Bearer ${accessToken}` },
});

// AFTER (correct - SDK handles auth automatically)
const { data, error } = await supabase.functions.invoke("videosdk-token", {
  body: { action },
});
```

**Grant credits edge function pattern (mirrors spend-credits):**
```typescript
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
// Verify caller is admin/spoc
const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: caller.id, _role: "admin" });
const { data: isSpoc } = await supabase.rpc("has_role", { _user_id: caller.id, _role: "spoc" });
if (!isAdmin && !isSpoc) throw new Error("Unauthorized");
// Insert with service role bypasses RLS
await supabase.from("credit_transactions").insert({ ... });
```

---

### Files to change
- `src/lib/videosdk.ts` -- simplify invocation, remove custom headers
- `supabase/functions/videosdk-token/index.ts` -- remove body token path
- `supabase/functions/grant-credits/index.ts` -- new edge function
- `supabase/config.toml` -- add grant-credits config
- `src/components/admin/CreditGrantTool.tsx` -- use edge function
- `src/components/admin/SPOCTools.tsx` -- use edge function for bulk grants

