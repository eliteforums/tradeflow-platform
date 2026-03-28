

## Fix: APAAR ID Verification — Actual Backend Verification

### Problem

The `handleVerifyStudentId` function in both `Profile.tsx` and `MobileProfile.tsx` does **not** call the `verify-student-id` edge function. Instead, it simply stores the raw student ID into `user_private.student_id_encrypted` and marks it as "verified" locally — no actual verification against the institution database occurs.

Additionally, after verification, the `is_verified` flag on the `profiles` table is never updated, so the user's status remains "Pending" even if their APAAR ID is valid.

### Fix

Replace the current `handleVerifyStudentId` in both files with a proper flow:

1. **Call `verify-student-id` edge function** with the user's `institution_id`, `id_type` (apaar or erp based on institution type), and the entered student ID
2. **If verified = true**: 
   - Update `user_private` with verification flags (`apaar_verified: true` or `erp_verified: true`), set raw ID fields to null
   - Update `profiles.is_verified = true`
   - Refresh the profile context
   - Show success toast: "Verified"
3. **If verified = false**:
   - If `reason = "no_records"`: allow pass-through (institution hasn't uploaded IDs yet)
   - If `reason = "not_found"`: show "ID not found" error, keep `is_verified = false`
   - If `reason = "already_claimed"`: show "Already claimed" error
   - If `reason = "invalid_format"`: show format error message
4. **Never store raw APAAR/ERP ID** — only store boolean verification flags

### Technical Details

Both `Profile.tsx` (desktop, line 94-115) and `MobileProfile.tsx` (mobile, line 77-90) need the same logic change:

```typescript
const handleVerifyStudentId = async () => {
  if (!user || !studentId.trim() || studentId === "••••••••") return;
  setIsVerifyingId(true);
  try {
    const institutionId = profile?.institution_id;
    if (!institutionId) { toast.error("No institution linked"); return; }
    
    // Determine ID type from institution
    const { data: inst } = await supabase
      .from("institutions").select("institution_type").eq("id", institutionId).single();
    const idType = inst?.institution_type === "school" ? "erp" : "apaar";
    
    // Call verify-student-id edge function
    const { data, error } = await supabase.functions.invoke("verify-student-id", {
      body: { institution_id: institutionId, id_type: idType, student_id: studentId.trim() }
    });
    
    if (error) throw error;
    
    if (data.verified) {
      // Update verification flags (no raw ID stored)
      await supabase.from("user_private").upsert({
        user_id: user.id,
        [idType === "apaar" ? "apaar_verified" : "erp_verified"]: true,
        student_id_encrypted: null,
        apaar_id_encrypted: null,
        erp_id_encrypted: null,
      }, { onConflict: "user_id" });
      
      // Mark profile as verified
      await supabase.from("profiles").update({ is_verified: true }).eq("id", user.id);
      await refreshProfile();
      setIdVerified(true);
      setStudentId("••••••••");
      toast.success("ID verified successfully");
    } else if (data.reason === "no_records") {
      // Institution hasn't uploaded IDs — pass through
      await supabase.from("profiles").update({ is_verified: true }).eq("id", user.id);
      await refreshProfile();
      setIdVerified(true);
      toast.info(data.message);
    } else {
      toast.error(data.message || "Verification failed");
    }
  } catch (e: any) { toast.error(e.message); }
  finally { setIsVerifyingId(false); }
};
```

Also need to **claim the ID** on successful verification — currently `verify-student-id` only checks but doesn't claim. The claiming should happen via a second call or by extending the edge function. Since `activate-account` already handles claiming during onboarding, for post-onboarding verification from Profile we need to add a claim step. This means updating the edge function to accept an optional `claim_for_user_id` parameter.

### Files to Edit

| File | Change |
|------|--------|
| `src/pages/dashboard/Profile.tsx` | Replace `handleVerifyStudentId` with edge function call + proper verification flow |
| `src/components/mobile/MobileProfile.tsx` | Same replacement for mobile |
| `supabase/functions/verify-student-id/index.ts` | Add optional `claim_for_user_id` param to claim the ID atomically on verification |

