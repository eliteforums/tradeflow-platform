

# Plan: Fix Expert/Intern/BlackBox Modules & Verification Issues

## Issues Identified

### 1. Expert Verification Badge Issue
The admin panel shows "Unverified" for experts. The `ExpertManager` component has toggle buttons for `is_verified` and `is_active`, but newly added experts default to `is_verified = false`. The PRD states experts must be **verified** before they can take appointments. Currently, unverified experts still appear in the student's appointment booking list because `useAppointments` only filters by `role='expert'` and `is_active=true` — it does NOT check `is_verified`.

**Fix**: Filter experts by `is_verified = true` in `useAppointments.ts` query.

### 2. Expert Can't Manage Availability (No Slot Creation UI)
The Expert Dashboard shows slot counts but has **no UI to create availability slots**. Without slots, students can't book appointments. The PRD says "Expert availability is defined via a slot management system."

**Fix**: Add a slot creation form to `MobileExpertDashboard.tsx` and `ExpertDashboard.tsx` — date picker, start/end time, and a create button that inserts into `expert_availability`.

### 3. BlackBox Is Not a 24/7 On-Call Service
Per the PRD (Section 4.3), BlackBox is described as "a controlled anonymous interaction environment" — it should allow anonymous interaction sessions with professionals, not just text journaling. The user says it should use VideoSDK for calling.

**Fix**: Transform BlackBox from a journal-only tool into a dual-mode interface:
- Keep the existing text entry (anonymous expression)
- Add a "Talk Now" button that initiates a VideoSDK audio/video call to an available expert/therapist
- Use the existing `VideoCallModal` component

### 4. Peer Connect — VideoSDK Integration Already Works
The Peer Connect already has `VideoCallModal` integrated with phone/video buttons in the chat header. The chat messaging works via Supabase realtime. This module appears functional.

### 5. Appointments — VideoSDK Call Already Integrated  
The Appointments page already has a "Join" button that opens `VideoCallModal`. This appears functional.

### 6. Expert Dashboard — Missing Join Call Button
The Expert Dashboard shows upcoming appointments but has no way for the expert to **join the video/audio call**. Students can join from their side, but experts can't.

**Fix**: Add a "Join Call" button to each upcoming appointment in the Expert Dashboard.

### 7. Routing Issue — Experts Hitting Student Appointments Page
When an expert clicks "Appointments" in the bottom nav, they go to `/dashboard/appointments` which shows the **student** appointments view (book experts, see available slots). Experts should see their own dashboard or at least be redirected.

**Fix**: In the Appointments page, if the user's role is "expert", render the Expert Dashboard view instead of the student booking view.

## Files to Modify

### 1. `src/hooks/useAppointments.ts`
- Add `is_verified = true` filter to experts query

### 2. `src/components/mobile/MobileExpertDashboard.tsx`
- Add slot creation form (date, start time, end time)
- Add "Join Call" button to upcoming appointments using VideoCallModal

### 3. `src/pages/dashboard/ExpertDashboard.tsx`
- Add slot creation form
- Add "Join Call" button using VideoCallModal

### 4. `src/components/mobile/MobileBlackBox.tsx`
- Add "Talk Now" button for anonymous audio/video calls via VideoSDK
- Keep existing text entry functionality

### 5. `src/pages/dashboard/BlackBox.tsx`
- Same changes as mobile — add "Talk Now" call option

### 6. `src/pages/dashboard/Appointments.tsx`
- If user role is "expert", redirect to `/dashboard/expert` or show expert view

### 7. `src/components/mobile/MobileAppointments.tsx`
- Same expert-role handling

## Technical Details

- **Slot creation**: Insert into `expert_availability` table with `expert_id`, `start_time`, `end_time`. RLS policy "Experts can manage own availability" already allows this.
- **BlackBox calls**: Use `createVideoSDKRoom()` from `src/lib/videosdk.ts` to create a room, then open `VideoCallModal`. This gives anonymous 1-on-1 calling.
- **Expert verification filter**: Add `.eq("is_verified", true)` to the experts query in `useAppointments`.
- **Expert call join**: Add `VideoCallModal` import and state to expert dashboards, with a join button per appointment.

