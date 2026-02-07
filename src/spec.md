# Specification

## Summary
**Goal:** Add settlement periods with close/lock rules, adjustments, and balance carry-forward, and integrate these into statement generation and navigation.

**Planned changes:**
- Add backend SettlementPeriod data model and APIs to create/list/get/close periods, enforce non-overlapping date ranges, store statement link(s), and keep closed periods immutable.
- Add backend Adjustment data model and APIs to create/list adjustments, and enforce locking rules that block consignments/sales/returns/payouts dated inside closed periods while allowing adjustments.
- Implement settlement close accounting in the backend: compute/store per-rep opening and closing balances for a period and carry forward closing balances to the next period’s opening balances.
- Add a frontend Settlement Periods management page to create, view, and close periods and to navigate to statements linked to a period.
- Update statements UI to support generating/viewing statements by settlement period (in addition to existing monthly flow), display opening/closing balances, and persist/link generated statements to the settlement period.
- Enforce settlement locking in the frontend for create/edit flows (consignments, sales, returns, payouts) with clear English messaging and a path to create an adjustment.
- Add a frontend Adjustments UI to create and list adjustments, including adjustments dated within closed settlement periods.

**User-visible outcome:** Users can manage settlement periods, close them to lock normal transactions within the date range, record adjustments inside closed periods, generate statements for a settlement period showing opening/closing balances, and revisit linked statements from the settlement period view.
