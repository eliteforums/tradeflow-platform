

## Plan: Add Emergency Case Alert Window for SPOC Dashboard

### Problem
When a therapist escalates an emergency during a BlackBox session, the SPOC only sees it via the small notification bell or by manually checking the Flags tab. There is no prominent, real-time emergency alert window that demands immediate attention.

### Approach
Create a new `EmergencyAlertOverlay` component that listens for critical escalation notifications in real-time and displays a full-screen-style urgent alert dialog with emergency contact details, student info, and action buttons. This overlay will render inside `SPOCDashboardContent` and the admin dashboard.

### Changes

#### 1. New Component: `src/components/notifications/EmergencyAlertOverlay.tsx`
- Subscribe to realtime `INSERT` on `escalation_requests` where `status = 'critical'`
- When a critical escalation arrives, show a modal/dialog with:
  - Red pulsing header: "EMERGENCY CASE"
  - Student username and Eternia ID (from `trigger_snippet`)
  - Emergency contact name, phone, relation (from `trigger_snippet`)
  - Escalation reason / transcript snippet
  - Session timestamp
  - Action buttons: "Acknowledge", "Call Emergency Contact" (tel: link), "View in Flags Tab"
- Play an alarm-style sound (longer/louder than regular notification chime)
- Auto-dismiss only on explicit acknowledgment (not on click-outside)

#### 2. `src/components/spoc/SPOCDashboardContent.tsx`
- Import and render `EmergencyAlertOverlay` at the top of the component
- Pass a callback to navigate to the Flags tab on "View Details"

#### 3. `src/pages/admin/AdminDashboard.tsx`
- Also render `EmergencyAlertOverlay` so admins see emergency alerts too

### Technical Details
- Parse `trigger_snippet` JSON from the escalation row to extract emergency contact, student info, and transcript
- Realtime channel filters on `escalation_requests` INSERT events with status check in handler
- Alert sound uses Web Audio API with a more urgent pattern (alternating frequencies, longer duration) than the regular notification chime
- Dialog uses `AlertDialog` from shadcn with `onOpenChange` prevented until acknowledged
- Acknowledged state stored locally to prevent re-showing on component remount (tracked by escalation ID)

### Files
- `src/components/notifications/EmergencyAlertOverlay.tsx` — New component
- `src/components/spoc/SPOCDashboardContent.tsx` — Add overlay
- `src/pages/admin/AdminDashboard.tsx` — Add overlay

