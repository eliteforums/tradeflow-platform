

## Plan: Remove Floating Bubble Icons from Hero

Remove the 4 floating emoji card elements (🧘 💬 🎵 🛡️) that animate near the "I" in ETERNIA. They render with visibility issues against the dark background.

**File**: `src/components/landing/HeroSection.tsx`

**Change**: Remove the array of `motion.div` cards inside the "I" `motion.span` (the block with `{ rotate, x, y, delay, emoji }` mappings), keeping the "I" letter itself intact.

