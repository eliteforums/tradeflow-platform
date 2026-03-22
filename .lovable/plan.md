

## Plan: Fix Peer Connect Module — Cursor Loss, Dummy Data, and PRD Compliance

### Issues Identified

1. **Cursor disconnect on every keystroke** — In `PeerConnect.tsx`, `InternList` and `ChatArea` are defined as inline component functions (lines 59, 79) inside the render body. Every parent re-render creates new component references, causing React to unmount/remount these components, destroying input focus.

2. **Fake intern status (dummy data)** — `getInternStatus()` uses `index % 3` to assign online/busy/offline — this is hardcoded mock logic with no connection to real data.

3. **Intern-side sessions not visible** — The `usePeerConnect` hook queries `peer_sessions` with `.eq("student_id", user.id)`, meaning interns cannot see sessions assigned to them. Interns have no way to receive or view incoming session requests.

4. **No training_status filter on intern list** — PRD §4.2 requires interns to complete training before appearing in the available list. The query fetches all `is_active` interns regardless of training completion.

5. **Same issues exist in MobilePeerConnect.tsx** — duplicate dummy status logic and cursor issues (though mobile uses a different view structure so cursor loss is less severe).

### Changes

| # | File | Change |
|---|------|--------|
| 1 | `src/pages/dashboard/PeerConnect.tsx` | Move `InternList` and `ChatArea` out of render body to fix cursor loss; remove dummy `getInternStatus`; use real availability logic |
| 2 | `src/hooks/usePeerConnect.ts` | Filter interns by `training_status`; add intern-side session query; derive real online/busy status from active sessions |
| 3 | `src/components/mobile/MobilePeerConnect.tsx` | Remove dummy `getInternStatus`; use real status from hook |

### Technical Details

**Fix 1: Cursor Loss (Critical)**

Move `InternList` and `ChatArea` from inline arrow functions to either:
- Extracted to top-level components in the same file, receiving props
- Or inlined directly into the JSX (no component boundary)

The simplest fix: inline the JSX directly into the return statement instead of wrapping in component functions. This avoids unmount/remount cycles entirely.

**Fix 2: Real Intern Availability**

Replace the `index % 3` dummy logic in both files. In `usePeerConnect.ts`:
- Query interns with `.in("training_status", ["active", "completed"])` to only show trained interns
- Fetch active `peer_sessions` to determine which interns are currently in a session
- Return an `internStatuses` map: `Record<string, "online" | "busy" | "offline">`
  - `busy` = intern has an active peer_session
  - `online` = intern is `is_active` and not busy
  - No offline interns shown (they're filtered out by `is_active`)

**Fix 3: Intern-Side Sessions**

Update the sessions query in `usePeerConnect.ts` to also fetch sessions where `intern_id = user.id` (when the user is an intern), so interns can see and respond to their assigned sessions.

**Fix 4: MobilePeerConnect Parity**

Apply same status logic changes to `MobilePeerConnect.tsx` — consume `internStatuses` from the hook instead of computing fake status locally.

### Files to Edit
- `src/hooks/usePeerConnect.ts` — add training filter, real status derivation, intern-side query
- `src/pages/dashboard/PeerConnect.tsx` — inline JSX (fix cursor), consume real statuses
- `src/components/mobile/MobilePeerConnect.tsx` — consume real statuses, remove dummy logic

