

## Fix: SPOC/Institutions Tab UI Clipping

### Problem
The SPOC tab uses a `grid-cols-1 lg:grid-cols-3` layout, giving InstitutionManager 2/3 width and RoleManager 1/3. The institution cards cram too many elements into a single flex row (name, plan badge, stats, eternia code, Bulk IDs button, Details button, active toggle), causing overflow/clipping at that constrained width.

### Fix

**File: `src/pages/admin/AdminDashboard.tsx`** (lines 401-411)
- Change the SPOC tab grid from `lg:grid-cols-3` with `lg:col-span-2` to a wider split: `lg:grid-cols-[1fr_320px]` so InstitutionManager gets most of the space and RoleManager gets a fixed-width sidebar.

**File: `src/components/admin/InstitutionManager.tsx`** (lines 282-379)
- Restructure the institution card internal layout from a single horizontal flex row to a two-row layout:
  - **Row 1**: Logo + Name/Type + Plan badge + Stats (students, credits, date)
  - **Row 2**: Eternia code (with copy) + Action buttons (Bulk IDs, Details) + Active toggle
- This prevents horizontal overflow at any reasonable container width.
- On smaller screens, both rows already stack naturally via `flex-wrap`.

### No database or backend changes needed.

