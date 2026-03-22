

## Plan: Clean Up Quest Cards — Remove Dead Code and Fix Duplicate Data

### Current State
The Quest Cards module is **already fully functional** with real database integration:
- Card flipping with CSS 3D animations works
- Answers save to `quest_completions` table with the `answer` column
- Admin "Quest Cards" tab in the dashboard has CRUD for questions and answer viewing
- 16 quest cards exist in the database (but there are **duplicates** — same titles appear twice from multiple seed migrations)

### Issues Found
1. **Dead code in shuffle logic** — Lines 19-24 in `QuestCards.tsx` create a `shuffled` array that's never used
2. **Duplicate quest cards in database** — 8 unique questions appear twice each (16 rows total), causing the same question to potentially appear multiple times in the 6-card deal
3. **No other "dummy" code** — all queries, mutations, and UI are real and functional

### Changes

**1. Clean up `src/pages/dashboard/QuestCards.tsx`**
- Remove the dead `shuffled` variable (lines 19-24)
- Improve the seeded shuffle to use a proper hash function for better randomization

**2. Remove duplicate quest cards from database**
- Use the insert tool (DELETE query) to remove the 8 duplicate rows, keeping only one copy of each question

### Files to modify
- `src/pages/dashboard/QuestCards.tsx` — Remove dead code, improve shuffle
- Database — Delete duplicate quest card rows

