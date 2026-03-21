

## Plan: Database-Driven Training Modules with Admin Management

### Problem
Training modules are hardcoded in both `InternDashboardContent.tsx` (7 detailed modules) and `MobileInternDashboard.tsx` (duplicate). Superadmins cannot add, edit, reorder, or remove modules without code changes.

### Solution

#### 1. Database — `training_modules` table

Create a new table to store modules with all current fields:

```sql
CREATE TABLE public.training_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number integer NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  duration text NOT NULL DEFAULT '30 min',
  objectives jsonb NOT NULL DEFAULT '[]',
  content text NOT NULL DEFAULT '',
  has_quiz boolean NOT NULL DEFAULT false,
  quiz_questions jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;

-- Everyone can read active modules
CREATE POLICY "Anyone can view active training modules"
  ON public.training_modules FOR SELECT TO authenticated
  USING (is_active = true);

-- Only admins can manage
CREATE POLICY "Admins can manage training modules"
  ON public.training_modules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

Seed the 7 existing modules into the table via INSERT.

#### 2. Admin Panel — New "Training" Tab

Add a `"training"` tab to the admin dashboard (desktop + mobile) with:
- List of all modules ordered by `day_number`
- Add/Edit module dialog with fields: title, description, duration, content (textarea), objectives (comma-separated or line-separated), quiz toggle, quiz questions editor
- Reorder (change day_number), toggle active/inactive, delete
- Only visible to superadmins

**Files**: `src/pages/admin/AdminDashboard.tsx`, `src/components/mobile/MobileAdminDashboard.tsx`, new `src/components/admin/TrainingModuleManager.tsx`

#### 3. Intern Dashboard — Fetch from DB

Replace hardcoded `TRAINING_MODULES` / `MODULES` arrays with a `useQuery` that fetches from `training_modules` table ordered by `day_number`. Both desktop and mobile components share the same query shape.

**Files**: `src/components/intern/InternDashboardContent.tsx`, `src/components/mobile/MobileInternDashboard.tsx`

### Summary

| # | Change | Files |
|---|--------|-------|
| 1 | Create `training_modules` table + seed data | DB migration |
| 2 | Admin TrainingModuleManager component | New `TrainingModuleManager.tsx` |
| 3 | Add Training tab to admin dashboards | `AdminDashboard.tsx`, `MobileAdminDashboard.tsx` |
| 4 | Fetch modules from DB in intern dashboards | `InternDashboardContent.tsx`, `MobileInternDashboard.tsx` |

