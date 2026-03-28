

## Platform Audit — Issues Found

### Issue 1: Peer Connect Credit Check Still Wrong in 3 Places (Bug — Medium)
The actual session cost is 18 ECC, but:
- **`PeerConnect.tsx` line 345-349**: Warning message still shows `creditBalance < 20` and text says "Need 20 ECC"
- **`MobilePeerConnect.tsx` line 116**: Guard check `creditBalance < 20` (should be `< 18`)
- **`MobilePeerConnect.tsx` line 173-177**: Warning shows `creditBalance < 20` and text says "Need at least 20 ECC"

**Fix**: Change all three to `< 18` and update text to "Need 18 ECC".

---

### Issue 2: "Daily Cap" Label — Actually Weekly Cap (Bug — Low)
The earn cap is 5 ECC per **week** (uses `get_weekly_earn_total` DB function), but:
- **`Credits.tsx` line 77**: Shows "Daily Cap" label
- **`TibetanBowl.tsx` line 59**: Says "left today" and "Daily cap reached"

WreckBuddy.tsx correctly says "weekly". These labels are misleading.

**Fix**: Change "Daily Cap" → "Weekly Cap" and "left today" → "left this week".

---

### Issue 3: TibetanBowl Uses Legacy Aliases (Code Smell — Low)
`TibetanBowl.tsx` line 9 destructures `{ dailyEarned, dailyCap, remainingToday }` — these are legacy aliases for the weekly values in `useEccEarn`. Works but confusing for maintainability.

**Fix**: Switch to `{ weeklyEarned, weeklyCap, remainingThisWeek }` like WreckBuddy does.

---

### Issue 4: SoundTherapy Audio Cleanup Race Condition (Bug — Low)
`SoundTherapy.tsx` line 30-52: The `useEffect` creates a new `Audio` object on every track change, but the `ended` event handler references `currentTrackData` from closure. If the user rapidly switches tracks, `earnFromActivity` could credit the wrong track. Also `handleNext` is called from the `ended` listener but uses stale `filteredTracks.length`.

**Fix**: Use a ref for `currentTrackData` in the `ended` handler.

---

### Issue 5: Escalation `session_id` Fix Confirmed (Previously Fixed)
`escalate-emergency/index.ts` line 219 now correctly passes `session_id: sessionRef.id || null`. No action needed.

---

### Summary

| # | Issue | Severity | Files |
|---|-------|----------|-------|
| 1 | Peer Connect credit check: 3 remaining `< 20` references | **Medium** | PeerConnect.tsx, MobilePeerConnect.tsx |
| 2 | "Daily Cap" label should say "Weekly Cap" | **Low** | Credits.tsx |
| 3 | TibetanBowl uses legacy daily aliases | **Low** | TibetanBowl.tsx |
| 4 | SoundTherapy stale closure in audio ended handler | **Low** | SoundTherapy.tsx |

### Files to Edit
- `src/pages/dashboard/PeerConnect.tsx` — Fix credit warning threshold and text (lines 345-349)
- `src/components/mobile/MobilePeerConnect.tsx` — Fix guard (line 116) and warning (lines 173-177)
- `src/pages/dashboard/Credits.tsx` — Change "Daily Cap" → "Weekly Cap" (line 77)
- `src/pages/dashboard/TibetanBowl.tsx` — Switch to weekly aliases and labels (line 9, 59)

