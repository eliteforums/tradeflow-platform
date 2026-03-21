# PRD v2-20 Implementation Status — Updated 2026-03-21

## Completed Gaps (v2-20)
1. **Dual Verification Model** — institution_type column on institutions, APAAR/ERP fields on user_private, Register.tsx detects type
2. **Training Status Lifecycle** — not_started → in_progress → assessment_pending → failed → interview_pending → active; PeerConnect gates on "active" or "completed"
3. **Therapist Mobile Detection** — TherapistDashboard passes isMobile prop
4. **Self-Help Tools Grouping** — Sound Therapy + Quest Cards + Wreck Buddy grouped under "Self-Help Tools" on Dashboard
5. **Stability Pool Auto-Contribution** — edge function stability-pool-auto-contribute deployed
6. **BlackBox Credits** — already implemented (30 ECC via useBlackBoxSession)
7. **SPOC M.Phil Override Records** — added to Reports tab
8. **Peer Connect gate** — checks training_status === "active" || "completed"
