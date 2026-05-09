# UI/UX Audit - InsightSphere Frontend

Tanggal audit: 2026-05-04 (Asia/Jakarta)

Scope:
- Frontend Next.js di `frontend/`
- Existing audit baseline: `docs/analysis/UI_UX_AUDIT_2026-05-02.md`
- Static scan with `rg`
- `npm run typecheck`
- `npm run lint -- --quiet`
- Visual/runtime check via Playwright on `http://127.0.0.1:3000`

Visual evidence:
- Login select desktop: `frontend/output/playwright/.playwright-cli/page-2026-05-03T17-25-10-956Z.png`
- Dashboard desktop: `frontend/output/playwright/.playwright-cli/page-2026-05-03T17-26-20-544Z.png`
- Dashboard mobile accessibility snapshot: `frontend/output/playwright/.playwright-cli/page-2026-05-03T17-26-35-521Z.yml`

Notes:
- Auth was mocked as admin through `/api/auth/me` for the dashboard visual pass.
- POS stock was mocked through `/api/backend/inventory/stock**` to avoid backend availability affecting the UI audit.
- Mobile dashboard navigation at 390x844 succeeded with no console errors, but the follow-up mobile screenshot command was blocked by the approval/usage guard. The audit below uses the successful mobile snapshot plus static responsive scans.

## Executive Summary

The frontend is in a much healthier state than the May 2 baseline: typecheck passes, quiet lint passes, the table migration is complete for raw table surfaces, chart runtime QA is clean, inventory stock data now loads through the real backend/proxy path, and the desktop dashboard reads as a credible dense operations UI. The original P1 blockers plus the tracked P2 typography/iconography/framework-warning follow-ups are now resolved or explicitly scoped.

Current gate status:
- `npm run typecheck` passes.
- `npm run lint -- --quiet` passes.
- Chart runtime QA has 0 Recharts sizing warnings, 0 zero-size chart surfaces, and 0 response errors across 16 desktop/mobile checks.
- Login select render has 1 expected auth 401 console error before auth mocking.
- i18n runtime sweep has 0 key leaks and 0 `[i18n] Missing key` warnings across 32 admin UI checks.
- Typography exception review is complete: remaining `T.micro` usage is scoped to badges/chips/status/compact codes, and app surfaces have no `font-mono`, `font-extrabold`, `text-[8px]`, `text-[11px]`, `text-[12px]`, or `text-[13px]` matches outside the banned-pattern reference list.
- The Next dev `scroll-behavior: smooth` warning was addressed by marking the root document with `data-scroll-behavior="smooth"`.

Recommended next priority:
1. Run a final desktop/mobile visual regression smoke on the primary admin/POS flows after the latest visual-system changes.
2. Add optional lint guardrails for future typography/table/form drift now that the baseline is clean.

## Findings

### P1 - Chart Runtime Warnings Resolved And Runtime QA Passed

Evidence:
- Previous dashboard runtime checks produced repeated Recharts warnings: width and height are `-1`.
- The root cause is Recharts 3 rendering once with `initialDimension` `{ width: -1, height: -1 }` before `ResizeObserver` resolves layout.
- Static scan now routes app chart containers through `StableResponsiveContainer`.
- Direct app usage of Recharts `ResponsiveContainer` is limited to the shared wrapper and type references.
- Browser runtime QA rerun passed on desktop `1440x900` and mobile `390x844`.
- Covered dashboard, `PrediksiStokPage`, `LaporanPage` dashboard/sales/inventory tabs, XAI compare, MLOps, and inventory detail drawer.
- Result: 16/16 checks completed, 0 Recharts sizing warnings, 0 zero-size chart surfaces, 0 response errors.
- The only non-chart console warning was the Next dev `scroll-behavior: smooth` message; this follow-up has since been addressed in the root layout.

Impact:
- Chart surfaces now render with positive container and SVG dimensions on the tested desktop/mobile routes.
- The previous chart sizing warning risk is resolved for the covered app surfaces.

Implementation update - 2026-05-04:
- Added `frontend/src/app/components/charts/StableResponsiveContainer.tsx`.
- The wrapper sets `debounce={200}`, `initialDimension={{ width: 1, height: 1 }}`, `minWidth={1}`, and `minHeight={1}` by default.
- Migrated chart surfaces in `ForecastChart`, `TopProductsChart`, `ExplanationCharts`, `Dashboard`-adjacent charts, `PrediksiStokPage`, `LaporanPage`, `InventarisPage`, `XAIPage`, `MLOpsDashboardPage`, and the shared `ui/chart` wrapper.
- Verification passed: `npm run typecheck`; `npm run lint -- --quiet`.
- Runtime QA runner `output/playwright/chart-runtime-check.js` was updated to avoid clicking behind the inventory detail overlay during setup.
- Runtime QA screenshots captured: `output/playwright/chartqa-*.png`.

