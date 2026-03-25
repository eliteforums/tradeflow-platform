

## APAAR ID Verification — Current State Analysis

All four requirements are **already fully implemented**. Here's the mapping:

### 3.1 User Flow — Already Done
- `Register.tsx` line 63-116: Student enters APAAR ID, clicks "Verify", system calls `verify-student-id` edge function

### 3.2 Backend Logic — Already Done
- `verify-student-id/index.ts`: Hashes the entered ID with SHA-256, checks against `institution_student_ids` table (the institution's uploaded database), returns `verified: true` or `verified: false` with reason
- `activate-account/index.ts` lines 114-136: Double-checks verification during account activation, marks the ID as claimed

### 3.3 Storage Logic — Already Done
- `activate-account/index.ts` lines 138-151: Stores **only** `apaar_verified: true/false` and `erp_verified: true/false`. Raw ID fields are explicitly set to `null`:
  ```
  student_id_encrypted: null,
  apaar_id_encrypted: null,
  erp_id_encrypted: null,
  ```
- `institution_student_ids` table stores only SHA-256 hashes, never raw IDs
- The SPOC upload component (`StudentIdVerificationSection.tsx`) hashes IDs client-side before inserting

### 3.4 Output — Already Done
- Verified → student proceeds with registration
- Not verified → denied with specific error ("not found", "already claimed", "invalid format")

### Conclusion
No code changes needed. The APAAR ID verification system matches all specified requirements.

