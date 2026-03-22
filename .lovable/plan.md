

## Plan: Switch AI Model to Groq GPT OSS 20B 128k

### Summary
Update both AI edge functions to use `openai/gpt-oss-20b` (Groq's GPT OSS 20B with 128k context) instead of `llama-3.3-70b-versatile`. Both functions already use the Groq API endpoint and `GROQ_API_KEY` — only the model name changes.

### Changes

| # | File | Change |
|---|------|--------|
| 1 | `supabase/functions/ai-moderate/index.ts` | Change model from `llama-3.3-70b-versatile` to `openai/gpt-oss-20b` |
| 2 | `supabase/functions/ai-transcribe/index.ts` | Change model from `llama-3.3-70b-versatile` to `openai/gpt-oss-20b` |

Both functions already use `https://api.groq.com/openai/v1/chat/completions` with the `GROQ_API_KEY` secret (which is already configured). This is a one-line model name swap in each file. No other AI integrations exist in the project.

