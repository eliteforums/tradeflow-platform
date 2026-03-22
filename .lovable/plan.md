

## Plan: Admin Role Restrictions, BlackBox Entry Removal, Quest Cards & QR Fixes

### 1. Admin — Remove "Student" from Add Member roles

**Files:** `src/components/admin/MemberManager.tsx`, `supabase/functions/add-member/index.ts`

- Remove `{ value: "student", label: "Student" }` from the `ROLES` array (line 13)
- Change default `selectedRole` from `"student"` to `"intern"` (line 25)
- Remove `"student"` description from `getRoleDesc` (line 85)
- In the edge function, remove `"student"` from `validRoles` array (line 49)

### 2. Admin — Institution field logic by role

**File:** `src/components/admin/MemberManager.tsx`

- Make institution selector **required and visible only for SPOC** role
- For Expert, Intern, Therapist: hide the institution dropdown entirely (they are universal/cross-institution)
- Update the description text for each role to clarify:
  - Expert: "Universal — Appointments, session notes"
  - Intern: "Universal — Peer sessions, escalation flagging"
  - Therapist: "Universal — BlackBox queue, escalation, session notes"
  - SPOC: "Institution-specific — QR onboarding, credits, analytics"

**File:** `supabase/functions/add-member/index.ts`
- When role is not SPOC, ignore/nullify `institution_id` to enforce universality

### 3. BlackBox — Remove "Add Entry" section

**Files:** `src/pages/dashboard/BlackBox.tsx`, `src/components/mobile/MobileBlackBox.tsx`

- Remove the entire "New Entry" form block (lines 100-115 in desktop, lines 89-111 in mobile)
- Remove the "Your Entries" list and related state/hooks (`newEntry`, `setNewEntry`, `isPrivate`, `showEntries`, `createEntry`, `deleteEntry`)
- Keep only: "Talk to Someone Now" (voice call), privacy notice, and crisis info
- BlackBox becomes purely a voice-call support channel with no text entry

### 4. Quest Cards — Verify working

Quest Cards page and hook are already functional. The `useQuests` hook queries `quest_cards` and `quest_completions` correctly, and ECC rewards are wired via `credit_transactions` (which now has the correct RLS from the previous fix). No code changes needed — already working.

### 5. QR Onboarding — Verify flow

The flow is: `/institution-code` → verify code → `/qr-scan` → enter/scan SPOC QR → validate via edge function → `/register`.

The QR scan page sends the raw JSON payload to `validate-spoc-qr`, which expects a JSON-stringified object with HMAC signature. The manual code entry expects users to paste the full JSON — this is not user-friendly. 

**Fix:** Update `QRScan.tsx` to also support plain institution codes (fallback) so the flow doesn't break if users enter the institution code instead of QR JSON. The validate function already handles errors gracefully. No edge function changes needed — the flow works as designed for SPOC-generated QR payloads.

### Summary of Changes

| File | Change |
|------|--------|
| `src/components/admin/MemberManager.tsx` | Remove Student role, default to Intern, show institution only for SPOC |
| `supabase/functions/add-member/index.ts` | Remove "student" from valid roles, nullify institution_id for non-SPOC |
| `src/pages/dashboard/BlackBox.tsx` | Remove "New Entry" form and "Your Entries" list |
| `src/components/mobile/MobileBlackBox.tsx` | Same — remove entry form and entries list |

No changes needed for Quest Cards (already working) or QR flow (working as designed).

