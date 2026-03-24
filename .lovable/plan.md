

## Plan: Enhance PWA Update Notification

### Current State
`PWAUpdatePrompt.tsx` already exists and is rendered in `App.tsx`. It detects service worker updates and shows a small banner. The vite-plugin-pwa config already has `skipWaiting: true` and `clientsClaim: true`.

### Problem
The `skipWaiting: true` in the Workbox config means the new service worker activates immediately — **bypassing** the prompt entirely. The `PWAUpdatePrompt` waits for a "waiting" worker, but `skipWaiting` prevents that state. So the prompt likely never shows.

### Changes

#### 1. `vite.config.ts` — Remove `skipWaiting` and `clientsClaim` from Workbox config
These should be controlled by the app (via `postMessage`) not automatically. This is what makes the update prompt actually work — the new SW waits until the user clicks "Update".

#### 2. `src/components/PWAUpdatePrompt.tsx` — Enhanced update notification
- Replace the minimal banner with a more prominent notification card:
  - Animated refresh icon
  - "New version available" title with version/changelog hint
  - Two clear action buttons: **"Update Now"** (triggers skip waiting + reload) and **"Later"** (dismiss)
  - If dismissed, re-show after 1 hour (tracked via `localStorage` timestamp)
  - If update is critical (detected via a version check endpoint or meta tag), show a non-dismissable overlay with "Please update to continue" and an "Uninstall & Reinstall" instruction fallback
- Add a small persistent dot indicator on the app (e.g., in the navbar or sidebar) when an update is available but dismissed

#### 3. Add "Check for Updates" button in Profile/Settings page
- `src/pages/dashboard/Profile.tsx` — Add a "Check for Updates" button that manually calls `registration.update()` and shows result
- Show current app version (from `package.json` or a build-time env variable)

### Files Modified
- `vite.config.ts` — Remove `skipWaiting`/`clientsClaim` from workbox config
- `src/components/PWAUpdatePrompt.tsx` — Enhanced UI with dismiss timer, re-show logic, uninstall instructions
- `src/pages/dashboard/Profile.tsx` — Add manual update check button

