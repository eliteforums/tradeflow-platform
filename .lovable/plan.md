
Goal: make the escalation flow truly consistent across desktop/mobile and fix the L3 “claimed by another expert” blocker.

1) Root-cause fixes to apply
- In-call escalation is still missing from the actual call window (VideoCallModal/MeetingView controls), so escalation is only available outside the modal in some paths.
- Mobile dashboards still use older escalation paths (direct table insert), which creates inconsistent payloads and “query-like” display in SPOC.
- L3 claim happens before the expert is actually in-call and is done client-side, so false claims/race conditions can hide Join Call.

2) Implementation plan

A. Expert escalation button consistency (during + after call)
- Add an escalation action directly inside call controls so it is always available while in-call.
- Keep post-session escalation visible on completed cards in both desktop and mobile expert dashboards.
- Ensure both Home and Sessions views expose Escalate consistently for completed sessions.

B. SPOC structured escalation view (replace query/raw style)
- Standardize parsing of escalation payloads in `SPOCDashboardContent`.
- If `trigger_snippet` is missing/invalid, derive display data from related session fields (`session_id`, `session_type`) so older records still show structured info.
- Render the same structured block in both:
  - Flags escalation cards
  - M.Phil Override Records section
- Structured block will always prioritize:
  - Student ID
  - Session type + session ID
  - Emergency contact (when available)
  - Escalation reason

C. Blackbox L3 claim logic (critical)
- Move claim to happen after the expert actually joins the call (not at button click).
- Implement an atomic backend claim step (single-winner) so only one expert can claim after join.
- If claim fails (already claimed), immediately close/leave and show a clear message.
- Update UI states:
  - Before claim: show Join Call
  - Claimed by current expert: Rejoin + escalation actions
  - Claimed by another expert: show claimed state
- Harden parsing to ignore malformed history entries that could falsely mark “claimed by another expert.”

D. Align all escalation entry points
- Update mobile expert and mobile intern flows to call the same backend escalation function used on desktop (`escalate-emergency`) so payload shape is uniform.
- Remove/replace direct `escalation_requests` inserts from mobile paths.

3) Files to update
- `src/components/videosdk/VideoCallModal.tsx`
- `src/components/videosdk/MeetingView.tsx`
- `src/components/videosdk/MeetingControls.tsx`
- `src/components/expert/ExpertDashboardContent.tsx`
- `src/components/mobile/MobileExpertDashboard.tsx`
- `src/components/intern/InternDashboardContent.tsx` (validation pass for consistency)
- `src/components/mobile/MobileInternDashboard.tsx`
- `src/components/expert/ExpertL3AlertPanel.tsx`
- `src/components/spoc/SPOCDashboardContent.tsx`
- New backend claim handler for L3 (edge function, and DB helper only if needed for atomic lock)

4) Technical details
- L3 claim flow target:
  1) Expert clicks Join Call
  2) Call joins successfully
  3) Backend atomic claim executes
  4) Winner stays; non-winner is exited with “already claimed”
- SPOC payload normalization:
  - Parse JSON when available
  - Fallback to relational lookup for legacy rows
  - Render one unified structured component in all escalation list contexts

5) Verification checklist
- Expert desktop + mobile: Escalate visible during active call and after completion.
- Intern desktop + mobile escalations: SPOC receives structured session data.
- L3 Blackbox: no premature “claimed by another expert”; Join Call visible pre-claim; exactly one expert can keep the claim post-join.
- SPOC Flags + M.Phil sections: no raw/query-style output for new and legacy escalations.
