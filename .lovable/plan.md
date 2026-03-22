

## Plan: Fix "User not found" in Role Assignment

### Root Cause
The RoleManager queries `profiles` by exact username match. If the user doesn't exist yet, or the admin types the username incorrectly, it fails with "User not found." This is not a bug — it's a UX gap. The admin likely needs to **create** the user first via "Add Member" with Therapist role, not assign a role to a non-existent user.

### Changes

| # | File | Change |
|---|------|--------|
| 1 | `src/components/admin/RoleManager.tsx` | Replace free-text username input with a searchable dropdown that queries existing profiles, preventing "user not found" errors entirely |
| 2 | `src/components/admin/RoleManager.tsx` | Improve error message to suggest using "Add Member" if user doesn't exist |

### Technical Details

**1. Searchable user dropdown in RoleManager**

Replace the plain `<Input>` for username with a combo that fetches profiles and shows matching usernames + current roles:

```typescript
const { data: profiles = [] } = useQuery({
  queryKey: ["admin-profiles-search", searchTerm],
  queryFn: async () => {
    const query = supabase
      .from("profiles")
      .select("id, username, role")
      .order("username")
      .limit(20);
    if (searchTerm) query.ilike("username", `%${searchTerm}%`);
    const { data } = await query;
    return data || [];
  },
  enabled: searchTerm.length > 0,
});
```

Then use the selected profile's ID directly in the mutation instead of querying by username again — eliminating the "not found" error entirely.

**2. Better error fallback**

If somehow the profile lookup still fails, show: `"User not found. Create them first using 'Add Member' above."`

### Summary
2 changes in 1 file. Core fix: replace free-text username with a searchable dropdown of existing users, making it impossible to get "user not found."

