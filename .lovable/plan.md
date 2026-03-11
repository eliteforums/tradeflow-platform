

## Plan: Fix Sound Therapy UI and Playback Issues

### Problems Identified
1. **Tracks without audio files fail silently** — clicking play on tracks with no `file_url` sets `isPlaying=true` but nothing plays, leaving the UI in a broken state
2. **No visual indication** that a track has no audio file uploaded
3. **Progress slider is draggable but doesn't actually seek** — changing progress via slider doesn't update `audio.currentTime`

### Changes

**File: `src/pages/dashboard/SoundTherapy.tsx`**
- Add guard: if a track has no `file_url`, show a toast ("No audio file available") and don't start playback
- Make the progress slider functional for seeking (update `audio.currentTime` on change)
- Show a subtle indicator on tracks that have no audio file

**File: `src/components/mobile/MobileSoundTherapy.tsx`**
- Same guards and seeking fix as desktop

**File: `src/hooks/useSoundTherapy.ts`**
- No changes needed — it correctly fetches only `is_active` tracks

### Technical Details
- In `handleTrackSelect`, check `filteredTracks[index].file_url` before setting `isPlaying(true)`. If null, show `toast.error("This track has no audio file yet")`
- Add `onValueCommit` handler to progress Slider that seeks: `if (audioRef.current?.duration) audioRef.current.currentTime = (val[0] / 100) * audioRef.current.duration`
- Add a small "No audio" badge on track items where `!track.file_url`

