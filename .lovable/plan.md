

## Fix: Intern Dashboard & PeerConnect — Show Students, Not Interns

### Problem
Two related issues:

1. **PeerConnect page for interns** shows a list of *other interns* instead of *students who requested sessions*. The left sidebar always renders the intern list regardless of who's viewing. When an intern clicks "Join" from their dashboard, the chat area fails to render because line 130 checks `selectedIntern` (which looks up the intern_id in the interns array — wrong for an intern user).

2. **Messages not reflected** — Because the chat panel guard (`activeSessionId && selectedIntern`) fails for intern users, the chat never renders even when a session exists.

### Root Cause
`PeerConnect.tsx` line 130: `{activeSessionId && selectedIntern ? (` — `selectedIntern` is derived from `interns.find(i => i.id === activeSession?.intern_id)`. For an intern, this finds *themselves*, but the chat header shows the intern's own name instead of the student's. More critically, the left panel always shows the intern directory, which is meaningless for interns.

### Fix Plan

**File: `src/pages/dashboard/PeerConnect.tsx`**

1. **Split the left sidebar by role**:
   - If `isIntern`: show the intern's assigned sessions (from `sessions` array), displaying student usernames, session status, and a "Chat" button
   - If student: show the existing intern directory (no change)

2. **Fix chat panel guard** (line 130):
   - Change from `activeSessionId && selectedIntern` to `activeSessionId && (selectedIntern || isIntern)`
   - Use `chatPartnerName` (already correctly set on line 89-91) for the header instead of `selectedIntern.username`

3. **Fix chat header**: When `isIntern`, show student username from `activeSession.student.username` instead of the intern's own profile

**File: `src/components/mobile/MobilePeerConnect.tsx`**
- Apply the same logic split for mobile view

### Changes Summary
- ~30 lines changed in the left sidebar to conditionally render student sessions for interns
- 1-line guard fix for the chat panel
- Header name already handled by existing `chatPartnerName` variable
- No database or hook changes needed — `usePeerConnect` already fetches sessions with student joins for interns (line 96-104 in the hook)

