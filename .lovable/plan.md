

## Plan: Fix AI Transcribe — Expand Keywords + Remove Hard Gate (Keep Groq)

### Root Cause
The function has a **hard gate** at line 58: if zero keywords match, it returns `flag_level: 0` immediately — the AI model never runs. The keyword list is only ~16 entries and misses common distress words like "stress", "anxious", "overwhelmed", "lonely", "scared", "crying", etc.

### Changes

#### `supabase/functions/ai-transcribe/index.ts`

**A. Expand keywords to ~80+ terms** (replace lines 8-16)

Add categories:
- **Emotional**: stress, stressed, anxious, anxiety, overwhelmed, crying, lonely, loneliness, scared, terrified, numb, empty, exhausted, burned out, burnout, miserable, suffering, tormented, frustrated, angry, furious, rage, shame, guilty, grief, mourning, heartbroken
- **Academic/social**: failing, dropped out, bullied, bullying, ragging, harassment, humiliated, rejected, isolated, no friends, left out, excluded
- **Substance**: drinking, drunk, alcohol, drugs, smoking, addiction, addicted
- **Self-harm expanded**: bleed, bleeding, scars, razor, bridge, rooftop, hanging, drowning, suffocating, starving
- **Family/relationship**: divorce, breakup, broken up, domestic violence, beaten, molested, raped, trauma, PTSD, flashbacks, abusive
- **Existential**: no purpose, meaningless, pointless, give up, giving up, lost hope, no future, trapped, stuck, can't breathe, don't care anymore, nothing matters, why bother, what's the point

**B. Remove the hard gate** (replace lines 58-62)

Instead of returning immediately when no keywords match, change logic to:
- If keywords found → pass them as context to Groq (current behavior)
- If no keywords found BUT transcript is >50 chars → still call Groq with a general analysis prompt (no keyword hints)
- If transcript is ≤50 chars and no keywords → return `flag_level: 0` (too short to analyze)

This ensures the AI always gets a chance to evaluate substantial speech.

**C. Keep Groq + Llama 3.3 70B** — no provider change, same tool-calling format.

### Files Modified
- `supabase/functions/ai-transcribe/index.ts` — Expand keyword list, remove hard gate so AI always analyzes substantial transcripts

### No database or frontend changes needed
The suggestion popup and escalation flows are already wired correctly.

