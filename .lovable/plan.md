

## Plan: Switch AI Functions to Groq Llama 3.3 70B Versatile

### What Changes

Both AI edge functions will use **Groq's Llama 3.3 70B Versatile** model (`llama-3.3-70b-versatile`, 128k context). `GROQ_API_KEY` is already configured.

### Changes

#### 1. `supabase/functions/ai-moderate/index.ts` — Full fix
- Replace deprecated `serve()` with `Deno.serve()`
- Fix CORS headers (add missing Supabase client headers)
- Change model from `openai/gpt-oss-20b` to `llama-3.3-70b-versatile`
- Add JWT authentication (verify caller owns the entry)
- Keep rate limiting, keep Groq API endpoint

#### 2. `supabase/functions/ai-transcribe/index.ts` — Switch from Lovable AI to Groq
- Replace Lovable AI gateway URL with `https://api.groq.com/openai/v1/chat/completions`
- Replace `LOVABLE_API_KEY` with `GROQ_API_KEY`
- Change model from `google/gemini-3-flash-preview` to `llama-3.3-70b-versatile`
- Keep all existing logic (tool calling for structured output, keyword detection, audit logging, suggestion popup response)

### Files Modified
- `supabase/functions/ai-moderate/index.ts`
- `supabase/functions/ai-transcribe/index.ts`

