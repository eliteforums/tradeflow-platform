

## Plan: Replace Emoji Presets with DiceBear Avatar Library

### Problem
The current preset avatars are plain emojis which look bad. Replace with DiceBear's professional SVG avatar library using multiple styles.

### Changes

**1. Install DiceBear packages**
```
npm install @dicebear/core @dicebear/collection
```

**2. Rewrite `src/components/profile/AvatarUpload.tsx`**

Replace the emoji preset system with DiceBear-generated avatars:

- **Preset tab**: Show a grid of ~12 DiceBear avatars using different seeds (e.g. `seed-1` through `seed-12`), rendered as SVG data URIs via `createAvatar(style, { seed }).toDataUri()`
- **Style selector**: Add a dropdown/tabs to pick from 4-5 avatar styles: `lorelei`, `bottts`, `avataaars`, `funEmoji`, `notionists` — each regenerates the grid
- **Selection**: When user picks one, store the data URI or a DiceBear identifier string (e.g. `dicebear:lorelei:seed-5`) in `avatar_url`
- **Rendering**: Update `renderAvatar()` to handle `dicebear:` prefix — regenerate the SVG at render time from the stored style+seed (avoids storing large SVGs in DB)
- **Student fallback**: Generate a default DiceBear avatar using the user's ID as seed (deterministic, unique per user) instead of the generic User icon
- **Upload tab**: Keep as-is for custom image uploads

**Key code pattern:**
```typescript
import { createAvatar } from '@dicebear/core';
import { lorelei, bottts, avataaars, funEmoji, notionists } from '@dicebear/collection';

const STYLES = { lorelei, bottts, avataaars, funEmoji, notionists };

// Generate avatar
const avatar = createAvatar(STYLES[selectedStyle], { seed });
const dataUri = avatar.toDataUri();
```

### Files Modified
- `package.json` — add `@dicebear/core`, `@dicebear/collection`
- `src/components/profile/AvatarUpload.tsx` — replace emoji presets with DiceBear avatar grid + style picker

### No backend changes needed.

