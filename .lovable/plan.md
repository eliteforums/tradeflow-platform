

## Plan: Avatar/Logo Upload for Profiles and Institutions

### Overview
Add avatar/profile picture upload for experts, therapists, interns, and SPOCs (excluding students), plus logo upload for institutions. Users can upload an image or pick from preset avatars.

### Database Changes

**1. Create `avatars` storage bucket** (migration)
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- RLS: authenticated users can upload to their own folder
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');
```

**2. Add `logo_url` to institutions table** (migration)
```sql
ALTER TABLE public.institutions ADD COLUMN logo_url text;
```

### Frontend Changes

**3. New component: `src/components/profile/AvatarUpload.tsx`**
- Shows current avatar (or gradient fallback icon)
- Camera/edit overlay button
- On click: opens a dialog with two tabs:
  - **Upload**: file input accepting image/* (max 2MB), crops to square, uploads to `avatars/{user_id}/avatar.webp`
  - **Preset Avatars**: grid of ~12 preset avatar illustrations (emoji-style or initials-based generated avatars)
- On save: updates `profiles.avatar_url` and calls `refreshProfile()`
- Only renders the upload UI for non-student roles

**4. Update `src/pages/dashboard/Profile.tsx`**
- Replace the static gradient `User` icon block (line 164) with `<AvatarUpload />` component
- For students: keep the current static gradient icon (no upload)
- For all other roles: show clickable avatar with edit overlay

**5. Update `src/components/mobile/MobileProfile.tsx`**
- Same avatar upload integration for mobile view

**6. Update `src/components/admin/InstitutionManager.tsx`**
- Add logo upload button on institution bar cards
- Upload to `avatars/institutions/{institution_id}/logo.webp`
- Display logo in the left section of each bar card (fallback: Building2 icon)
- Admin-only upload capability

### Files Modified
- Migration: create `avatars` bucket + add `logo_url` to institutions
- `src/components/profile/AvatarUpload.tsx` — new component
- `src/pages/dashboard/Profile.tsx` — integrate avatar upload for non-students
- `src/components/mobile/MobileProfile.tsx` — same integration
- `src/components/admin/InstitutionManager.tsx` — institution logo upload + display

