

## Plan: Restore Eternia Code Display in Mobile Admin Institution Cards

### Problem
The `MobileAdminDashboard.tsx` renders institution cards inline (lines 257-274) in the "spoc" tab but never displays `eternia_code_hash`. The desktop admin dashboard uses `InstitutionManager` component which does show the code, but the mobile version has a custom inline layout that omits it.

### Fix

**File**: `src/components/mobile/MobileAdminDashboard.tsx`  
**Change**: Add an Eternia Code display row with copy button to the institution card, between the SPOC info and the stats grid (after line 268, before line 269).

Add a row like:
```
<div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/30">
  <div>
    <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Eternia Code</p>
    <code className="text-sm font-mono font-bold tracking-widest">{inst.eternia_code_hash}</code>
  </div>
  <copy button>
</div>
```

Will need to add `Copy`, `Check` icon imports and a `copiedId` state for the copy-to-clipboard interaction.

### Files Modified

| File | Change |
|------|--------|
| `src/components/mobile/MobileAdminDashboard.tsx` | Add Eternia Code display + copy button to institution cards |

