

## Plan: AI Suggestion Popup System for Risk Detection

### What Changes

Currently, the AI transcription silently updates a risk badge in the `MeetingView` header. The user requirement is to show an **interactive popup/dialog** when AI detects risk, presenting the suggested level and letting the expert/intern/therapist decide whether to escalate. AI assists but does not auto-escalate.

### Current Flow (Silent)
```text
AI detects keywords → classifies L1-L3 → updates badge silently
Expert/Intern/Therapist must notice badge change manually
```

### New Flow (Popup Suggestion)
```text
AI detects keywords → classifies L1-L3 → returns analysis with reasoning
→ Popup appears over the call UI showing:
  - Suggested risk level (L1/L2/L3)
  - Detected keywords + emotional signals
  - Transcript snippet context
  - Two buttons: [Dismiss] [Escalate Now]
→ User reviews and decides
→ If Escalate: captures ±10s snippet, triggers escalation flow
→ If Dismiss: logs dismissal, closes popup
```

### Changes

#### 1. `supabase/functions/ai-transcribe/index.ts` — Enhanced AI analysis

- Upgrade the AI prompt from returning just a number to returning structured JSON with:
  - `risk_level` (1-3)
  - `risk_indicators` (array of detected emotional distress signals beyond just keywords)
  - `reasoning` (1-2 sentence explanation of why this level was suggested)
  - `emotional_signals` (e.g., "tone of hopelessness", "escalating distress pattern")
- Use Lovable AI gateway instead of Groq for the classification call (LOVABLE_API_KEY is already available, and this avoids dependency on external GROQ_API_KEY)
- Use tool calling for structured output extraction
- Return the full analysis in the response so the client can display it in the popup
- **Remove auto-escalation**: AI no longer creates `escalation_requests` directly — it only suggests. The human triggers escalation via the popup.

#### 2. New component: `src/components/blackbox/AISuggestionPopup.tsx`

A dialog/overlay that appears when AI detects risk >= 1:
- Shows risk level badge (color-coded L1/L2/L3)
- Lists detected keywords and emotional signals
- Shows the AI's reasoning text
- Shows a brief transcript context snippet
- **Dismiss** button — closes popup, logs that suggestion was reviewed but not acted on
- **Escalate** button — calls `captureEscalationSnippet()`, then triggers the appropriate escalation flow
- Auto-dismiss after 30 seconds if no action (with countdown indicator)
- Does not block the call — positioned as a floating overlay

#### 3. `src/hooks/useAudioMonitor.ts` — Return full AI analysis

- Update `AudioMonitorState` to include `lastSuggestion` object with `risk_level`, `keywords`, `reasoning`, `emotional_signals`, `snippet`
- Update `classifyBuffer` to store the full AI response (not just flag_level)
- Add `dismissSuggestion()` method to clear the current suggestion
- Add `onSuggestion` callback option for parents to react to new suggestions

#### 4. `src/components/videosdk/MeetingView.tsx` — Wire popup

- Render `<AISuggestionPopup>` when `audioMonitor.lastSuggestion` is present
- Pass `captureEscalationSnippet` and session context to the popup
- On escalate: call the existing escalation flow (edge function) with the captured snippet
- On dismiss: call `audioMonitor.dismissSuggestion()`

#### 5. Update `ai-transcribe` — Remove auto-escalation side effects

- The function should still update `flag_level` on the session for record-keeping
- But should NOT create `escalation_requests` — that happens only when the human clicks Escalate in the popup
- Still append to `escalation_history` for audit trail
- Still insert audit log for L2+ detections

### Constraints Enforced
- AI **suggests only** — no auto-escalation requests created
- Final control remains with expert/intern/therapist (they click Escalate or Dismiss)
- ±10s snippet captured only when human triggers escalation
- No full recording stored

### Files Modified
- `supabase/functions/ai-transcribe/index.ts` — Enhanced prompt, structured output, remove auto-escalation
- `src/hooks/useAudioMonitor.ts` — Store full suggestion, add dismiss method
- `src/components/blackbox/AISuggestionPopup.tsx` — New popup component
- `src/components/videosdk/MeetingView.tsx` — Render popup, wire escalation

