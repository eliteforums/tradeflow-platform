# Eternia Project Memory

## Project Overview
- **Type**: Institutional Student Wellbeing Platform (PWA)
- **Design**: Dark + calming theme with teal/lavender accents
- **Fonts**: Space Grotesk (headings), Inter (body)

## Design System Tokens
- Primary: Teal (174 62% 47%)
- Secondary/Accent: Lavender (262 52% 60%)
- Background: Dark blue (222 47% 6%)

## Labels (PRD aligned)
- "Expert Connect" not "Appointments"
- "Wallet" not "Credits" (student-facing)
- "Training" not "Home" (intern tabs)

## Credit Costs
- Expert Connect: 50 ECC
- Peer Connect: 20 ECC
- BlackBox Talk Now: 30 ECC
- All enforced server-side via spend-credits edge function

## Edge Functions
- spend-credits, purchase-credits, generate-spoc-qr, validate-spoc-qr
- reset-device, stability-pool-contribute, seed-admin
- videosdk-token, ai-moderate, delete-account
- add-member, bulk-add-members

## Auth
- Username-based login via @eternia.local emails
- Auto-confirm enabled
- Device fingerprint validated on app load (students)

## Intern Training
- 7 modules, progress persisted to profiles.training_progress JSONB
- Sessions/Notes tabs locked until training_status = "completed"
