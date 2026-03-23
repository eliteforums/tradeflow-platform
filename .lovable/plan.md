

## Fix: SPOC Dashboard Emergency Contact Visibility

### Problem
When an expert escalates a BlackBox session (L3), the emergency contact info IS stored in the `escalation_requests.trigger_snippet` column and the SPOC Flags tab already has UI to parse and display it (lines 851-900). However:

1. **No notification sent to SPOC** — the escalation code (ExpertL3AlertPanel.tsx line 156-177) only inserts notifications for other experts, not the SPOC. The SPOC relies solely on realtime subscription toast, which is ephemeral.
2. **Missing "critical" status config** — `statusConfig` (line 382) lacks a `"critical"` entry, so L3 escalations with `status: "critical"` fall back to "pending" styling instead of showing a red critical badge.

### Changes

#### 1. `src/components/expert/ExpertL3AlertPanel.tsx`
- After inserting expert notifications (line 177), also insert a notification for the SPOC with `type: "emergency_escalation"`, including the emergency contact details in `metadata`

#### 2. `src/components/spoc/SPOCDashboardContent.tsx`
- Add `"critical"` to `statusConfig` (line 382) with destructive red styling and an appropriate icon
- Add NotificationBell to the SPOC dashboard header so the SPOC can see emergency escalation notifications persistently

### Technical Details
- No database changes needed — notifications table already exists with correct RLS
- SPOC notification will include emergency contact name/phone/relation in metadata for quick visibility without navigating to Flags tab
- The Flags tab emergency contact display (lines 851-900) is already correct and will continue working

