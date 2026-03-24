

## Plan: Add APAAR/ERP ID Management to Institution Panel

### Problem
Per PRD Section 3.3, student verification requires checking APAAR/ABC IDs (universities) or ERP IDs (schools) against the institution's records. Currently:
- No table exists to store valid institution student IDs
- No UI on SPOC or Admin panel to upload/manage valid IDs
- Verification during onboarding is just format-based, not checked against real data
- SPOC has no visibility into student verification status

### Changes

#### 1. Database Migration — Create `institution_student_ids` table
```sql
CREATE TABLE public.institution_student_ids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  id_type text NOT NULL CHECK (id_type IN ('apaar', 'erp')),
  student_id_hash text NOT NULL,
  is_claimed boolean NOT NULL DEFAULT false,
  claimed_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, id_type, student_id_hash)
);
```
With RLS policies for admin (full access) and SPOC (select/insert/update for their institution).

#### 2. SPOC Dashboard — New "Student Verification" section in Onboarding tab
**File:** `src/components/spoc/SPOCDashboardContent.tsx`

Add to the Onboarding tab:
- **Upload valid IDs**: A textarea or CSV upload where the SPOC can paste a list of valid APAAR/ERP IDs (one per line or comma-separated)
- These get hashed and stored in `institution_student_ids`
- **Verification status table**: Show student list with columns: Username, ID Type (APAAR/ERP), Verified (yes/no), Claimed (yes/no)
- **Stats cards**: Total IDs uploaded, Claimed count, Unclaimed count
- Auto-detect ID type based on `institution.institution_type` (university = APAAR, school = ERP)

#### 3. Admin Panel — Institution Detail View update
**File:** `src/components/admin/InstitutionDetailView.tsx`

Add a section showing:
- Count of uploaded valid IDs per institution
- Verified vs unverified student ratio
- Ability to bulk-upload IDs (same as SPOC)

#### 4. Update `activate-account` edge function — Verify against institution records
**File:** `supabase/functions/activate-account/index.ts`

During account activation, when a student provides their APAAR/ERP ID:
- Hash the ID and check it against `institution_student_ids` for that institution
- If found and unclaimed: mark `is_claimed = true`, `claimed_by = userId`, set `apaar_verified` or `erp_verified` to `true`
- If not found: still allow account creation but leave verification as `false` (student can verify later)
- If already claimed: return error "This ID has already been used"

#### 5. Student profile — Show verification status
**File:** `src/pages/dashboard/Profile.tsx` (or `MobileProfile.tsx`)

Show a badge indicating APAAR/ERP verification status on the student's profile page.

### Files Modified
- Database migration — New `institution_student_ids` table + RLS
- `src/components/spoc/SPOCDashboardContent.tsx` — ID upload UI + verification status view
- `src/components/admin/InstitutionDetailView.tsx` — ID management section
- `supabase/functions/activate-account/index.ts` — Verify student ID against institution records
- `src/pages/dashboard/Profile.tsx` — Show verification badge

