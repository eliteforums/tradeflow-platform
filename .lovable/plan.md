

## Plan: Fix VideoSDK Edge Function Error

### Root Cause

Two issues are causing the "non-2xx status code" error:

1. **Missing `config.toml` entry** — The `videosdk-token` function is not registered in `supabase/config.toml` with `verify_jwt = false`. The gateway rejects requests before the function code runs, which is why there are zero logs.

2. **Invalid auth method** — The function calls `supabase.auth.getClaims(token)` which does not exist in Supabase JS v2. This would crash even if the gateway allowed the request through. The correct method is `supabase.auth.getUser(token)`.

### Changes

| File | Change |
|------|--------|
| `supabase/config.toml` | Add `[functions.videosdk-token]` with `verify_jwt = false` |
| `supabase/functions/videosdk-token/index.ts` | Replace `supabase.auth.getClaims(token)` with `supabase.auth.getUser(token)` and update the check accordingly |

### Technical Detail

```toml
# Add to config.toml
[functions.videosdk-token]
verify_jwt = false
```

```typescript
// Replace getClaims with getUser
const { data: { user }, error: userError } = await supabase.auth.getUser(token);
if (userError || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
```

After deploying, the function will be tested to confirm it returns a valid token and can create rooms.

