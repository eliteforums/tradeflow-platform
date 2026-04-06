
Do I know what the issue is? Yes — this looks like a post-login app-load failure, not just a bad username/password.

What I found
- The auth logs show at least one successful admin login, so login itself can succeed.
- The blank white screen is most likely happening after the redirect into lazy-loaded pages like `/admin` or `/dashboard`.
- Right now there is no route error boundary, so if a lazy chunk fails to load, the app can collapse into a white screen.
- `AuthContext` also swallows profile-loading errors, which means the app can end up with a signed-in user but unstable/missing role/profile state.
- The app uses PWA caching, but there is no recovery handler for stale chunk/preload failures after updates.

Implementation plan

1. Add a visible recovery fallback for route/load failures
- Wrap routed content with an error boundary so lazy-load/runtime failures show a recovery screen instead of a blank page.
- File: `src/App.tsx` (or a small imported error boundary)

2. Add chunk/preload failure recovery
- Handle stale bundle failures with a one-time reload strategy for Vite preload/chunk errors.
- If needed, tighten the PWA update behavior to reduce stale-cache navigation failures.
- Files: `src/main.tsx`, optionally `vite.config.ts`

3. Make auth/profile hydration explicit
- Stop silently swallowing profile fetch failures in `AuthContext`
- Track initial profile load success/failure
- Keep loading active until authenticated user data is either ready or fails in a controlled way
- File: `src/contexts/AuthContext.tsx`

4. Harden protected routes
- If user exists but profile is still loading, keep showing a loader
- If profile loading fails, show retry/sign-out recovery UI instead of rendering protected pages blindly
- File: `src/components/ProtectedRoute.tsx`

5. Fix post-login navigation flow
- Remove the immediate extra role lookup in the login form as the main redirect source
- Redirect only after auth/profile state is fully ready
- Use the hydrated profile role for navigation
- File: `src/pages/auth/Login.tsx`

6. Add entry-screen guards on first redirected pages
- Make admin/dashboard entry pages show controlled loading while required auth state is stabilizing
- Files: `src/pages/admin/AdminDashboard.tsx`, `src/components/mobile/MobileAdminDashboard.tsx`, `src/pages/dashboard/Dashboard.tsx`

7. Re-check the recent BlackBox fullscreen changes
- Ensure the white fullscreen BlackBox experience is strictly limited to `/dashboard/blackbox`
- Prevent it from affecting normal login/dashboard flows
- Files: `src/pages/dashboard/BlackBox.tsx`, `src/components/mobile/MobileBlackBox.tsx`

Validation
- Test login with `admin`, `admin@eternia.com`, and a student account
- Verify `/admin`, `/dashboard`, and `/dashboard/blackbox` all render normally
- Hard refresh on protected routes to confirm there is no white screen
- Confirm stale-chunk/update cases recover with a visible reload/retry path instead of failing silently

Technical details
- No database migration required
- No backend schema changes required
- This is mainly a frontend resiliency fix across auth, routing, and cache/update handling
