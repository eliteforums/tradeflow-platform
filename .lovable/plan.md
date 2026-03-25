

## Plan: Add Boring Avatars, Avvvatars, Nice Avatar & Avatar Editor

### Overview
Expand the avatar picker with 3 new avatar libraries alongside existing DiceBear, plus add image cropping to the upload tab. Since some libraries render React components (not data URIs), introduce a shared `<ResolvedAvatar>` component for rendering.

### Packages to Install
- `boring-avatars` — 6 SVG variants (beam, marble, pixel, sunset, ring, bauhaus)
- `avvvatars-react` — clean initial-based avatars (character & shape styles)
- `react-nice-avatar` — cartoon face avatars with `genConfig(seed)`
- `react-avatar-editor` — crop/rotate/zoom for uploaded photos

### Storage Convention
Each library stores a prefix string in `avatar_url`:
- `dicebear:style:seed` (existing)
- `boring:variant:seed` (new)
- `avvvatars:style:seed` (new)
- `niceavatar:seed` (new)
- Regular URLs for uploaded images (existing)

### Frontend Changes

**1. New `src/components/profile/ResolvedAvatar.tsx`**
A shared React component that replaces `<img>` for avatar display everywhere:
- Parses `avatar_url` prefix and renders the correct library component
- `boring:` → `<BoringAvatar variant={v} name={seed} size={size} />`
- `avvvatars:` → `<Avvvatars value={seed} style={style} size={size} />`
- `niceavatar:` → `<NiceAvatar {...genConfig(seed)} style={{width, height}} />`
- `dicebear:` → `<img src={getDiceBearUri(style, seed)} />`
- Regular URL → `<img src={url} />`
- Fallback → gradient icon

**2. Rewrite `src/components/profile/AvatarUpload.tsx`**
- **Picker tabs restructure**: Change the style dropdown into a top-level category selector with sub-options:
  - **DiceBear** (existing 5 styles) — grid of 12 seeds
  - **Boring Avatars** (6 variants: beam, marble, pixel, sunset, ring, bauhaus) — grid of 12 name-seeds
  - **Avvvatars** (2 styles: character, shape) — grid of 12 seeds
  - **Nice Avatar** (cartoon faces) — grid of 12 random seeds
- **Upload tab**: Wrap file selection with `react-avatar-editor` for crop/zoom before uploading — shows circular crop overlay, zoom slider, then "Save" button uploads the cropped canvas blob
- Keep `resolveAvatarUrl` for backward compat but add the new prefixes
- Use `<ResolvedAvatar>` internally for preview rendering

**3. Update avatar display across the app**
Replace `<img src={resolveAvatarUrl(...)} />` with `<ResolvedAvatar url={avatarUrl} />` in:
- `AvatarUpload.tsx` (internal preview)
- `Profile.tsx` and `MobileProfile.tsx` (already use AvatarUpload component)
- Any other places that manually call `resolveAvatarUrl` to render

### Files Modified
- `package.json` — add 4 packages
- `src/components/profile/ResolvedAvatar.tsx` — new shared renderer
- `src/components/profile/AvatarUpload.tsx` — expand picker + add crop editor
- Minor updates to any file importing `resolveAvatarUrl` for `<img>` rendering

### No backend changes needed.

