

## Plan: Improve Reschedule Flow Visibility for Students & Admin

### Current State
The expert reschedule logic **already works** — experts can pick a new slot, enter a reason, and a notification is sent to the student. The admin sessions tab already shows reschedule info (original time, new time, reason, expert name). However:

1. **Student side**: The `useAppointments` hook doesn't fetch `reschedule_reason`, `rescheduled_from`, or `rescheduled_by` fields, so students see no indication that their appointment was rescheduled
2. **Student notification**: The notification is sent but the student's appointment card has no visual indicator of the reschedule
3. **Admin sessions**: Already shows reschedule details — but missing a student username in the reschedule info panel, and no admin "acknowledge/review" action

### Changes

#### 1. `src/hooks/useAppointments.ts` — Fetch reschedule fields
- Add `reschedule_reason`, `rescheduled_from`, `rescheduled_by` to the `Appointment` interface
- Update the select query to include these columns

#### 2. `src/pages/dashboard/Appointments.tsx` — Show reschedule banner on student side
- When an appointment has `reschedule_reason`, show an amber info banner below the appointment card with:
  - "Rescheduled by Dr. {expert}" 
  - Original time vs new time
  - Reason text

#### 3. `src/components/mobile/MobileAppointments.tsx` — Same reschedule banner for mobile

#### 4. `src/pages/admin/AdminDashboard.tsx` — Add student name + review button to reschedule info
- In the sessions tab reschedule panel, show the student's username alongside the expert name
- Add an "Acknowledged" / "Review" toggle button so admin can mark they've seen the reschedule

### Files Modified
- `src/hooks/useAppointments.ts` — Add reschedule fields to interface and query
- `src/pages/dashboard/Appointments.tsx` — Reschedule indicator on student appointment cards
- `src/components/mobile/MobileAppointments.tsx` — Same for mobile
- `src/pages/admin/AdminDashboard.tsx` — Student name in reschedule panel + review action

