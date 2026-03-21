

## Plan: Bigger QR Code + Scalability + Deep SEO

### 1. QR Code — Real QR Image, Bigger & Better

**Problem**: Currently the SPOC QR section shows a static Lucide `QrCode` icon placeholder (24×24 box). No actual QR image is rendered from the payload.

**Solution**: Install `qrcode.react` library and render an actual QR code from the `qrPayload` data. Make it large (200×200), styled with the Eternia brand colors (teal dots on dark background), with a polished card layout.

**Files**: `src/components/admin/SPOCTools.tsx`

Changes:
- Replace the `w-24 h-24` placeholder div with a `QRCodeSVG` component from `qrcode.react` at `200×200`
- Style with `fgColor` (teal) and `bgColor` (transparent/dark) to match the brand
- Add a "Download QR" button that exports the QR as a PNG image
- Add a proper card with gradient border and "Scan to Join" label

---

### 2. Scalability for Millions of Users

**Files**: `vite.config.ts`, `src/App.tsx`, `src/main.tsx`

Changes:
- **Code splitting**: Already using `lazy()` — verify all heavy components are lazy-loaded
- **React Query tuning**: Increase `staleTime` and `gcTime` defaults in the QueryClient for reduced refetching at scale
- **Debounced subscriptions**: Add connection-aware realtime subscription management
- **Bundle optimization**: Add `build.rollupOptions.output.manualChunks` to split vendor chunks (react, supabase, framer-motion, radix) for better caching
- **Image optimization**: Add lazy loading to all images via intersection observer

---

### 3. Deep SEO Enhancement

**Files**: `index.html`, `public/robots.txt`, new `public/sitemap.xml`, `src/pages/Landing.tsx`, `src/components/landing/HeroSection.tsx`, `src/components/landing/Footer.tsx`, `src/components/landing/FAQSection.tsx`

Changes:

**index.html**:
- Add `og:locale`, `og:image:width`, `og:image:height`, `og:image:alt`
- Add `twitter:site`, `twitter:creator`
- Add `robots` meta tag with `index, follow, max-snippet:-1, max-image-preview:large`
- Add additional JSON-LD: `Organization`, `FAQPage`, `BreadcrumbList`
- Add `alternate` hreflang for future i18n readiness
- Expand keywords meta with long-tail terms

**public/sitemap.xml** (new):
- Create a proper sitemap with all public routes (`/`, `/login`, `/privacy`, `/terms`, `/dpdp`, `/institution-code`)

**public/robots.txt**:
- Add `Disallow` for `/dashboard`, `/admin`, `/register` (private routes)
- Keep `Allow: /` for public pages

**Landing page SEO**:
- Add semantic HTML landmarks (`<main>`, `<article>`, `<section>` with `aria-label`)
- Add `<h1>` hierarchy check — ensure single h1 on landing
- Add FAQ schema markup via JSON-LD from the FAQ data

**Footer**:
- Add `rel="noopener noreferrer"` to external links
- Add social media links placeholder

---

### Implementation Summary

| # | Task | Files |
|---|------|-------|
| 1 | Install `qrcode.react`, render real QR at 200×200 with brand styling + download button | `SPOCTools.tsx` |
| 2 | Manual chunks + QueryClient tuning for scale | `vite.config.ts`, `src/App.tsx` |
| 3 | Sitemap, robots.txt update, JSON-LD schemas, semantic HTML, meta tags | `index.html`, `sitemap.xml`, `robots.txt`, `Landing.tsx`, `FAQSection.tsx` |