### P1 - Chart Color Tokens Are Not Fully Applied

Evidence:
- `frontend/src/app/components/TopProductsChart.tsx:50-51` defines hardcoded `BAR_COLORS_*` arrays.
- `frontend/src/app/components/TopProductsChart.tsx:98` and `:106` use hardcoded chart colors.
- `frontend/src/app/components/ForecastChart.tsx:193-246` has hardcoded hex colors across gradients, grid, ticks, tooltip cursor, and line colors.
- `frontend/src/app/components/pages/InventarisPage.tsx:477-481` has hardcoded indigo chart colors.
- `frontend/src/app/components/ExplanationCharts.tsx:157` uses a hardcoded emerald fill.

Impact:
- Light/dark behavior and semantic chart meaning can drift from `CHART_COLORS`.
- Future palette changes will not propagate reliably.

Fix direction:
- Replace hardcoded chart colors with `CHART_COLORS.primary`, `CHART_COLORS.series`, `CHART_COLORS.semantic`, `CHART_COLORS.axis`, `CHART_COLORS.grid`, and `CHART_COLORS.tooltip`.

Implementation update 2026-05-04:
- Residual hardcoded chart tooltip foreground colors were replaced with `CHART_COLORS.tooltip.foregroundDark`.
- The sales chart dot stroke was moved to `CHART_COLORS.tooltip.bg`.
- The malformed `offset="5%\"` gradient stop in `ForecastChart` was fixed.
- Static scan for hardcoded chart hex colors in the P1-B target files is clean.
- Verification passed: `npm run typecheck`, `npm run lint -- --quiet`.

### P1 - Accessible Names Missing i18n Keys Resolved

Evidence:
- Previous runtime warnings showed missing ID locale keys: `common.menu`, `common.language`, and `notif.title`.
- The leaked keys were used in accessible names:
  - `frontend/src/app/components/Header.tsx:114`
  - `frontend/src/app/components/Header.tsx:197`
  - `frontend/src/app/components/NotificationCenter.tsx:192`
- Previous mobile snapshot confirmed accessibility labels like `button "common.menu"` and `button "notif.title, 2 unread"`.
- Static re-verification found 1,179 keys in ID and 1,179 keys in EN; 963 literal `t(...)` call keys are covered in both locales.
- Static re-verification found 0 missing literal translation keys and 0 remaining literal `t("key") || fallback` calls.
- Runtime re-verification covered 8 authenticated admin routes, ID/EN locale, desktop `1440x900`, mobile `390x844`, and notification drawer states.
- Runtime re-verification result: 32/32 checks passed, 0 visible/accessibility key leaks, and 0 `[i18n] Missing key` warnings.

Impact:
- Screen reader labels now resolve to user-facing ID/EN strings instead of implementation keys.
- Automated accessibility assertions can target translated accessible names without accepting raw key fallbacks.

Implementation update - 2026-05-04:
- Added missing ID/EN keys for `common.menu`, `common.language`, `notif.title`, pagination labels, store operating-hour labels, and POS logout.
- Removed dead literal fallback expressions from accessible labels now backed by dictionary entries.
- Verification passed: `node output/playwright/i18n-static-check.mjs`; Playwright runtime runner `output/playwright/i18n-runtime-check.js`; `npm run typecheck`; `npm run lint -- --quiet`.
- Evidence screenshots: `output/playwright/i18nqa-*.png`.
- Runtime QA initially recorded non-i18n chart sizing warnings and inventory stock API 500 responses; both have since been resolved outside P1-C.

### P1 - ResponsiveTable Migration Completed For Raw Table Surfaces

Evidence:
- Static scan found 0 raw table surfaces still using `w-full`/classless table markup.
- 21 `<ResponsiveTable` usages are present.
- Automated mobile/desktop table QA passed on the migrated table surfaces and related modals.

Impact:
- Data-heavy surfaces now share the same scroll affordance, tokenized row/cell styling, table region label, and first-column sticky behavior.
- Skeleton and modal tables no longer diverge from the table-system markup scan.

