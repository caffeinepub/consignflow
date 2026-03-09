# ConsignFlow

## Current State
- Full consignment management app with: Products, Reps, Consignments, Sales, Returns, Payouts, Adjustments, Statements, Settlement Periods
- Public LandingPage with hero + value cards
- WelcomeScreen (first-run onboarding)
- LoginPage with Internet Identity + localStorage persistence
- AppLayout: top header with user menu + horizontal scrollable tab nav
- Dashboard with rep balances and inventory tabs

## Requested Changes (Diff)

### Add
- **Global Navigation Shell (left sidebar)**: 64px collapsed / 240px expanded fixed sidebar, replacing the horizontal tab nav. Lifecycle-ordered sections: Dashboard, Pipeline (Consignments), Inventory (Products), Contracts (Reps), Payouts, Disputes (Adjustments), Settings. Active section has left border accent. Numeric badges for pending action counts. Keyboard shortcut `[` to toggle collapse, `⌘K` command palette. On mobile: bottom tab bar (5 items max, overflow in sheet).
- **Persistent System Timeline drawer**: Right-side collapsible drawer (320px), opened via clock/bell icon in top-right header. Shows chronological events: consign_out, sale, return, payout, adjustment, period_close. Filter bar: All | Financial | Inventory | Disputes | Periods. Events grouped by date (Today, Yesterday, date). Unread indicator (blue left border). Click event navigates to relevant page. Keyboard shortcut `T` to toggle. Each event has color-coded dot, entity label, and timestamp.
- **Command palette** (`⌘K`): Quick jump to any section or action.

### Modify
- **AppLayout**: Replace horizontal nav with left sidebar. Keep top header but add timeline toggle button (clock icon) in the right area next to user menu. Main content shifts right to accommodate sidebar.
- **Navigation grouping**: Group lifecycle: Dashboard → Pipeline (Consignments) → Inventory (Products) → Contracts (Reps) → Payouts → Disputes (Adjustments/Returns) → Statements → Settlement Periods → Settings.

### Remove
- Horizontal tab navigation bar (replaced by sidebar)

## Implementation Plan
1. Create `GlobalSidebar` component with collapse/expand, lifecycle nav items, active state, badges
2. Create `SystemTimeline` drawer component with event list, filters, grouping by date, unread indicator
3. Create `CommandPalette` component triggered by ⌘K
4. Update `AppLayout` to use sidebar layout: sidebar left + main content right + timeline drawer overlay
5. Add keyboard shortcuts: `[` = toggle sidebar, `T` = toggle timeline, `⌘K` = command palette
6. Wire timeline events from existing query hooks (consignments, sales, returns, payouts, adjustments)
7. Add deterministic data-ocid markers to all interactive surfaces
