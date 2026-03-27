

## Fix: AI Transcribe & Escalation Model — Align to PRD §19.1

### Problems Identified

1. **Wrong timing**: `classifyIntervalMs` is 15s, `bufferWindowMs` is 30s — PRD specifies **10-second rolling slots**
2. **Edge function uses Groq directly** — should use Lovable AI Gateway (LOVABLE_API_KEY is available, no external key dependency needed)
3. **Suggestion popup not wired for intern BlackBox sessions** — interns who accept BlackBox sessions via PeerConnect don't get monitoring in the therapist dashboard flow
4. **No risk level label in popup recommendation text** — popup shows risk level badge but lacks explicit "Consider escalation" recommendation text per PRD §2.3

### Changes

**1. `src/hooks/useAudioMonitor.ts`**
- Change `classifyIntervalMs` default from `15000` → `10000`
- Change `bufferWindowMs` default from `30000` → `10000` (10s rolling window = 10s chunks sent every 10s)

**2. `src/components/videosdk/MeetingView.tsx`** (line 201)
- Change `classifyIntervalMs: 15000` → `classifyIntervalMs: 10000`

**3. `supabase/functions/ai-transcribe/index.ts`**
- Replace Groq API call with Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`)
- Use `LOVABLE_API_KEY` instead of `GROQ_API_KEY`
- Use model `google/gemini-2.5-flash` (fast, good for classification)
- Keep the same tool-calling schema (classify_risk) — Lovable AI supports tool calling
- Remove GROQ_API_KEY dependency check

**4. `src/components/blackbox/AISuggestionPopup.tsx`**
- Add explicit recommendation text per risk level:
  - L1: "Monitor closely — no immediate action required"
  - L2: "Consider escalation — review the conversation"
  - L3: "Immediate intervention recommended — escalate now"
- This fulfills PRD §2.3 requirement for recommendation text in popup

### Files in scope
- `src/hooks/useAudioMonitor.ts`
- `src/components/videosdk/MeetingView.tsx`
- `supabase/functions/ai-transcribe/index.ts`
- `src/components/blackbox/AISuggestionPopup.tsx`

### No database changes needed

