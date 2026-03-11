

# Therapist BlackBox Model — Implementation Plan

## Summary

The PRD defines a **Therapist Dashboard** as a queue-based interface (like an emergency helpline). Students request anonymous support from BlackBox, therapists see requests in a queue, accept them, and connect via audio-only sessions with escalation capabilities.

Currently, BlackBox just creates standalone VideoSDK rooms with no queue/matching system. This needs a complete rework of the therapist-facing side and the student-side "Talk to Someone" flow.

## Database Changes

**New table: `blackbox_sessions`** — tracks the queue and session lifecycle:

```sql
CREATE TABLE public.blackbox_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  therapist_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'queued',  -- queued, accepted, active, escalated, completed, cancelled
  room_id text,
  flag_level integer NOT NULL DEFAULT 0,  -- 0-3 escalation levels
  escalation_reason text,
  escalation_history jsonb DEFAULT '[]',
  session_notes_encrypted text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blackbox_sessions ENABLE ROW LEVEL SECURITY;
```

RLS policies:
- Students can INSERT (own `student_id`) and SELECT (own sessions)
- Experts/therapists can SELECT queued sessions + sessions assigned to them
- Experts can UPDATE sessions assigned to them (accept, complete, escalate)

Add `'therapist'` to the `app_role` enum if not already present (currently: admin, moderator, user — but project uses student, intern, expert, spoc, admin). Need to verify and add if missing.

**Enable realtime** on `blackbox_sessions` so therapists see new queue items instantly.

## Architecture

```text
Student Side (BlackBox page)              Therapist Side (new dashboard)
┌──────────────────────┐                  ┌──────────────────────────┐
│ "Talk to Someone"    │                  │ Queue Tab                │
│ → Creates session    │──── queued ────→ │ - List of waiting        │
│   (status: queued)   │                  │   students (username,    │
│ → Waiting screen     │                  │   wait time, flag level) │
│                      │                  │ - Accept button          │
│                      │                  │                          │
│ Session accepted ←───│──── accepted ───│ → Creates VideoSDK room  │
│ → Joins audio room   │                  │ → Joins audio room       │
│                      │                  │                          │
│ Audio session window  │                  │ Active Session Tab       │
│ - Mute/End           │                  │ - Timer, Mute, End       │
│                      │                  │ - Flags (0-3 levels)     │
│                      │                  │ - Escalation button      │
│                      │                  │ - Session notes          │
└──────────────────────┘                  │                          │
                                          │ Escalation History Tab   │
                                          │ Profile Tab (essentials) │
                                          └──────────────────────────┘
```

## Component Changes

### 1. New: Therapist Dashboard (`src/pages/dashboard/TherapistDashboard.tsx`)
- Route: `/dashboard/therapist` (protected, role: `therapist`)
- 4 tabs per PRD: **Queue, Active Session, Escalation History, Profile**

**Queue Tab:**
- Real-time list of `blackbox_sessions` where `status = 'queued'`
- Each card: student username (anonymous), wait time, flag level indicator
- "Accept" button → sets `therapist_id`, status to `accepted`, creates VideoSDK room

**Active Session Tab:**
- Audio-only session via VideoSDK (webcam disabled)
- Session timer (elapsed time)
- Flag level indicator (0-3) with color coding
- Escalation button → opens reason dialog → submits escalation
- 3-level escalation model:
  - Level 1: Flag internally (monitoring)
  - Level 2: Alert institution SPOC (no identity)
  - Level 3: Critical — trigger live replacement to M.Phil expert
- Session notes textarea (encrypted)
- Mute / End Call buttons

**Escalation History Tab:**
- List of past escalated sessions with timestamps, reasons, outcomes

**Profile Tab (essentials):**
- Name, role, verification status
- Change password, logout buttons

### 2. Modified: Student BlackBox page (`src/pages/dashboard/BlackBox.tsx` + mobile)
- "Talk to Someone" section: remove Video Call option, keep only Voice Call
- On click: create a `blackbox_sessions` row with `status: 'queued'`
- Show waiting screen with queue position/animation
- Subscribe to realtime updates on the session row
- When status changes to `accepted` and `room_id` is set → auto-join audio room
- Session window: audio only, mute/end buttons

### 3. New hook: `useBlackBoxSession.ts`
- Manages session lifecycle (create, listen for acceptance, join room)
- Realtime subscription on `blackbox_sessions` table

### 4. Updated: `DashboardLayout.tsx`
- Add therapist nav items: Queue, Active Session, History, Profile

### 5. Updated: `App.tsx`
- Add route `/dashboard/therapist` with `allowedRoles={["therapist"]}`

### 6. Mobile variants
- `MobileTherapistDashboard.tsx` — same tabs, mobile layout
- Update `MobileBlackBox.tsx` — queue-based flow instead of direct call

## Escalation Flow (3-Level Active Crisis Model)

| Level | Action | System Response |
|-------|--------|----------------|
| 1 | Therapist flags session | Flag stored, monitoring continues |
| 2 | Therapist escalates to institution | SPOC notified (no identity), entry in `escalation_requests` |
| 3 | Critical escalation | Live session transfer to expert, room ID preserved, therapist removed, expert joins |

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/...blackbox_sessions.sql` | New table + RLS + realtime |
| `src/hooks/useBlackBoxSession.ts` | New hook for queue/session management |
| `src/pages/dashboard/TherapistDashboard.tsx` | New page (desktop/mobile switch) |
| `src/components/therapist/TherapistDashboardContent.tsx` | New — all 4 tabs |
| `src/components/mobile/MobileTherapistDashboard.tsx` | New — mobile layout |
| `src/pages/dashboard/BlackBox.tsx` | Modify — queue-based flow |
| `src/components/mobile/MobileBlackBox.tsx` | Modify — queue-based flow |
| `src/components/layout/DashboardLayout.tsx` | Add therapist nav |
| `src/App.tsx` | Add therapist route |

