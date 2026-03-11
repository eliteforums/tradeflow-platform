

# Eternia — PRD Gap Analysis & Implementation Plan

This is a large-scope request. To keep it manageable and avoid breaking things, I recommend splitting into **3 implementation batches**. Here is everything remaining from the PRD, organized by priority.

---

## Batch 1: Core Missing Features & Performance

### 1. ECC Stability Pool (PRD Section 21)
- **Missing**: 1 ECC/month auto-contribution per student, shared emergency pool for zero-balance students
- **Changes**: New `ecc_stability_pool` table, edge function for monthly contribution cron, modify credit spend logic to check pool when balance = 0

### 2. ECC Bundle Purchases (PRD Section 21)
- **Missing**: Razorpay integration for credit top-ups. Currently the "Add Credits" button is non-functional
- **Changes**: Edge function `purchase-credits` that creates Razorpay order, verifies payment, inserts credit_transaction. Update Credits page to trigger purchase flow

### 3. Intern Training Status Gate (PRD Section 19)
- **Missing**: Training status enum (NOT_STARTED → ACTIVE), locked Peer Connect until Day 7 approval
- **Changes**: Add `training_status` column to profiles or new `intern_training` table. Gate Peer Connect access in InternDashboardContent. Admin/SPOC can approve final interview

### 4. SPOC Dashboard — Missing Tabs (PRD Section 20)
- **Current**: Home, Onboarding, Flags, Reports, Profile
- **PRD requires**: Flags & Escalation tab with AI flags + escalation logs + M.Phil override records
- **Changes**: Enhance flags tab with escalation_requests join and blackbox AI flag data

### 5. Low Balance Prompt (PRD Section 21)
- **Current**: Shows on Dashboard and Credits page when < 5 ECC
- **PRD**: "Your care energy is low. Refill gently." — exact wording. Add as a persistent toast/banner across all pages
- **Changes**: Add global low-balance banner in DashboardLayout when creditBalance < 5

### 6. Performance & PWA Hardening
- **React.memo** on heavy list components (session feeds, member lists, chat messages)
- **Virtual scrolling** for long lists (member list in admin, session history) using CSS `content-visibility: auto`
- **Debounced search inputs** — ensure all search fields use 300ms debounce
- **Image/asset optimization** — lazy load non-critical images
- **Touch targets** — ensure all mobile buttons are minimum 44x44px
- **Skeleton loaders** — replace Loader2 spinners with skeleton placeholders on mobile for perceived speed
- **Service worker** — add runtime caching for API responses (stale-while-revalidate for profile/credits)
- **Preconnect** to Supabase URL in index.html for faster initial API calls

---

## Batch 2: Security & Compliance Hardening

### 7. Device Binding (PRD Section 3.3)
- **Missing**: Device fingerprint generation, storage in `user_private.device_id_encrypted`, validation on authenticated requests
- **Changes**: Generate composite fingerprint (userAgent + screen + timezone hash), store encrypted on registration, validate via edge function middleware

### 8. Escalation Consent During Registration (PRD Section 3.4)
- **Current**: Has checkbox but exact consent language doesn't match PRD
- **Changes**: Update Register.tsx Step 2 consent text to exact PRD wording

### 9. Account Deletion Flow (DPDP Compliance)
- **Missing**: Full DPDP-compliant deletion — hard-delete `user_private`, soft-delete profile, anonymize `credit_transactions`, 30-day grace period
- **Changes**: Edge function `delete-account` with grace period logic, update Profile page with account deletion UI

### 10. Selective Transcription / AI Moderation (PRD Section 19.1)
- **Missing**: AI sentiment classification on BlackBox entries and live sessions
- **Changes**: Edge function using Lovable AI (gemini-2.5-flash) to classify content risk level (0-3), update `blackbox_entries.ai_flag_level` automatically on insert

---

## Batch 3: README & Polish

### 11. README Update
- Update architecture table to reflect current stack (Lovable Cloud, not raw Supabase)
- Add ECC Stability Pool, Razorpay integration, device binding to feature list
- Update database schema table with new tables (blackbox_sessions, intern_training)
- Add PWA install instructions
- Add DPDP compliance section
- Add phase scaling roadmap summary
- Remove references to technologies not in use (Fastify, Prisma, Socket.IO — we use Supabase Realtime)

### 12. Mobile Responsiveness Sweep
- Audit all pages at 375px, 390px, 428px widths
- Fix any overflow/truncation issues
- Ensure safe-area-inset handling on all fixed elements
- Add `will-change: transform` to animated elements for GPU acceleration
- Reduce motion for `prefers-reduced-motion` users

---

## Files to Create/Modify

| File | Action | Batch |
|------|--------|-------|
| `supabase/migrations/...stability_pool.sql` | New table + cron function | 1 |
| `supabase/functions/purchase-credits/index.ts` | Razorpay order + verify | 1 |
| `src/pages/dashboard/Credits.tsx` | Purchase flow UI | 1 |
| `src/components/mobile/MobileCredits.tsx` | Purchase flow mobile | 1 |
| `src/components/layout/DashboardLayout.tsx` | Global low-balance banner | 1 |
| `src/components/intern/InternDashboardContent.tsx` | Training gate | 1 |
| `src/components/spoc/SPOCDashboardContent.tsx` | Enhanced flags tab | 1 |
| `src/components/mobile/MobileDashboard.tsx` | Skeleton loaders | 1 |
| `index.html` | Preconnect hints | 1 |
| `src/pages/auth/Register.tsx` | Consent text + device bind | 2 |
| `supabase/functions/ai-moderate/index.ts` | AI content classification | 2 |
| `supabase/functions/delete-account/index.ts` | DPDP deletion flow | 2 |
| `src/pages/dashboard/Profile.tsx` | Account deletion UI | 2 |
| `README.md` | Full rewrite | 3 |
| Multiple mobile components | Responsive fixes | 3 |

---

## Recommendation

This is too large for a single implementation pass. I recommend starting with **Batch 1** (core features + performance) since those are the most user-visible gaps. Shall I proceed with Batch 1, or would you prefer a different prioritization?