Fix direction:
- Keep the Playwright QA runner and screenshots as regression evidence; manual spot-checks can focus on visual polish instead of migration correctness.
- Keep future table additions on `ResponsiveTable`, `TABLE.base`, `TABLE.head`, `TABLE.headCell`, `TABLE.body`, `TABLE.rowHover`, and numeric cell tokens.

Implementation update - 2026-05-04:
- Batch 1 migrated `StockMovementPage`, `UserManagementPage`, and `InventarisPage` to `ResponsiveTable`.
- Batch 2 migrated `PredictionTable`, `TopProductsChart`, and the `LaporanPage` restock trace table.
- Batch 3 migrated `CashManagementPage` plus team, permission matrix, and login-history tables in `PengaturanPage`.
- Batch 4 migrated inventory modal tables (`ExcelImportModal`, `StockOpnameModal`, `StockTransferModal`) and skeleton table placeholders; receipt print HTML was adjusted so it no longer appears as an app table surface in the scan.
- Target pages now use `TABLE.base` plus table `aria-label`, tokenized headers/cells, sticky first identity column, and mobile horizontal-scroll affordance.
- Post-batch scan: 21 `<ResponsiveTable` usages, 0 remaining raw table surfaces.
- Verification passed: `npm run typecheck`; `npm run lint -- --quiet`.

QA update - 2026-05-04:
- Playwright QA ran authenticated admin checks on desktop `1440x900` and mobile `390x844`.
- Covered dashboard tables, `InventarisPage`, `StockMovementPage`, `UserManagementPage`, `PredictionTable`, `LaporanPage` inventory tab, `CashManagementPage`, `PengaturanPage` access/security tables, and inventory transfer/opname/import modals.
- Result: 24/24 screenshots captured, 0 page overflow findings, 0 raw table surfaces, sticky first columns stayed anchored after horizontal scroll, and no console/response errors were recorded.
- Evidence: `output/playwright/tableqa-*.png`; runner: `output/playwright/tableqa-runner.js`.

### P1 - Form Token Divergence Resolved For App Surfaces

Evidence:
- Previous static scan found 44 placeholder/focus/ring divergence matches.
- Previous high-signal examples:
  - `frontend/src/app/components/inventory/ProductForm.tsx:109`, `:125`, `:141`, `:162`, `:176`, `:190`, `:207`
  - `frontend/src/app/components/pos/JobQueuePanel.tsx:131`, `:142`, `:154`
  - `frontend/src/app/components/pos/CartPanel.tsx:221`, `:290`, `:334`
  - `frontend/src/app/components/PredictionTable.tsx:91`
  - `frontend/src/app/components/pages/InventarisPage.tsx:298`
  - `frontend/src/app/components/pages/TransactionHistoryPage.tsx:375`
- Static re-scan now finds 0 app-level placeholder/focus/ring divergence matches after excluding non-form shadcn primitives.
- The only remaining raw matches are `components/ui/resizable.tsx` and `components/ui/slider.tsx`, which are low-level interaction primitives rather than text-entry form workflows.

Impact:
- POS, inventory, prediction, transaction, settings, profile, and export/share form controls now share canonical placeholder contrast and visible focus treatment.
- Operationally important keyboard-heavy workflows now align to the app form system.

Implementation update - 2026-05-04:
- Batch 1 migrated `ProductForm`, `JobQueuePanel`, `CartPanel`, `PredictionTable` search, `InventarisPage` search, and `TransactionHistoryPage` search.
- Batch 2 migrated inventory stock/opname/transfer modals plus POS search, prediction page search, stock check, refund, and service search controls.
- Batch 3 migrated command palette placeholder contrast, portal login placeholder contrast, export/share inputs, settings security code inputs, and user profile edit fields.
- Verification passed: `npm run typecheck`; `npm run lint -- --quiet`.

### P1 - Brand Naming Normalized To InsightSphere

Evidence:
- Browser metadata now says `InsightSphere — AI-Powered Retail ERP`: `frontend/app/layout.tsx:20`.
- Dashboard footer now says `© 2026 InsightSphere — AI-Powered Retail ERP`: `frontend/src/app/components/pages/DashboardPage.tsx:471`.
- i18n share/team and branch labels now use `InsightSphere`: `frontend/src/app/i18n.tsx:360`, `:392`, `:510`, `:1654`, `:1685`, `:1803`.
- Static scan across `frontend/app` and `frontend/src/app` found no remaining `SmartStock`, `Smart Stock`, `smartstock`, or `smart-stock` references in app source after removing the stale internal cookie comment mention.

