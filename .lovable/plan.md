

## Plan: Add Therapist Role Support + Missing PRD Gaps

### Problem
1. **Therapist role missing from admin tools** — MemberManager ROLES list, RoleManager ASSIGNABLE_ROLES, and `add-member` edge function all lack "therapist" as a valid role
2. **DashboardLayout has no therapist nav** — users with `role=therapist` fall through to student nav
3. **Several minor PRD alignment gaps** remain

### Changes

| # | File | Change |
|---|------|--------|
| 1 | `supabase/functions/add-member/index.ts` | Add `"therapist"` to `validRoles` array (line 47) |
| 2 | `src/components/admin/MemberManager.tsx` | Add `{ value: "therapist", label: "Therapist" }` to ROLES array + add description in `getRoleDesc` |
| 3 | `src/components/admin/RoleManager.tsx` | Add `{ value: "therapist", label: "Therapist" }` to ASSIGNABLE_ROLES |
| 4 | `src/components/layout/DashboardLayout.tsx` | Add therapist nav items (same as intern: Dashboard → `/dashboard/therapist`, Queue, Profile) and handle `role === "therapist"` in nav selection logic |
| 5 | `src/App.tsx` | Add `/dashboard/therapist` also accessible for therapist role in ProtectedRoute (already done in prior change — verify) |

### Technical Details

**1. Edge function (`add-member`)** — Line 47:
```typescript
const validRoles = ["student", "intern", "expert", "spoc", "therapist"];
```

**2. MemberManager** — Add to ROLES array:
```typescript
{ value: "therapist", label: "Therapist" },
```
And in `getRoleDesc`:
```typescript
therapist: "BlackBox queue, escalation, session notes",
```

**3. RoleManager** — Add to ASSIGNABLE_ROLES:
```typescript
{ value: "therapist", label: "Therapist" },
```

**4. DashboardLayout** — Add therapist-specific nav arrays and map `role === "therapist"` to them:
```typescript
const therapistNavItems = [
  { icon: Headphones, label: "Queue", path: "/dashboard/therapist" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
];
const therapistBottomNavItems = [
  { icon: Headphones, label: "Queue", path: "/dashboard/therapist" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
];
```
Then in the nav selection:
```typescript
if (role === "therapist") return therapistNavItems;
```

**5. App.tsx route** — Already updated to `allowedRoles={["intern", "therapist"]}` in prior change. No action needed.

### Summary
5 files touched. Core change: therapist becomes a first-class role that can be created/assigned via admin, and gets its own navigation pointing to the BlackBox Queue dashboard.

