

## Plan: Make "Start New Session" Prominent in Peer Connect

### Problem
The "+" button to start a new chat is small and easy to miss. When all sessions are completed, users see old conversations but no obvious way to start a new one. The right panel's empty state says "start a new chat" as text but has no actionable button.

### Changes

#### 1. Desktop (`src/pages/dashboard/PeerConnect.tsx`)
- **Right panel empty state**: Add a prominent "New Chat" button (not just text) that triggers `setShowNewChat(true)` for students
- **Right panel when viewing a completed session**: Add a "Start New Chat" button below the "This session has ended" bar so users can immediately start fresh
- **Auto-open new chat panel** when there are no active/pending sessions and user is a student — set `showNewChat` to default `true` if no open sessions exist

#### 2. Mobile (`src/components/mobile/MobilePeerConnect.tsx`)
- **List view**: When all sessions are completed, add a prominent "Start New Chat" button/card above the session list (not just the small "+" icon)
- **Chat view "session ended" bar**: Add a "Start New Chat" button so users don't have to navigate back to list → tap "+"

#### 3. Hook cleanup (`src/hooks/usePeerConnect.ts`)
- No changes needed — the hook already exposes `hasOpenSession` correctly and all sessions in DB are properly `completed`

### Files Modified
- `src/pages/dashboard/PeerConnect.tsx` — Add CTA buttons, auto-show new chat panel
- `src/components/mobile/MobilePeerConnect.tsx` — Add prominent start buttons