Impact:
- Product chrome, generated/share text, branch labels, metadata, and error states now present a single product name.

Implementation update - 2026-05-04:
- Re-verified the old audit targets: metadata, dashboard footer, i18n share/team copy, branch labels, and app chrome.
- Updated `frontend/src/app/lib/auth-cookie.ts` so the retained `ss_access_token` cookie prefix is documented as legacy compatibility without referencing the old product name.
- Verification passed: static brand scan; `npm run typecheck`; `npm run lint -- --quiet`.

### P1 - Inventory Stock API 500 Resolved

Evidence:
- Direct backend reproduction of `GET /inventory/stock?limit=5` returned 500 with `psycopg2.errors.UndefinedTable: relation "inventory" does not exist`.
- Live database schema was missing `products`, `inventory`, and `stock_movements`.
- After initializing missing POS/inventory tables and running the idempotent inventory seed, direct backend `GET /inventory/stock?limit=3&store_nbr=1` returns 200 with stock rows.
- Next proxy verification through `/api/backend/inventory/stock?limit=3&store_nbr=1` returns 200 after `/api/auth/login`.
- Playwright smoke on `/kasir` observed `/api/backend/inventory/stock` status 200 and 0 inventory response errors.

Impact:
- POS/product loading no longer falls back because of backend 500 for the normal inventory stock request.
- Backend stock rows now include POS-needed product metadata: family, unit, price, and image URL.

Implementation update - 2026-05-04:
- Added `product_family`, `product_unit`, `product_price`, and `product_image_url` to `InventoryResponse` and populated them in the inventory service.
- Fixed stock route store scoping so cashier/inventory-manager requests default to their own `store_nbr` before access validation.
- Made `domains.inventory.seed` idempotent and Windows-console safe, including missing table creation and Store #1 fallback.
- Normalized UUID inputs in the inventory repository and made soft-deleted products hidden from product detail reads.
- Local DB remediation run: `python init_db_pos.py`; `python -m domains.inventory.seed`; backend restarted on `127.0.0.1:8000`.
- Verification passed: `pytest tests/domains/test_inventory.py -q`; direct backend stock/summary requests; Next proxy stock request; Playwright Kasir smoke screenshot `output/playwright/backendqa-kasir-stock.png`.

### P2 - Typography Exceptions Reviewed And Scoped

Evidence:
- Static scan now finds 52 `T.micro` uses in `app`/`src/app`, far below the previous 500+ count.
- The remaining `T.micro` usages are scoped to visible badges/chips/status indicators, notification counters, POS stock markers, chart/event badges, role/status tags, and compact exported-message or code-like UI signals.
- Non-badge usages were replaced with more appropriate tokens in command palette trigger text, KPI value display, error-boundary buttons/labels, import and auth step indicators, chart rank markers, branch initials, inventory days-left counters, member initials, and XAI SKU-prefix markers.
- Static re-scan found no `font-mono`, `font-extrabold`, `text-[8px]`, `text-[11px]`, `text-[12px]`, or `text-[13px]` matches in app surfaces after excluding the `BANNED_PATTERNS` reference list.
- Token files still contain small text and heavy weight definitions:
  - `frontend/src/app/lib/typography.ts:36`, `:61`, `:64`, `:71`, `:79`, `:85`, `:105`
  - `frontend/src/app/lib/data.ts:140`, `:229`, `:281`, `:283`, `:285`, `:327`

Impact:
- Typography now reads as an intentional dense admin system rather than accidental micro-text drift.
- Remaining heavy display weights are treated as KPI/display exceptions, while small text remains constrained to badges, labels, short codes, compact data, and utility primitives.

Implementation update - 2026-05-04:
- Replaced raw `text-xs font-medium` on the command palette trigger with `T.bodySm`.
- Replaced non-badge `T.micro` usages with `T.label`, `T.dataSm`, or `T.code` in `ExcelImportModal`, forgot-password sent steps, `TopProductsChart`, `DashboardPage`, `InventarisPage`, `PengaturanPage`, and `XAIPage`.
- Replaced raw KPI value typography in `KPICards` with `T.kpiCard`.
- Removed uppercase tracking treatment from `ErrorBoundary` fallback labels/buttons where it was normal action text.
- Verification passed: `npm run typecheck`; `npm run lint -- --quiet`.

### P2 - Smooth Scroll Framework Warning Addressed

Evidence:
- Chart runtime QA reported one non-chart Next dev warning because `html` has global `scroll-behavior: smooth` in `frontend/app/globals.css`.
- Next recommends explicitly adding `data-scroll-behavior="smooth"` to the root document when global smooth scroll is intentional.

