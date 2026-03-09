# Memory: index.md
Updated: now

# Eternia Project Memory

## Project Overview
- **Type**: Institutional Student Wellbeing PWA (mobile-first)
- **Design**: Dark + calming theme with teal/lavender accents
- **Fonts**: Outfit (headings), DM Sans (body)

## Design System Tokens
- Primary: Teal (166 72% 46%)
- Secondary/Accent: Lavender (262 52% 60%)
- Background: Dark (220 14% 6%)
- Success: Green, Warning: Amber, Destructive: Red

## Critical: Mobile-First PWA
- ALL pages must be designed mobile-first (target: phones)
- Use compact padding (p-3), small text (text-xs/text-sm)
- Bottom nav is h-16 + safe-area-inset-bottom
- Mini player must use `bottom: calc(4rem + env(safe-area-inset-bottom))`
- useIsMobile initializes with window check (not undefined)
- 3D components have 2D mobile fallbacks
- Tabs use scrollable pill pattern on mobile
- Tables replaced with card lists on mobile
- Headings: text-xl on mobile, text-2xl+ on desktop

## Auth
- Username-based login via @eternia.local emails
- Auto-confirm enabled
- Profile auto-created on signup via trigger
- 100 ECC welcome bonus

## User Roles (RBAC)
- Student, Intern, Expert, SPOC, Admin
- Stored in user_roles table
- has_role() security definer function
