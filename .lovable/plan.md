

## AI Transcribe Model Upgrade — Groq + Recommendations

### What Changes

**1. `supabase/functions/ai-transcribe/index.ts`**
- Replace Lovable AI Gateway (`ai.gateway.lovable.dev`) with **Groq API** (`api.groq.com/openai/v1/chat/completions`)
- Use `GROQ_API_KEY` secret instead of `LOVABLE_API_KEY`
- Model: `llama-3.3-70b-versatile` (fast, good reasoning — ideal for 10s classification intervals)
- Add `recommendation` field to the `classify_risk` tool schema — actionable advice for the staff member
- Enhance system prompt to produce context-aware recommendations per level

**2. Secret: `GROQ_API_KEY`**
- Will request via `add_secret` tool — you'll need a Groq API key from [console.groq.com](https://console.groq.com)

**3. `src/hooks/useAudioMonitor.ts`**
- Add `recommendation: string` to the `AISuggestion` interface
- Pass `recommendation` from the AI response into state

**4. `src/components/blackbox/AISuggestionPopup.tsx`**
- Display AI-generated `recommendation` text in the popup instead of static per-level text
- Fall back to static text if recommendation is empty

### No database changes needed

### Files
- `supabase/functions/ai-transcribe/index.ts`
- `src/hooks/useAudioMonitor.ts`
- `src/components/blackbox/AISuggestionPopup.tsx`

