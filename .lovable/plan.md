

## Plan: Clean Up Sound Therapy

### Problem
The single track in the database has corrupted data — `cover_emoji` contains `"🎵Tibetan bowl "` instead of just `"🎵"`, causing text overflow in both the track list and now-playing panel.

### Changes

#### 1. Database: Delete seed/test sound data
- Run a migration or direct query to delete all existing rows from `sound_content` table (just 1 row currently)
- The page will show a clean empty state until admin adds real tracks

#### 2. `SoundTherapy.tsx` — Improve empty state
- Show a proper empty state when no tracks exist: icon + "No sounds yet" message + note that sounds are managed via admin panel
- Hide the now-playing sidebar when there are no tracks

#### 3. `MobileSoundTherapy.tsx` — Same empty state treatment

#### 4. UI resilience: truncate `cover_emoji` display
- In both desktop and mobile, limit the emoji display to first 2 characters max as a safety measure against bad data

| File | Change |
|------|--------|
| Database | Delete all rows from `sound_content` |
| `src/pages/dashboard/SoundTherapy.tsx` | Better empty state, hide player when no tracks, truncate emoji |
| `src/components/mobile/MobileSoundTherapy.tsx` | Same empty state + emoji truncation |

