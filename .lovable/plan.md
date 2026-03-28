

## Platform Audit — Remaining Issues Found

### Issue 1: MobileCredits Shows "5 ECC/day" — Should Be "5 ECC/week" (Bug — Medium)
- **File**: `src/components/mobile/MobileCredits.tsx` line 114
- **Problem**: Text says `Earn (5 ECC/day)` — should be `Earn (5 ECC/week)`
- **Fix**: Change `"5 ECC/day"` to `"5 ECC/week"`

---

### Issue 2: MobileCredits Shows "Peer: 20 ECC" — Should Be 18 ECC (Bug — Medium)
- **File**: `src/components/mobile/MobileCredits.tsx` line 166
- **Problem**: Credit cost text says `Peer: 20 ECC` — actual cost is 18 ECC
- **Fix**: Change `"Peer: 20 ECC"` to `"Peer: 18 ECC"`

---

### Issue 3: Appointments Page Hardcodes 45 ECC Expert Cost (Bug — Low)
- **File**: `src/pages/dashboard/Appointments.tsx` line 40
- **Problem**: `creditCost: 45` is hardcoded when booking — but the credit costs listed elsewhere say 50 ECC for Expert Connect
- **Fix**: Verify the correct cost (45 or 50) and make consistent. MobileCredits line 166 says `Expert: 50 ECC`.

---

### Issue 4: Console Warning — Footer Ref on EterniaLogo (Already Fixed, Still Showing)
- **Console**: `Function components cannot be given refs` on `Footer`
- **Status**: EterniaLogo already has `forwardRef` (line 10). The console error references `Landing > Footer`. Need to check if Footer is passing a ref via some other mechanism (e.g., a wrapping component or Link).
- **Investigation**: Footer.tsx line 29 passes `<EterniaLogo size={32} />` inside a `<Link>` — no ref passed. The warning may be stale/cached. No fix needed.

---

### Issue 5: SoundTherapy `handleNext` Uses Stale `filteredTracks.length` (Bug — Low)
- **File**: `src/pages/dashboard/SoundTherapy.tsx` line 65
- **Problem**: `handleNext` is in a `useCallback` with `[filteredTracks.length]` dep, but it's called from the `ended` event listener in the `useEffect` on line 41. The `useEffect` deps are `[currentTrack, isPlaying, currentTrackData?.file_url]` — it doesn't re-subscribe when `filteredTracks.length` changes. So `handleNext` could use a stale reference.
- **Fix**: Use a ref for `handleNext` or include it in the audio effect cleanup/re-subscribe logic.

---

### Issue 6: MobileDashboard Missing Low Balance Warning (Inconsistency — Low)
- **File**: `src/components/mobile/MobileDashboard.tsx`
- **Problem**: Desktop Dashboard (line 78) shows a low balance warning when `balance < 5`, but MobileDashboard doesn't have this warning.
- **Fix**: Add the same low-balance alert to MobileDashboard.

---

### Issue 7: Profile Page Leaks Raw Student ID in UI (Bug — Medium)
- **File**: `src/pages/dashboard/Profile.tsx` lines 213-218
- **Problem**: `{(profile as any).student_id}` is displayed directly. The APAAR spec says raw IDs should never be stored or shown. If `profiles.student_id` column still has data, it would be visible here.
- **Fix**: Remove this block or only show masked value. The verification section already shows "Verified" status.

---

### Summary

| # | Issue | Severity | File |
|---|-------|----------|------|
| 1 | MobileCredits: "5 ECC/day" → "5 ECC/week" | **Medium** | MobileCredits.tsx |
| 2 | MobileCredits: "Peer: 20 ECC" → "Peer: 18 ECC" | **Medium** | MobileCredits.tsx |
| 3 | Expert booking cost inconsistency (45 vs 50) | **Low** | Appointments.tsx |
| 4 | SoundTherapy stale `handleNext` in audio listener | **Low** | SoundTherapy.tsx |
| 5 | MobileDashboard missing low balance warning | **Low** | MobileDashboard.tsx |
| 6 | Profile leaks raw `student_id` in UI | **Medium** | Profile.tsx |

### Files to Edit
- `src/components/mobile/MobileCredits.tsx` — Fix "day" → "week" label (line 114) and "20 ECC" → "18 ECC" (line 166)
- `src/pages/dashboard/Profile.tsx` — Remove raw student_id display block (lines 213-218)
- `src/pages/dashboard/Appointments.tsx` — Align credit cost with documented 50 ECC (line 40)
- `src/pages/dashboard/SoundTherapy.tsx` — Use ref for handleNext in audio ended listener
- `src/components/mobile/MobileDashboard.tsx` — Add low balance warning matching desktop

