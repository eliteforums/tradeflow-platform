

## Plan: Fix Quest Cards Loading Issue

### Root Cause Analysis

The Quest Cards page has two potential loading issues:

1. **3D Canvas hanging**: The `QuestCard3D` component uses `@react-three/fiber` Canvas with external Google Fonts loading. If the Canvas fails to initialize or fonts fail to load, the entire page appears frozen with no error feedback.

2. **No error boundary**: If the Three.js canvas throws, there's no fallback — React unmounts everything and the user sees a blank/stuck page.

### Changes

#### 1. `src/components/selfhelp/QuestCard3D.tsx`
- Wrap the Canvas in a React error boundary with fallback to 2D cards
- Add a loading timeout — if the Canvas doesn't render within 5 seconds, fall back to 2D cards
- Always render the 2D fallback grid if the 3D canvas fails

#### 2. `src/pages/dashboard/QuestCards.tsx`
- Add an empty state when `quests.length === 0` after loading completes
- Add error handling display if the queries fail
- Show a loading indicator on quest buttons during completion (`isCompleting` state)

#### 3. `src/hooks/useQuests.ts`
- Add `retry: 1` to both queries to prevent indefinite retries on failure
- Add error state to the return value so the page can display errors

### Files Modified

| File | Change |
|------|--------|
| `src/components/selfhelp/QuestCard3D.tsx` | Add error boundary + timeout fallback to 2D cards |
| `src/pages/dashboard/QuestCards.tsx` | Add empty state, error display, button loading states |
| `src/hooks/useQuests.ts` | Add retry limits, expose error state |

