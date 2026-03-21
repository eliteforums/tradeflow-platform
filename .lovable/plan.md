

## Plan: Fix QR Code Generation + Comprehensive Legal Pages

### 1. QR Code Fix

The `QRCodeSVG` component and library are installed correctly. The likely issue is the edge function failing silently — the query catches errors but the fallback shows "Failed to generate" without a retry prompt. Two fixes:

**a) Improve error handling in SPOCTools.tsx:**
- Add `retry: 2` to the query config
- Show the actual error message in the fallback state
- Add a "Try Again" button in the error state

**b) Edge function auth issue:**
- The `generate-spoc-qr` function requires `Authorization` header. The Supabase client auto-attaches it, but the function reads it manually. Verify the function is deployed and accessible. The code itself looks correct — this is likely a deployment/network issue that the retry will help with.

---

### 2. Privacy Policy — Comprehensive Legal Document (~20 sections)

Rewrite `Privacy.tsx` to be a full enterprise-grade privacy policy covering:

1. Introduction & Scope
2. Definitions (Data Controller, Data Subject, Processing, etc.)
3. Information We Collect (categories: account data, usage data, device data, session data, cookie data)
4. Legal Basis for Processing (consent, legitimate interest, contractual necessity)
5. How We Use Your Information (12+ specific purposes)
6. Data Retention Periods (table format with data type → retention period)
7. Data Storage, Security & Encryption (AES-256, TLS 1.3, E2E encryption details)
8. Data Sharing & Third Parties (sub-processors, institutional partners)
9. International Data Transfers
10. Cookie Policy (types: essential, analytics, preferences — with table)
11. Your Rights Under GDPR/DPDP (access, rectification, erasure, portability, objection, restriction)
12. Children's Privacy
13. Automated Decision-Making & AI
14. BlackBox & Session Data Handling
15. Data Breach Notification Procedures
16. Changes to This Policy
17. Grievance Redressal & DPO Contact
18. Governing Law & Jurisdiction

Add a table of contents at top with anchor links. Include styled subsections, bullet lists, and data tables.

---

### 3. Terms of Service — Comprehensive Legal Document (~25 sections)

Rewrite `Terms.tsx` to be a full legal ToS covering:

1. Introduction & Definitions
2. Acceptance of Terms
3. Eligibility & Registration
4. Account Security & Anonymity
5. SPOC Verification & Institution Binding
6. Platform Services Description (Peer Connect, BlackBox, Expert Sessions, Sound Therapy, Self-Help)
7. Eternia Credits (ECC) — earning, spending, non-transferability, expiry
8. Acceptable Use Policy (detailed prohibited conduct list)
9. Content Standards & AI Moderation
10. Intellectual Property Rights
11. User-Generated Content License
12. Privacy & Data Protection (cross-reference)
13. Third-Party Services & Integrations
14. Service Availability & Uptime
15. Limitation of Liability
16. Indemnification
17. Disclaimer of Warranties
18. Emergency & Crisis Disclaimer
19. Termination & Suspension
20. Account Deletion & 30-Day Grace Period
21. Dispute Resolution & Arbitration
22. Governing Law & Jurisdiction (India)
23. Severability
24. Force Majeure
25. Contact Information

Same table of contents with anchor links.

---

### Files

| # | File | Change |
|---|------|--------|
| 1 | `src/components/admin/SPOCTools.tsx` | Add retry logic, better error/fallback states |
| 2 | `src/pages/legal/Privacy.tsx` | Full rewrite — 18 sections with TOC, tables, anchor links |
| 3 | `src/pages/legal/Terms.tsx` | Full rewrite — 25 sections with TOC, tables, anchor links |