Impact:
- Dev/runtime QA output is cleaner, and the remaining warning no longer obscures chart/runtime regressions.

Implementation update - 2026-05-04:
- Added `data-scroll-behavior="smooth"` to `<html>` in `frontend/app/layout.tsx`.
- Verification passed: `npm run typecheck`; `npm run lint -- --quiet`.

### P2 - UI Emoji Signals Replaced With Lucide Icons

Evidence:
- Previous target areas in `PredictionTable`, `KasirPage`, and `ExcelImportModal` now render Lucide status/hint/validation icons.
- `frontend/src/app/components/ExportShareModal.tsx` now uses `CheckCheck` for the WhatsApp preview read receipt instead of `✓✓`.
- `frontend/src/app/components/pos/CartPanel.tsx` now uses `X` icon buttons with translated cancel labels for inline price and discount cancel controls instead of text `✕`.
- Static scan now leaves emoji only inside `formatWAMessage()` in `ExportShareModal`, where they are intentionally part of outgoing WhatsApp message content rather than app UI controls.

Impact:
- UI status, validation, hint, and cancel affordances now use consistent SVG iconography.
- Screen readers no longer need to interpret decorative UI emoji/symbols as control text in the cleaned surfaces.

Implementation update - 2026-05-04:
- Replaced the WhatsApp preview read receipt marker with Lucide `CheckCheck`.
- Replaced CartPanel inline cancel symbols with Lucide `X` icon buttons and `aria-label={t("common.cancel")}`.
- Verification passed: static emoji/symbol scan; `npm run typecheck`; `npm run lint -- --quiet`.

## Recommended Migration Order

1. Final regression pass: run one desktop/mobile smoke across dashboard, inventory, POS, reports, settings, and XAI after the latest typography/layout changes.
2. Guardrail pass: add optional lint/static checks for future typography/table/form drift.

Completed P1 follow-ups:
- i18n accessibility pass: completed and re-verified with static + runtime QA.
- Table pass: completed and re-verified with mobile/desktop table QA.
- Chart sizing implementation: completed and re-verified with mobile/desktop chart runtime QA.
- Form pass: completed for app-level text-entry surfaces and verified with static scan plus typecheck/lint.
- Brand pass: completed and verified with static source scan plus typecheck/lint.

Completed P2 follow-ups:
- Iconography pass: completed for first-party UI emoji/symbol signals and verified with static scan plus typecheck/lint.
- Typography token review: completed and verified with static scan plus typecheck/lint.
- Smooth scroll framework warning: completed by annotating the root document with `data-scroll-behavior="smooth"`.

Completed backend/data-state follow-ups:
- Inventory stock API 500: resolved and verified through direct backend, Next proxy, and Kasir browser smoke.

## Verification Commands

```powershell
cd C:\Portfolio\InsightSphere\frontend
npm run typecheck
# passes

npm run lint -- --quiet
# passes

cd C:\Portfolio\InsightSphere
node output/playwright/i18n-static-check.mjs
# passes

rg -n "SmartStock|Smart Stock|smartstock|smart-stock" frontend/app frontend/src/app -g "*.tsx" -g "*.ts" -g "*.json"
# no matches

rg -n "⚠|📉|✅|💡|❌|✓|✕|📊|📝|📅|🔴|🟡|⚪" frontend/app frontend/src/app -g "*.tsx" -g "*.ts"
# matches only intentionally exported WhatsApp message content

(rg -n "T\.micro" frontend/app frontend/src/app -g "*.tsx" -g "*.ts" | Measure-Object).Count
# 52

rg -n "font-mono|font-extrabold|text-\[8px\]|text-\[11px\]|text-\[12px\]|text-\[13px\]" frontend/app frontend/src/app -g "*.tsx" -g "*.ts" -g "!frontend/src/app/lib/typography.ts"
# no matches

rg -n "data-scroll-behavior|scroll-behavior" frontend/app/layout.tsx frontend/app/globals.css
# confirms root annotation and global smooth-scroll rule

cd C:\Portfolio\InsightSphere\backend
..\.venv\Scripts\python.exe -m pytest tests/domains/test_inventory.py -q
# passes
```

Visual check:

```powershell
cd C:\Portfolio\InsightSphere\frontend
npm run dev -- --hostname 127.0.0.1 --port 3000
# rendered through Playwright at http://127.0.0.1:3000
```
