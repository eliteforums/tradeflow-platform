

## Plan: Secure APAAR ID — Hash Before Storage, Never Store Raw

### Problem
Currently the system stores raw APAAR/ERP IDs in multiple places:
1. **`user_private.apaar_id_encrypted`** — stores the raw ID after verification (line 138 of `activate-account`)
2. **`user_private.student_id_encrypted`** — also stores raw ID (line 136)
3. **`institution_student_ids.student_id_hash`** — named "hash" but actually stores plaintext (SPOC uploads raw IDs)
4. **`verify-student-id`** edge function — compares raw plaintext, no hashing

Per PRD: convert to secure token format, verify, then store ONLY verification status (Yes/No). Never persist the raw ID.

### Changes

#### 1. `supabase/functions/verify-student-id/index.ts` — Hash before lookup
- Import a hashing utility (SHA-256 via Web Crypto API)
- Hash the incoming `student_id` with a salt before comparing against `institution_student_ids.student_id_hash`
- The salt will be a constant derived from the institution_id (deterministic so SPOC uploads and student verification produce the same hash)

#### 2. `src/components/spoc/StudentIdVerificationSection.tsx` — Hash IDs on upload
- Before inserting into `institution_student_ids`, hash each ID using the same SHA-256 scheme (via a new edge function or client-side Web Crypto)
- Since we need the same hash on both client (SPOC upload) and server (verification), use a shared hashing approach
- Better approach: create a small edge function `hash-student-id` that both upload and verify use, OR hash client-side with Web Crypto (simpler)
- Display masked IDs in the table (e.g., `****5678`) instead of full hashes

#### 3. `supabase/functions/activate-account/index.ts` — Stop storing raw IDs
- Line 136: Set `student_id_encrypted: null` (don't store raw ID)
- Line 138-139: Set `apaar_id_encrypted: null` and `erp_id_encrypted: null`
- Only store the boolean verification flags: `apaar_verified: true/false`, `erp_verified: true/false`
- Hash the student_id before looking it up in `institution_student_ids` (same hash as verify-student-id)

#### 4. Shared hashing utility
Create a simple SHA-256 hashing function used by both edge functions and the SPOC upload component:
- Edge functions: use Deno's `crypto.subtle.digest`
- Client: use `window.crypto.subtle.digest`
- Salt format: `eternia:${institution_id}:${id_type}:${raw_id}` → SHA-256 → hex string

#### 5. Migration — Hash existing plaintext IDs
- A one-time migration script (edge function or SQL) to hash any existing plaintext values in `institution_student_ids.student_id_hash`
- Clear any existing `apaar_id_encrypted` / `erp_id_encrypted` / `student_id_encrypted` values in `user_private`

### Files Modified
- `supabase/functions/verify-student-id/index.ts` — Hash input before DB lookup
- `supabase/functions/activate-account/index.ts` — Stop storing raw IDs, hash before lookup
- `src/components/spoc/StudentIdVerificationSection.tsx` — Hash IDs before upload, mask display
- New shared hash logic (inline in each file using Web Crypto API)

### Technical Details
- SHA-256 via Web Crypto is available in both Deno (edge functions) and browsers (SPOC upload)
- Salt includes `institution_id` + `id_type` to prevent cross-institution hash collisions
- The `student_id_hash` column name already implies hashing — we're making it actually hashed
- After this change, raw APAAR IDs exist only transiently in memory during verification, never persisted

