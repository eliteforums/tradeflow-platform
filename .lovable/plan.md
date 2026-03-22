

## Plan: TechSpec v2-31 Compliance + Scalability for Millions of Users

### Gap Analysis: TechSpec v2-31 vs Current Codebase

Most of v2-31 is already implemented (onboarding, RBAC, ECC system, dashboards, escalation model, training lifecycle, indexes). The gaps are in **scalability patterns** and **data access optimization** — critical for the "millions of users" target.

| # | Gap | TechSpec Section | Impact |
|---|-----|------------------|--------|
| 1 | No materialized view for credit balance | §12.1 | Every credit check does SUM() over entire transaction history — O(n) per user at scale |
| 2 | No cursor-based pagination | §13.1, §16.2 | List endpoints hit 1000-row Supabase limit; unbounded queries at scale |
| 3 | peer_messages not in realtime publication | §7.2 | Realtime subscription works via channel filter but publication ensures DB-level efficiency |
| 4 | Queries use SELECT * everywhere | §13.1 | Fetches unnecessary columns, wastes bandwidth and memory at scale |
| 5 | No debouncing on search/filter inputs | Performance | Every keystroke triggers re-renders and potential queries |
| 6 | Missing index on device_sessions.device_id_hash | §12.3 | Device validation on every auth request — needs fast lookup |
| 7 | No React.memo/useCallback optimization | Performance | Unnecessary re-renders cascade through component trees |
| 8 | Intern search in PeerConnect is non-functional | UI bug | Search input exists but doesn't filter anything |

### Changes

**1. Database Migrations (scalability foundation)**
- Create `credit_balance_view` materialized view: `SELECT user_id, SUM(delta) as balance FROM credit_transactions GROUP BY user_id`
- Add DB function to refresh the view (called after credit operations)
- Add `peer_messages` to realtime publication
- Add missing index on `device_sessions(device_id_hash)`
- Add index on `peer_messages(session_id, created_at)` for message pagination

**2. Optimize usePeerConnect.ts**
- Select only needed columns instead of `*` (intern query: `id, username, specialty, is_active, training_status`)
- Add message pagination: fetch last 50 messages, load more on scroll
- Add intern search filter (local filter on username/specialty)
- Memoize derived values with useMemo

**3. Optimize PeerConnect.tsx + MobilePeerConnect.tsx**
- Implement working search filter for intern list
- Add message pagination UI (load earlier messages button)
- Wrap handlers in useCallback to prevent re-renders
- Debounce search input

**4. Optimize AuthContext.tsx**
- Use materialized view for credit balance fetch (faster than SUM at scale)
- Add staleTime to prevent unnecessary refetches

**5. Optimize query patterns across hooks**
- `useAppointments.ts` — select specific columns, add cursor pagination
- `useBlackBox.ts` — paginate entries
- `useCredits.ts` — use materialized view

### Technical Details

**Materialized View Migration:**
```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS public.credit_balance_view AS
SELECT user_id, COALESCE(SUM(delta), 0)::integer AS balance,
       MAX(created_at) AS last_transaction_at
FROM public.credit_transactions
GROUP BY user_id;

CREATE UNIQUE INDEX idx_credit_balance_view_user ON public.credit_balance_view(user_id);

CREATE OR REPLACE FUNCTION public.refresh_credit_balance()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.credit_balance_view;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_refresh_credit_balance
AFTER INSERT ON public.credit_transactions
FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_credit_balance();
```

**Cursor Pagination Pattern (messages):**
```typescript
// Fetch last 50, then load more with cursor
const { data } = await supabase
  .from("peer_messages")
  .select("id, session_id, sender_id, content_encrypted, created_at")
  .eq("session_id", sessionId)
  .order("created_at", { ascending: false })
  .limit(50);
```

**Debounced Search:**
```typescript
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebouncedValue(searchTerm, 300);
const filteredInterns = useMemo(() =>
  interns.filter(i => i.username.toLowerCase().includes(debouncedSearch.toLowerCase())),
  [interns, debouncedSearch]
);
```

### Files to Edit

| # | File | Change |
|---|------|--------|
| 1 | DB Migration | Materialized view, indexes, realtime publication |
| 2 | `src/hooks/usePeerConnect.ts` | Column-specific selects, message pagination, search filter |
| 3 | `src/pages/dashboard/PeerConnect.tsx` | Working search, pagination UI, useCallback handlers |
| 4 | `src/components/mobile/MobilePeerConnect.tsx` | Same search/pagination parity |
| 5 | `src/contexts/AuthContext.tsx` | Optimized credit balance fetch |
| 6 | `src/hooks/useBlackBox.ts` | Paginated queries |
| 7 | `src/hooks/useAppointments.ts` | Column-specific selects |

### Summary
The codebase has all PRD features implemented. The gaps are performance and scalability patterns needed for millions of users: materialized views for O(1) balance lookups, cursor pagination to avoid unbounded queries, column-specific selects to reduce payload size, debounced inputs, and missing database indexes. No new features — purely optimization and scalability hardening.

