

## Institution Contact Form + Admin Ticketing System

### Overview
Replace the announcement banner link (currently pointing to `/institution-code`) with a new `/contact-institution` public page containing a detailed institution onboarding inquiry form. Submissions are stored in a new `institution_inquiries` table and displayed in the Admin Dashboard as a ticketing system with status tracking.

### Database

**New table: `institution_inquiries`**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| ticket_number | text | Auto-generated (ETN-INQ-00001) |
| status | text | 'new', 'under_review', 'approved', 'rejected', 'info_requested' |
| institution_name | text | Required |
| institution_type | text | university / college / school / coaching / other |
| address_line | text | Street address |
| city | text | |
| state | text | |
| pincode | text | |
| google_maps_url | text | Optional |
| contact_person_name | text | Required |
| contact_person_email | text | Required |
| contact_person_phone | text | Required |
| designation | text | Principal / Director / Admin / Other |
| pan_number | text | Institution PAN |
| tan_number | text | Institution TAN |
| gst_number | text | Optional |
| student_count | integer | Approx student strength |
| website_url | text | Optional |
| message | text | Additional notes |
| admin_notes | text | Internal admin notes |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**RLS policies:**
- Anon INSERT allowed (public form)
- Admin SELECT/UPDATE allowed
- No DELETE, no public SELECT

**Sequence** for ticket numbers: `institution_inquiry_seq`
**Trigger**: Auto-generate `ticket_number` on insert as `'ETN-INQ-' || LPAD(nextval('institution_inquiry_seq')::text, 5, '0')`

### Frontend Changes

#### 1. New page: `src/pages/ContactInstitution.tsx`
- Public route at `/contact-institution`
- Multi-section form with validation (react-hook-form + zod):
  - **Institution Details**: name, type (dropdown), student count, website
  - **Address**: address line, city, state, pincode, Google Maps link
  - **Contact Person**: name, email, phone, designation
  - **Legal/Tax**: PAN, TAN, GST (optional)
  - **Message**: free text
- On submit: insert into `institution_inquiries` via Supabase anon client
- Success state shows the generated ticket number for tracking
- Add a "Track your application" section: enter ticket number to see current status

#### 2. Update `AnnouncementBanner.tsx`
- Change link from `/institution-code` to `/contact-institution`
- Update text: "🎓 Bring Eternia to your campus — Apply now"

#### 3. Update `App.tsx`
- Add public route `/contact-institution` pointing to new page

#### 4. New admin component: `src/components/admin/InquiryTicketManager.tsx`
- Table view of all institution inquiries sorted by newest
- Each row shows: ticket number, institution name, contact person, status badge, date
- Expandable row detail with all submitted fields
- Status dropdown to update: new → under_review → approved/rejected/info_requested
- Admin notes textarea (saved on update)
- Filter by status, search by institution name or ticket number

#### 5. Update `AdminDashboard.tsx`
- Add new tab `"inquiries"` to TabId union
- Add to SIDEBAR_GROUPS under "Institutions": `{ id: "inquiries", label: "Inquiries", icon: Phone }`
- Render `InquiryTicketManager` when tab is active

### Files to Create/Edit
- **DB Migration**: Create `institution_inquiries` table, sequence, trigger, RLS
- `src/pages/ContactInstitution.tsx` — New public contact form + ticket tracker
- `src/components/admin/InquiryTicketManager.tsx` — New admin ticketing UI
- `src/components/landing/AnnouncementBanner.tsx` — Update link + text
- `src/pages/admin/AdminDashboard.tsx` — Add inquiries tab
- `src/App.tsx` — Add `/contact-institution` route

