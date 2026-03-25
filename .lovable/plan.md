

## Plan: Update README with Comprehensive Content & License

### What Needs Updating

The README is outdated in several areas after recent development. Here's what changes:

### Content Updates

#### 1. Remove Device Binding References
- Line 67: Remove "Device-bound sessions" from Key Differentiators
- Line 193-194: Remove "Device Binding" row from Privacy & Security table
- Line 200: Remove "JWT Rotation" device sessions reference
- Line 309: Remove `useDeviceValidation.ts` from hooks list
- Line 320: Remove `deviceFingerprint.ts` from lib list
- Line 353: Remove `reset-device` from edge functions list
- Line 391: Remove `device_sessions` table from schema
- Lines 455-469: Remove "Device Bind" and "device fingerprint" from onboarding flow diagram

#### 2. Update AI Section
- Architecture table line 82: Change "Groq API" to "Lovable AI Gateway (Gemini/GPT models)" for ai-transcribe; keep Groq for ai-moderate
- Line 83: Update "Real-time Audio Monitoring" to mention AI Suggestion Popup system
- Add new subsection under AI-Powered Safety describing the interactive popup (Dismiss/Escalate), human-in-the-loop control
- Line 117: Replace "automatic escalation triggers" with "interactive suggestion popup for human review"

#### 3. Update Edge Functions List
- Remove: `cleanup-deleted-accounts`, `delete-account`, `reset-device`
- Add: `recover-password`, `get-recovery-hints`, `escalate-emergency`, `verify-student-id`
- Update `ai-transcribe` description to mention risk analysis + suggestion system
- Update `spend-credits` description to mention atomic RPC

#### 4. Update Security Section
- Line 228: Change `getClaims()` to `getUser()` for JWT validation
- Add `spend_credits_atomic` to database functions table
- Update account deletion to "request-only" (no self-service deletion)

#### 5. Add Forgot Password Flow
- New subsection under Onboarding showing the recovery flow: enter username → answer hint questions + emoji pattern → set new password

#### 6. Update APAAR/Student ID Section
- Mention SHA-256 hashing of IDs before storage
- Only verification status stored, never raw IDs

#### 7. Update ECC Economy
- Add refund logic documentation (BlackBox cancel, appointment cancel, peer expiry)
- Add duplicate refund prevention
- Add GPay/UPI mention under Razorpay

#### 8. Update Recent Updates Section
- Add entries for: AI Suggestion Popup, Forgot Password, APAAR hashing, device binding removal, atomic ECC spending, escalation fixes, codebase audit fixes

#### 9. Fix License
- Fix typo: "eliteforms.in" → "eliteforums.in"
- Expand into a comprehensive proprietary license with explicit clauses for:
  - Intellectual property ownership
  - Restrictions on reverse engineering, decompilation
  - Confidentiality obligations
  - Termination conditions
  - Governing law (India)
  - DPDP Act compliance statement
- Also create a separate `LICENSE` file with the full legal text

#### 10. Update Environment Variables
- Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to secrets table

### Files Modified
- `README.md` — Full rewrite with all updates above
- `LICENSE` — New comprehensive proprietary license file

### No Database or Code Changes
This is documentation only.

