

## Plan: Update Sitemap, OG Tags & Add IndexNow

### What's Already in Place
- `public/sitemap.xml` — has 6 URLs but missing `/forgot-password`
- `index.html` — full OG, Twitter Card, JSON-LD, canonical, robots meta
- `public/robots.txt` — proper crawl rules
- `public/og-image.png` — exists

### Changes

**1. Update `public/sitemap.xml`**
- Add missing public route: `/forgot-password`
- Add `<lastmod>` dates (today's date) to all entries for freshness signals

**2. Enhance OG tags in `index.html`**
- Add `og:updated_time` meta tag
- Add `article:published_time` and `article:modified_time` for richer social previews
- Add WhatsApp-specific `og:image:type` tag (image/png)
- Add LinkedIn-specific `og:image:secure_url` tag

**3. Add IndexNow support**
- Create `public/<key>.txt` with an IndexNow API key (a generated UUID)
- Create `supabase/functions/indexnow-submit/index.ts` — an edge function that POSTs the sitemap URLs to the IndexNow API (Bing/Yandex) for instant indexing
- Add a manual trigger button in the admin panel OR document curl usage
- Alternatively, keep it simple: just add the `public/<key>.txt` verification file and document the curl command in README

**4. Update `public/robots.txt`**
- Already comprehensive; no changes needed

### Files Modified
- `public/sitemap.xml` — add `/forgot-password`, add `<lastmod>` to all entries
- `index.html` — add 3-4 additional OG meta tags
- `public/{uuid}.txt` — new IndexNow key file
- `README.md` — document IndexNow usage

### No backend/database changes needed.

