

## Apply Exact Color Palette Across Entire UI

### Palette (from image)
| Hex | HSL | Role |
|---|---|---|
| `#E9E8F2` | `245 20% 93%` | Light background / muted / cards |
| `#6C63FF` | `243 100% 69%` | Primary (purple) |
| `#1B1F3B` | `229 38% 17%` | Dark / foreground / navy |
| `#FFC857` | `41 100% 67%` | Accent / warning (golden) |
| `#FA7E61` | `12 94% 68%` | Secondary / coral |

### Changes

#### 1. `src/index.css` — Remap all CSS variables

All `:root` variables updated to new palette:

- `--primary` → `243 100% 69%` (purple)
- `--primary-foreground` → `0 0% 100%`
- `--secondary` / `--accent` → `12 94% 68%` (coral)
- `--foreground` / `--card-foreground` / `--popover-foreground` → `229 38% 17%` (navy)
- `--background` → `0 0% 100%` (keep white)
- `--card` → `245 20% 97%` (slightly lighter than E9E8F2)
- `--muted` → `245 20% 93%` (E9E8F2)
- `--muted-foreground` → `229 20% 42%`
- `--border` → `245 15% 86%`
- `--input` → `245 15% 90%`
- `--ring` → `243 100% 69%`
- `--eternia-teal` / `--eternia-teal-glow` → purple (`243 100% 69%` / `243 100% 79%`)
- `--eternia-lavender` / `--eternia-lavender-glow` → coral (`12 94% 68%` / `12 94% 78%`)
- `--eternia-violet` / `--eternia-violet-glow` → golden (`41 100% 67%` / `41 100% 77%`)
- `--eternia-dark` → `229 38% 17%`
- `--eternia-dark-card` → `245 20% 97%`
- `--eternia-dark-elevated` → `245 20% 93%`
- `--eternia-warning` → `41 100% 67%`
- `--eternia-gradient-start` → `243 100% 69%`
- `--eternia-gradient-end` → `12 94% 68%`
- Sidebar variables: background `245 20% 97%`, foreground `229 38% 17%`, primary `243 100% 69%`, accent `245 15% 90%`, border `245 15% 86%`, ring `243 100% 69%`

Also update the `.card-table` class background from green felt tones to navy-purple tones using the new dark color.

#### 2. `src/components/landing/HeroSection.tsx` — Hardcoded particle colors
- `hsl(174 62% 47%)` → `hsl(243 100% 69%)` (purple)
- `hsl(262 52% 60%)` → `hsl(12 94% 68%)` (coral)
- Radial gradient ellipses updated similarly

#### 3. `src/components/landing/AnnouncementBanner.tsx` — Banner gradient
- Update linear-gradient to use new purple → coral

#### 4. `src/pages/Landing.tsx` — Snake gradient SVG
- Update stop colors from teal/lavender to purple/coral

#### 5. `src/components/landing/CTASection.tsx` — Radial gradient
- Update `hsl(166 72% 46%)` to purple

#### 6. `src/components/admin/AnalyticsDashboard.tsx` — Chart colors
- `CHART_COLORS` array: replace teal with purple, lavender with coral
- All hardcoded `hsl(174...)` → purple, `hsl(262...)` → coral
- Heatmap cell hue `174` → `243`

#### 7. `src/components/admin/SPOCTools.tsx` — QR code color
- `fgColor` from teal to purple

#### 8. `src/components/spoc/SPOCDashboardContent.tsx` — QR code color
- Same QR `fgColor` update

### Files to Edit
- `src/index.css`
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/AnnouncementBanner.tsx`
- `src/components/landing/CTASection.tsx`
- `src/pages/Landing.tsx`
- `src/components/admin/AnalyticsDashboard.tsx`
- `src/components/admin/SPOCTools.tsx`
- `src/components/spoc/SPOCDashboardContent.tsx`

