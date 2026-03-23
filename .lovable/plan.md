

## Expert Reschedule, Notifications & Admin Session Tracking

### What We're Building

1. **Notifications table** — stores notifications for students (reschedule alerts) and experts (emergency case connection requests from therapist BlackBox escalations)
2. **Expert Dashboard — Notification Window** — shows emergency case connection requests escalated by therapists during BlackBox sessions (L3+ escalations where experts need to be informed)
3. **Expert Dashboard — Reschedule Dialog** — replaces the toast stub with a proper dialog: pick a new slot + enter a reason, updates the appointment with new time and reason
4. **Student Dashboard — Notification Window** — shows reschedule notifications with expert name, old time, new time, and reason
5. **Admin Sessions Tab — Reschedule Info** — shows rescheduled appointments with the reason given by the expert for admin assurance checks

---

### Database Changes (Migration)

**New table: `notifications`**
```sql
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,           -- 'reschedule', 'emergency_escalation', etc.
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- Users can view/update own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

**Alter `appointments` table** — add reschedule columns:
```sql
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS reschedule_reason text,
  ADD COLUMN IF NOT EXISTS rescheduled_from timestamptz,
  ADD COLUMN IF NOT EXISTS rescheduled_by uuid;
```

---

### File Changes

#### 1. New Hook: `src/hooks/useNotifications.ts`
- Query notifications for current user, sorted by newest
- Realtime subscription for live updates
- `markAsRead` mutation
- `markAllAsRead` mutation

#### 2. New Component: `src/components/notifications/NotificationBell.tsx`
- Bell icon with unread count badge
- Dropdown/popover listing notifications
- Used in both Expert and Student dashboards

#### 3. Expert Dashboard Updates (`ExpertDashboardContent.tsx` + `MobileExpertDashboard.tsx`)
- **Add NotificationBell** in header — shows emergency case escalation alerts from therapist BlackBox sessions
- **Replace Reschedule stub** (currently `toast.info("Reschedule request sent")`) with a dialog:
  - Dropdown to pick a new available slot from expert's own slots
  - Textarea for reschedule reason
  - On confirm: update appointment `slot_time`, `rescheduled_from`, `rescheduled_by`, `reschedule_reason` + insert notification for the student

#### 4. Student Appointments (`MobileAppointments.tsx` + `src/pages/dashboard/Appointments.tsx`)
- **Add NotificationBell** in header
- Notifications popover shows reschedule alerts with old/new time + reason

#### 5. Admin Sessions Tab (`AdminDashboard.tsx`)
- In the Sessions tab, for appointments that have `reschedule_reason`, show a "Rescheduled" badge + expandable row with: original time, new time, reason, expert name
- Add a filter option for "Rescheduled" sessions

#### 6. Expert L3 Alert → Notification
- When therapist triggers L3 emergency escalation in `ExpertL3AlertPanel.tsx`, also insert a notification for available experts with type `emergency_escalation`

---

### Technical Details

- Notifications use Supabase realtime for instant delivery
- Reschedule updates the existing appointment row (no new row) — stores `rescheduled_from` (old time) for audit trail
- Admin sees reschedule info via the existing appointments query in `useAdmin` — just needs the new columns in the select
- NotificationBell component is reusable across all dashboards

