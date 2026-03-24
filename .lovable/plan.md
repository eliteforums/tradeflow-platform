

## Plan: Remove Device Binding & Replace Account Deletion with Deletion Request

### 9.1 Remove Device Binding

The device binding system blocks students from logging in on unrecognized devices. Remove it entirely.

**Files to modify:**
- **`src/components/ProtectedRoute.tsx`** — Remove `useDeviceValidation` import and usage, remove the "Unrecognized Device" blocking screen (lines 57-72)
- **`src/hooks/useDeviceValidation.ts`** — Delete entire file
- **`src/lib/deviceFingerprint.ts`** — Delete entire file
- **`supabase/functions/reset-device/index.ts`** — Delete entire edge function (SPOC device reset is no longer needed)

No database migration needed — the `device_id_encrypted` column in `user_private` can stay (harmless), and no code will read/write it anymore.

### 9.2 Replace Account Deletion with Deletion Request Only

Currently `AccountDeletion` component lets users type "DELETE" and schedule full account deletion (30-day grace period + auto-cleanup). Replace this with a simple "Request Deletion" flow that only notifies the SPOC/admin — no self-service deletion.

**Files to modify:**
- **`src/components/admin/AccountDeletion.tsx`** — Replace the current self-service deletion logic with:
  - A "Request Account Deletion" button
  - On click: insert a notification to the user's institution SPOC (type `"deletion_request"`) with the user's ID and username
  - Show confirmation: "Your deletion request has been sent to your institution coordinator"
  - Remove the `deletion_requested_at` profile update, the cancel flow, and the countdown timer
  - Keep the DPDP information text for transparency
- **No changes needed** to where `AccountDeletion` is rendered (Profile, MobileProfile, AdminDashboard, MobileAdminDashboard) — the component stays, just simplified

The `cleanup-deleted-accounts` edge function and `deletion_requested_at` column remain in the database but become unused (safe to keep).

### Files Modified
- `src/components/ProtectedRoute.tsx` — Remove device validation
- `src/components/admin/AccountDeletion.tsx` — Replace with deletion request notification
- `src/hooks/useDeviceValidation.ts` — Delete
- `src/lib/deviceFingerprint.ts` — Delete
- `supabase/functions/reset-device/index.ts` — Delete

