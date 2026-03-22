

## Codebase Audit: Issues Found

After reviewing all modules — auth, dashboard, self-help tools, hooks, RLS policies, routing, and layout — here are the issues discovered:

---

### CRITICAL: Students Cannot Earn ECC (RLS Policy Blocks Inserts)

The `credit_transactions` table RLS only allows **admins and SPOCs** to INSERT rows. However, these hooks all attempt to insert as a regular student user:

- `useEccEarn` — inserts `type: "earn"` rows for journaling, mood tracker, gratitude
- `useQuests` — inserts `type: "earn"` rows for quest completions
- `useCredits.earnCredits` / `useCredits.spendCredits` — inserts earn/spend rows

**Impact**: Every self-help ECC reward and credit spend will silently fail with an RLS violation. Students effectively cannot earn or spend credits.

**Fix**: Add an RLS policy allowing authenticated users to insert their own `credit_transactions`:
```sql
CREATE POLICY "Users can insert own credit transactions"
ON public.credit_transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

---

### BUG: `useState` Misused as `useEffect` in Register.tsx

Line 33 of `Register.tsx` uses `useState(() => { ... })` to run a side effect (fetching institution type). This is the state initializer — it should be `useEffect`. While it technically fires once, it's a React anti-pattern and will not re-run if dependencies change.

**Fix**: Replace `useState(() => { ... })` with `useEffect(() => { ... }, [])`.

---

### UI: Wrong Icons for Mood and Gratitude in Dashboard Quick Tools

In both `Dashboard.tsx` (line 59) and `MobileDashboard.tsx` (line 87-88):
- "Mood" uses the `Music` icon instead of `BarChart3`
- "Gratitude" on mobile uses `Sparkles` instead of `Heart`

**Fix**: Use `BarChart3` for Mood and `Heart` for Gratitude to match the Self-Help hub.

---

### MINOR: Self-Help Hub Missing from Dashboard Quick Links (Desktop)

The desktop `Dashboard.tsx` quick tools section has Quest Cards, Journaling, Mood, Wallet — but no Gratitude shortcut. The mobile version has Mood and Gratitude but not Quest Cards or Journaling. Neither links to the Self-Help hub itself from quick tools.

**Fix**: Harmonize quick tool shortcuts across desktop and mobile to include the same set.

---

### Summary of Changes

| File | Change |
|------|--------|
| Migration SQL | Add RLS INSERT policy for students on `credit_transactions` |
| `src/pages/auth/Register.tsx` | Replace `useState` with `useEffect` for institution type fetch |
| `src/pages/dashboard/Dashboard.tsx` | Fix Mood icon to `BarChart3`, add Gratitude with `Heart` icon |
| `src/components/mobile/MobileDashboard.tsx` | Fix Mood icon to `BarChart3`, fix Gratitude icon to `Heart` |

The RLS fix is the highest priority — without it, all ECC earning and spending features are broken for students.

