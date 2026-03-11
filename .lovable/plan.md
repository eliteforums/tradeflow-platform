

## Plan: Self-Help "Coming Soon" + Clean Sound Therapy Data

### What needs to happen

**1. Make Self-Help page "Coming Soon" on both desktop and mobile**
- Desktop `SelfHelp.tsx`: Replace the full interactive page (quests, wreck, bowl tabs) with a "Coming Soon" locked layout matching the existing mobile design — show tool cards grayed out with lock icons
- Mobile `MobileSelfHelp.tsx`: Already shows "Coming Soon" — no changes needed

**2. Delete all dummy sound data from the database**
- Remove the 3 test records currently in `sound_content` (titles: "01", "srbggwsev", "vewoie") — none have audio files
- After deletion, users see "No tracks yet" with a message that their admin will add sounds

**3. Sound Therapy already works end-to-end**
- Admin `SoundManager` already supports adding tracks with audio upload, editing, and deleting
- User-facing `SoundTherapy.tsx` and `MobileSoundTherapy.tsx` already fetch from `sound_content` table and play uploaded audio
- No code changes needed for this flow — it already works as requested

### Files to change

| File | Change |
|------|--------|
| `src/pages/dashboard/SelfHelp.tsx` | Replace with "Coming Soon" locked layout (same design as mobile) for both desktop and mobile |
| Database | Delete 3 dummy rows from `sound_content` |

### Technical notes
- The desktop SelfHelp page currently imports Three.js/WebGL components (QuestCard3D, WreckBuddy3D, TibetanBowl3D) which can crash on some browsers. Replacing with a static "Coming Soon" page eliminates that risk entirely.
- The `SoundManager` admin component already handles audio file upload to the `sound-files` storage bucket, auto-detects duration, and stores the public URL. Users will hear exactly what the admin uploads.

