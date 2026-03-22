

## Plan: Clean Up Roles & Credits Layout

### Problem
The "Roles & Credits" tab uses a `grid-cols-3` layout where `MemberManager` (left column) contains 5 stacked sections (Add Staff, Bulk Temp IDs, Temp Credential Pool, Members by University, Referral Codes) making it extremely tall, while `RoleManager` and `CreditGrantTool` (middle and right columns) are short — leaving large empty space and a messy look.

### Solution
Reorganize the grid into a **2-column layout** with better section distribution:

**Left column (wider):**
- Add Staff Member
- Bulk Temp ID Creation
- Temp Credential Pool
- Members by University

**Right column:**
- Assign Role
- Grant Credits
- Referral Codes

### Changes

**1. `src/components/admin/MemberManager.tsx`**
- Extract the Referral Codes section into its own exported component `ReferralCodesCard` (it's already a separate function internally — just wrap it in the card UI and export)
- Remove the Referral Codes card from MemberManager's return

**2. `src/pages/admin/AdminDashboard.tsx`**
- Change the roles tab from `grid-cols-3` to a 2-column layout
- Left column: `<MemberManager />`
- Right column: stack `<RoleManager />`, `<CreditGrantTool />`, `<ReferralCodesCard />`
- Use `lg:grid-cols-[2fr_1fr]` for proportional widths
- Add `self-start` to the right column so it doesn't stretch

### Files to modify
- `src/components/admin/MemberManager.tsx` — extract ReferralCodesCard as separate export
- `src/pages/admin/AdminDashboard.tsx` — reorganize grid layout

