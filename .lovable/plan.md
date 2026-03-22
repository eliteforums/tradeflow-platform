

## Plan: Fix Intern Dashboard — Interview Flow, Verified Badge, and Remove BlackBox Queue

### Summary
Three changes: (1) Show a meeting link on Day 7 instead of just "Expert scheduled", (2) Admin can verify interns to unlock Peer Connect, (3) Remove BlackBox Queue from intern nav.

### Current State
- Day 7 shows "Expert scheduled" text but no meeting link
- `is_verified` field exists on profiles and is already used for experts
- `training_status` goes to `interview_pending` after completing modules 1-6
- BlackBox Queue appears in intern sidebar nav at `DashboardLayout.tsx` line 62
- Peer Connect unlocks when `trainingStatus === "active" || "completed"` — but there's no admin action to set this after the interview

### Changes

**1. Remove BlackBox Queue from intern nav (`src/components/layout/DashboardLayout.tsx`)**
- Remove the `{ icon: Headphones, label: "BlackBox Queue", path: "/dashboard/therapist" }` entry from `internNavItems` (line 62)

**2. Day 7 interview meeting link (`src/components/intern/InternDashboardContent.tsx` + `MobileInternDashboard.tsx`)**
- When Day 7 is the next module (all 6 prior completed, status is `interview_pending`):
  - Show a card with "Final Interview" explanation
  - Display a message: "Your expert will share a meeting link. Once the interview is complete and approved, your dashboard will be unlocked."
  - Show the intern's `is_verified` status — if verified, show a success state
- When admin sets `is_verified = true` AND `training_status = "active"`, the dashboard unlocks automatically (existing logic already handles this)

**3. Admin intern verification flow (`src/components/admin/MemberManager.tsx`)**
- For intern-role members with `training_status = "interview_pending"`, show a "Verify & Activate" button
- Clicking it updates the profile: `{ is_verified: true, training_status: "active" }`
- This unlocks Peer Connect on the intern's end (existing condition `trainingStatus === "active"` already handles tab unlocking)

### Files to modify
- `src/components/layout/DashboardLayout.tsx` — Remove BlackBox Queue from `internNavItems`
- `src/components/intern/InternDashboardContent.tsx` — Update Day 7 display with interview info card, show verified badge state
- `src/components/mobile/MobileInternDashboard.tsx` — Same Day 7 changes for mobile
- `src/components/admin/MemberManager.tsx` — Add verify/activate button for interview-pending interns

### No database changes needed
- `is_verified` and `training_status` columns already exist on `profiles`
- Existing RLS policies allow admin updates

