

## Plan: Implement Missing Change Document Items

After thorough comparison, most items are already implemented. Here are the gaps:

---

### 1. Remove "Red Extreme Text" from Profile (Section 10.2)
**Issue**: Profile.tsx (desktop) still has a red "Withdraw Consent" section with destructive red styling (lines 361-371). The change doc explicitly says to remove this.
**Fix**: Remove the red destructive-styled "Withdraw Consent" block from both `Profile.tsx` and verify `MobileProfile.tsx` (mobile doesn't have this block — confirmed clean).

**Files**: `src/pages/dashboard/Profile.tsx`

---

### 2. SPOC Dashboard — Show L3 Escalations with Escalation Level + Emergency Contact (Section 5.3)
**Issue**: The SPOC flags tab shows escalations but doesn't display the `escalation_level` or `trigger_snippet` columns that were added. L3 escalations should be prominently highlighted with emergency contact info.
**Fix**: Update the escalation list in `SPOCDashboardContent.tsx` flags tab to:
- Show `escalation_level` badge (L1/L2/L3) on each escalation
- Show `trigger_snippet` if present
- For L3 escalations, fetch and display emergency contact from `user_private` (via service role in an edge function, or display a "Contact shared" indicator)

**Files**: `src/components/spoc/SPOCDashboardContent.tsx`

---

### 3. Expert Dashboard — Escalation Should Store Time Slot (Section 4.1)
**Issue**: The expert escalation mutation doesn't include `trigger_timestamp` or the appointment's time slot in the escalation request.
**Fix**: When expert submits escalation, include the appointment's `slot_time` as `trigger_timestamp` in the escalation request insert.

**Files**: `src/components/expert/ExpertDashboardContent.tsx`

---

### 4. Dashboard Connect Section — Show Expert/Peer/BlackBox Together (Section 8.3)
**Issue**: The doc says "Connect button should include Expert connect, Peer connect and Blackbox - not single." Currently these are separate cards. The doc wants a grouped "Connect" section.
**Fix**: Group the three connect portals (Expert Connect, Peer Connect, BlackBox) under a single "Connect" heading on the student dashboard, making them visually grouped as sub-options of one section.

**Files**: `src/pages/dashboard/Dashboard.tsx`, `src/components/mobile/MobileDashboard.tsx`

---

### 5. Institutions = Schools Module (Section 9.1)
**Issue**: The doc says "Creating Schools same as Institutions" — this is already implemented via InstitutionManager. Just need to ensure the admin UI labels include "School / University" terminology.
**Fix**: Update `InstitutionManager.tsx` heading to say "Institutions / Schools" for clarity.

**Files**: `src/components/admin/InstitutionManager.tsx`

---

### Summary of Changes (~5 files)

| # | Change | File |
|---|--------|------|
| 1 | Remove red "Withdraw Consent" text | `Profile.tsx` |
| 2 | Show escalation_level + trigger_snippet in SPOC flags | `SPOCDashboardContent.tsx` |
| 3 | Store time slot in expert escalation | `ExpertDashboardContent.tsx` |
| 4 | Group connect portals under one section | `Dashboard.tsx`, `MobileDashboard.tsx` |
| 5 | Label institutions as "Schools / Universities" | `InstitutionManager.tsx` |

