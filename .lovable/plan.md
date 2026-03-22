

## Plan: Redesign Quest Cards as Card Game + Admin Tools Tab

### Overview
Transform Quest Cards from a task-completion checklist into an interactive card-flipping game. 6 randomized cards face-down, user flips one to reveal a question, types an answer that gets saved. Admin gets a new "Tools" tab to manage questions and view user answers.

### Database Changes

**1. Add `answer` column to `quest_completions`**
```sql
ALTER TABLE quest_completions ADD COLUMN answer text;
```

**2. Add RLS policy for admins to view all quest completions**
```sql
CREATE POLICY "Admins can view all quest completions"
ON quest_completions FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));
```

**3. Add admin INSERT/UPDATE/DELETE policies on `quest_cards`**
Currently admins cannot insert, update, or delete quest cards. Add:
```sql
CREATE POLICY "Admins can manage quest cards" ON quest_cards
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));
```

### Frontend Changes

**4. Rewrite `src/pages/dashboard/QuestCards.tsx`**
- Replace current list UI with a card-game layout
- Show 6 cards face-down in a 3×2 grid (responsive: 2×3 on mobile) + a deck visual on the side
- Click a card → flip animation (CSS transform rotateY) → reveals the question text
- Below the flipped card, show a text input + "Submit" button
- On submit: save answer to `quest_completions.answer`, award XP, flip card to "done" state
- Cards already answered today show as completed (green, no re-flip)
- Questions are randomized from the full `quest_cards` pool (pick 6 random)

**5. Remove `src/components/selfhelp/QuestCard3D.tsx`**
No longer needed — the 3D/three.js cards are replaced by the new 2D card-flip game.

**6. Update `src/hooks/useQuests.ts`**
- Add `answer` field to the `completeQuest` mutation (accept answer string)
- Insert answer into `quest_completions.answer`
- Fetch completions with answer field

**7. Add admin "Tools" tab to `src/pages/admin/AdminDashboard.tsx`**
- Add `"tools"` to the `TabId` union type
- Add sidebar entry under "Content" group with a Gamepad/Wrench icon
- New `QuestCardManager` component with two sections:
  - **Manage Questions**: List all quest_cards with inline edit/delete + "Add Question" form (title, description, xp_reward, category)
  - **View Answers**: Table of recent quest_completions showing username, question title, answer text, date

**8. Create `src/components/admin/QuestCardManager.tsx`**
- CRUD for quest_cards (add, edit title/description/xp, toggle active, delete)
- Table view of quest_completions with answers, joined with quest title and user profile
- Search/filter by question or user

**9. Same "Tools" tab addition to `src/components/mobile/MobileAdminDashboard.tsx`**

### Files to Create/Modify
- **Migration**: Add `answer` column + admin RLS policies
- **Create**: `src/components/admin/QuestCardManager.tsx`
- **Rewrite**: `src/pages/dashboard/QuestCards.tsx` (card-flip game)
- **Edit**: `src/hooks/useQuests.ts` (add answer support)
- **Edit**: `src/pages/admin/AdminDashboard.tsx` (add "Tools" tab)
- **Edit**: `src/components/mobile/MobileAdminDashboard.tsx` (add "Tools" tab)
- **Delete**: `src/components/selfhelp/QuestCard3D.tsx`

