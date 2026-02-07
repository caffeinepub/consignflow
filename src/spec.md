# Specification

## Summary
**Goal:** Build ConsignFlow, a web app to track consignment operations (products, reps, consignments, sales, returns, payouts) with dashboards, CSV exports, and printable monthly statements.

**Planned changes:**
- Implement backend data models and persistent storage for Products, Reps, Consignments (with line items), Sales (with line items and unit price), Returns (with line items), and Payouts.
- Expose backend CRUD APIs for all entities, including list/filter by rep and date range, with user-friendly validation errors.
- Build frontend CRUD screens for each entity (list, detail, create/edit), including multi-line-item entry for consignments/sales/returns and basic filtering/search.
- Add dashboard views and calculations for amount owed by rep, inventory by rep, and profit/commission using configurable commission rules (default % with per-rep overrides).
- Add CSV export actions for each entity and for key reports (owed-by-rep, inventory-by-rep), including date-range exporting and line-item row format.
- Generate print-friendly monthly statements per rep with itemized sales/returns/payouts, summary totals, and a browser print/PDF-ready layout.
- Apply a consistent visual theme across the app and print views, avoiding blue/purple as primary brand colors.

**User-visible outcome:** Users can manage all consignment records, view owed/inventory/commission dashboards, export data and reports as CSV, and generate clean printable monthly statements per rep.
