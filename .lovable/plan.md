

## Fix: Allow Experts to Schedule Slots for Today

### Problem
The calendar date picker in both desktop (`ExpertDashboardContent.tsx` line 721) and mobile (`MobileExpertDashboard.tsx` line 283) uses `disabled={(date) => date < new Date()}`. Since `new Date()` includes the current time (e.g., 3:45 PM), today's date object (midnight) is always "less than" the current moment, so today is disabled.

### Solution
Change the comparison to use the start of today instead:

```typescript
// Before
disabled={(date) => date < new Date()}

// After  
disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
```

### Files
1. `src/components/expert/ExpertDashboardContent.tsx` — line 721
2. `src/components/mobile/MobileExpertDashboard.tsx` — line 283

Two single-line fixes. No other modules use this pattern.

