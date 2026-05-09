# UI/UX Audit - InsightSphere Frontend

Tanggal audit: 2026-05-02

Update note 2026-05-04:
- File ini adalah baseline awal. Status remediation terbaru ada di `docs/analysis/UI_UX_AUDIT_2026-05-04.md`.

Scope:
- Frontend Next.js di `frontend/`
- Design System di `Design System/`
- Static scan dengan `rg`
- `npm run typecheck`
- `npm run lint`
- Render visual via Playwright pada `http://localhost:3001`

Visual evidence:
- Login select screenshot: `frontend/.playwright-cli/page-2026-05-02T13-42-13-107Z.png`
- Dashboard desktop screenshot: `frontend/.playwright-cli/page-2026-05-02T13-52-32-708Z.png`
- Dashboard mobile screenshot: `frontend/.playwright-cli/page-2026-05-02T13-54-02-788Z.png`

Note:
- Dashboard visual check memakai mocked `/api/auth/me` sebagai admin agar halaman dapat dirender tanpa backend login.
- Dev server di port 3000 sempat hang setelah request dashboard timeout, lalu audit visual dilanjutkan di port 3001.

## Executive Summary

Design system sudah cukup lengkap dan ada token untuk warna, typography, table, forms, buttons, radii, feedback, chart, dan a11y. Masalah utamanya bukan kekurangan spec, tetapi drift antara spec, token, lint rule, dan implementasi halaman.

Update implementasi 2026-05-02:
- P0 quality gate sudah hijau: `npm run typecheck` pass dan `npm run lint -- --quiet` pass.
- P1 lint/design-token cleanup sudah diselesaikan untuk auth, shell, shared components, prediction/XAI, inventory modal/form, page/core hooks, services, dan POS components.
- Sisa pekerjaan UI/UX berikutnya bukan blocker lint, tetapi migrasi desain yang lebih dalam: tabel/form/chart agar makin konsisten dengan token `TABLE.*`, `INPUT.*`, `CHART_COLORS`, dan layout responsive.

Prioritas tertinggi:
1. Migrasikan tabel dan form yang masih hand-rolled ke token `TABLE.*`, `INPUT.*`, `LABEL.*`, `FIELD.*`, `btn()`, dan `BADGE.*`.
2. Kurangi overuse `T.micro`/uppercase pada konten utama. Ini terlihat jelas di dashboard dan tabel.
3. Perbaiki chart container sizing yang memunculkan Recharts warning saat render dashboard.
4. Lakukan visual regression pass di desktop/mobile setelah lint cleanup.

## Current Gate Status

### Typecheck

`npm run typecheck` pass setelah P0/P1 remediation.

Initial blockers yang sudah diselesaikan:
- `frontend/app/(dashboard)/layout.tsx:1` mengimpor `@/components/layout/app-shell`, tetapi path/module tidak ada.
- `frontend/app/admin/dashboard/page.tsx:1-3` mengimpor `StoryHeadline`, `MetricsRibbon`, dan `ProblemSolutionCard` dari path yang tidak ada.
- `frontend/src/app/components/pages/StockMovementPage.tsx:154` punya mismatch antara `zodResolver(movementSchema)` dan `MovementFormValues` untuk `qty`.
- `react-day-picker` dan `embla-carousel-react` tidak tersedia tetapi dipakai oleh shadcn UI primitives.

### Lint

`npm run lint -- --quiet` pass setelah P0/P1 remediation.

Initial issues yang sudah diselesaikan:
- Custom rule `design-system/no-banned-tokens` juga mem-flag token files dan `eslint.config.mjs` sendiri. Contoh: `frontend/src/app/lib/typography.ts:79`, `frontend/src/app/lib/data.ts:281`, `frontend/eslint.config.mjs:19`.
- Banyak error valid dari implementasi halaman: `font-black`, `font-mono`, `font-extrabold`, `text-[8px]`, `text-[11px]`, hardcoded `Rp `, dan `rounded-md`.

## Findings

### P0 - Token Drift Between Design System And Implementation

Evidence:
- Design system says primary/brand is indigo, but `frontend/src/styles/theme.css:18` sets `--primary: #0f172a` and `theme.css:106` maps `--color-primary` to slate primary.
- `theme.css:43` has `--ai-primary: #4f46e5`, but the comment says AI features, CTA, owner role. This blurs primary CTA vs AI semantic.
- `frontend/src/app/lib/typography.ts:36` defines `T.h1` as `text-2xl font-bold`, while the typography spec expects stronger H1 hierarchy.
- `frontend/src/app/lib/typography.ts:85` defines `T.kpiCard` as `text-xl font-extrabold`, while the same file bans `font-extrabold` at `typography.ts:128`.

Impact:
- Components using CSS variables (`bg-primary`, shadcn primitives, tooltips) and components using `C.primary` do not express the same semantic color.
- Lint cannot reliably enforce design system because canonical token files violate its own banned list.

Fix direction:
- Decide whether `--primary` should be indigo or whether `C.primary` should be renamed/split.
- Align `T.h1`, `T.kpiCard`, and banned token list.
- Make token source files the exception, not the target, of the hardcoded-class lint rule.

### P0 - Typecheck Blocks Reliable UI QA

Evidence:
- `frontend/app/(dashboard)/layout.tsx:1`
- `frontend/app/admin/dashboard/page.tsx:1-3`
- `frontend/src/app/components/pages/StockMovementPage.tsx:154`
- Missing dependencies used by UI primitives: `react-day-picker`, `embla-carousel-react`

Impact:
- Any visual refactor can regress build without being caught cleanly, because the baseline already fails.

Fix direction:
- Remove or complete experimental routes/imports.
- Install or remove unused shadcn primitives that require missing packages.
- Fix RHF/Zod type inference in `StockMovementPage`.

### P1 - Table System Is Still Mostly Hand-Rolled

Static scan:
- 18 files contain `<table`.
- 126 `<th>` occurrences.

Evidence:
- `frontend/src/app/components/pages/DashboardPage.tsx:315-327` uses raw table markup instead of `TABLE.wrapper`, `TABLE.head`, `TABLE.headCell`, `TABLE.body`.
- `frontend/src/app/components/pages/PrediksiStokPage.tsx:334-345` uses raw table markup and uppercase/tracking headers.
- `frontend/src/app/components/pages/TransactionHistoryPage.tsx:382-394` uses raw table markup and `T.micro` headers.
- `frontend/src/app/components/inventory/StockHistoryTable.tsx:98-110` uses raw table markup and `divide-slate-50`, not canonical `TABLE.body`.

Visual QA update 2026-05-03:
- Desktop screenshots were captured for Dashboard, Prediksi Stok, Riwayat Transaksi, and Inventaris:
  - `frontend/output/playwright/p1-table-dashboard-desktop.png`
  - `frontend/output/playwright/p1-table-prediksi-desktop.png`
  - `frontend/output/playwright/p1-table-riwayat-transaksi-desktop.png`
  - `frontend/output/playwright/p1-table-inventaris-desktop.png`
- Mobile screenshots were captured for page top and table viewport:
  - `frontend/output/playwright/p1-table-dashboard-mobile-table.png`
  - `frontend/output/playwright/p1-table-prediksi-mobile-table.png`
  - `frontend/output/playwright/p1-table-riwayat-transaksi-mobile-table.png`
  - `frontend/output/playwright/p1-table-inventaris-mobile-table.png`
- Desktop tables are visually usable, but typography and density differ by page.
- Mobile tables rely on horizontal clipping/scroll. The behavior prevents full-page horizontal overflow, but there is no clear scroll affordance, so right-side columns/actions can look cut off.
- Recharts warnings still appear during visual QA: chart containers report width/height `-1` on some render passes. This belongs to the chart sizing item but affects pages adjacent to table review.

Implementation update 2026-05-03:
- Added `frontend/src/app/components/ui/ResponsiveTable.tsx` as the shared responsive table wrapper: ARIA region, keyboard-focusable horizontal scroller, mobile fade edge, and mobile scroll affordance.
- Migrated the Dashboard "Laporan Konsolidasi Multi-Cabang" table to `ResponsiveTable` and canonical `TABLE.*` tokens.
- Added sticky first-column behavior for the Dashboard table so row identity remains visible during horizontal scroll.
- Migrated the remaining P1 target tables to the same wrapper/token system:
  - `frontend/src/app/components/pages/PrediksiStokPage.tsx`
  - `frontend/src/app/components/pages/TransactionHistoryPage.tsx`
  - `frontend/src/app/components/inventory/StockHistoryTable.tsx`
- Also migrated the transaction detail item table inside `TransactionHistoryPage.tsx`, since it shares the same table surface and modal density risk.
- Verification screenshots:
  - `frontend/output/playwright/p1-table-dashboard-after-desktop.png`
  - `frontend/output/playwright/p1-table-dashboard-after-mobile-table.png`
  - `frontend/output/playwright/p1-table-dashboard-after-mobile-table-scrolled.png`
  - `frontend/output/playwright/p1-table-prediksi-after-desktop.png`
  - `frontend/output/playwright/p1-table-prediksi-after-mobile-table.png`
  - `frontend/output/playwright/p1-table-prediksi-after-mobile-table-scrolled.png`
  - `frontend/output/playwright/p1-table-riwayat-transaksi-after-desktop.png`
  - `frontend/output/playwright/p1-table-riwayat-transaksi-after-mobile-table.png`
  - `frontend/output/playwright/p1-table-riwayat-transaksi-after-mobile-table-scrolled.png`
  - `frontend/output/playwright/p1-table-stock-history-after-desktop.png`
  - `frontend/output/playwright/p1-table-stock-history-after-mobile-table.png`
  - `frontend/output/playwright/p1-table-stock-history-after-mobile-table-scrolled.png`
  - `frontend/output/playwright/p1-table-transaction-detail-after-desktop.png`
- Verification commands passed: `npm run lint -- --quiet`, `npm run typecheck`.
- P1 target scope is now migrated. Residual table work should be treated as broader table-system hardening outside this P1 target set.

Impact:
- Table header typography violates `TABLES.md` and `TYPOGRAPHY.md` guidance.
- Row hover, sticky headers, numeric cells, empty states, and responsive wrappers vary by page.
- On mobile, data remains technically reachable through horizontal scroll, but the UI does not signal that more columns exist. This is risky for cashier/admin workflows where actions/status columns sit to the right.

Fix direction:
- Prioritize migration: Dashboard, TransactionHistory, PrediksiStok, StockHistoryTable.
- Use `TABLE.wrapper`, `TABLE.base`, `TABLE.head`, `TABLE.headCell`, `TABLE.body`, `TABLE.rowHover`, `TABLE.cellNumeric`.
- Replace table header `T.micro` with `TABLE.headCell` and keep uppercase only for true micro badges/code.
- Add a mobile table affordance pattern: sticky first column, fade edge, or explicit horizontal scroll hint for dense data tables.

### P1 - Typography Overuses Micro/Uppercase

Static scan:
- `T.micro` appears 559 times in `app/` and `src/`.
- 26 instances of `font-mono`, `font-extrabold`, `text-[8px]`, `text-[11px]`, `text-[12px]`, or `text-[13px]`.
- 81 `font-black` occurrences.

Evidence:
- `frontend/app/login/select/page.tsx:84` uses `text-[8px] font-black uppercase`, below the 9px accessibility floor.
- `frontend/src/app/components/Sidebar.tsx:118` uses `text-[8px] font-black uppercase`.
- `frontend/src/app/components/ui/chart.tsx:237` uses `font-mono` instead of `font-data`.
- `frontend/src/app/components/pages/DashboardPage.tsx:318-323` uses `T.micro` for normal table headers.
- `frontend/src/app/components/pages/PrediksiStokPage.tsx:337-342` doubles down with `uppercase tracking-[0.2em]` plus `T.micro`.

Visual confirmation:
- Dashboard screenshot shows many all-caps micro labels in primary content areas. This creates a dense admin-console feel and reduces scannability for long working sessions.

Implementation update 2026-05-03:
- Replaced the high-risk typography primitives in production UI code:
  - `font-mono` was replaced with `font-data` in shared overlay/print tokens.
  - `BTN.size.xs` now uses `text-xs` instead of `text-[11px]`.
  - Current scan finds no `font-mono`, `font-extrabold`, `text-[8px]`, `text-[11px]`, `text-[12px]`, or `text-[13px]` in `frontend/app` or `frontend/src/app`, excluding the `BANNED_PATTERNS` reference list.
- Reduced non-badge `T.micro`/uppercase usage in high-visibility surfaces:
  - `frontend/app/login/select/page.tsx`
  - `frontend/src/app/components/pages/DashboardPage.tsx`
  - `frontend/src/app/components/Sidebar.tsx`
  - `frontend/src/app/components/Breadcrumbs.tsx`
  - `frontend/src/app/components/CommandPalette.tsx`
  - `frontend/src/app/components/NotificationCenter.tsx`
- Kept `T.micro` for true status chips/badges/code-like compact markers, such as KPI deltas, urgency badges, role chips, and branch initials.
- Static rescan after this pass: `T.micro` appears 503 times in `frontend/app` and `frontend/src/app`. Residual work remains because this pass intentionally targeted high-visibility and shared-token usage, not a global rewrite.
- Verification screenshots:
  - `frontend/output/playwright/p1-typography-login-select-after-desktop.png`
  - `frontend/output/playwright/p1-typography-dashboard-after-desktop.png`
  - `frontend/output/playwright/p1-typography-command-palette-after-desktop.png`
  - `frontend/output/playwright/p1-typography-notifications-after-desktop.png`
- Verification commands passed: `npm run lint -- --quiet`, `npm run typecheck`.

Fix direction:
- Keep `T.micro` for badges/status chips only.
- Use `T.label`, `T.bodySm`, `TABLE.headCell`, `T.code`, and `T.dataSm` for non-badge content.
- Replace `font-mono` with `font-data`.
- Replace `text-[8px]` with `T.caption` or `T.micro` depending on context.

### P1 - Form Controls Still Diverge From Forms Spec

Static scan:
- 16 placeholder color violations: `placeholder:text-slate-300` or `placeholder:text-slate-600`.
- 37 focus/ring variance matches, including `focus-visible:ring-1`, `focus-visible:ring-4`, and `focus:border-indigo-400`.

Evidence:
- `frontend/src/app/components/pages/InventarisPage.tsx:298` uses `placeholder:text-slate-300`.
- `frontend/src/app/components/inventory/ProductForm.tsx:101-200` uses uppercase labels with `T.label`; form spec says labels should be Title Case, not uppercase.
- `frontend/src/app/components/inventory/ProductForm.tsx:109`, `125`, `141`, `162`, `176`, `190`, `207` use hand-written input classes instead of `INPUT.*` / `TEXTAREA.*`.
- `frontend/src/app/components/pos/JobQueuePanel.tsx:131-154` uses `rounded-lg`, `text-[11px]`, and `focus:border-indigo-400`.
- `frontend/src/app/components/pos/CartPanel.tsx:178` and `247` use `focus-visible:ring-1`.

Fix direction:
- Migrate high-use forms first: `ProductForm`, `JobQueuePanel`, `CartPanel`, `StockTransferModal`.
- Use `FIELD.wrapper`, `LABEL.base`, `INPUT.base`, `INPUT.size.*`, `SELECT.*`, `TEXTAREA.*`, `FOCUS.ring`.
- Replace placeholder colors with `placeholder:text-slate-400 dark:placeholder:text-slate-500`.

### P1 - Chart Rendering Warnings And Hardcoded Chart Colors

Visual/runtime evidence:
- Dashboard render produced repeated Recharts warnings: chart width/height `-1`.

Static evidence:
- `frontend/src/app/components/ForecastChart.tsx:169` uses `<ResponsiveContainer width="100%" height="100%">` without `debounce`.
- `ForecastChart.tsx:173-177`, `211`, and `223` use hardcoded hex colors.
- `frontend/src/app/components/TopProductsChart.tsx:89` also uses `ResponsiveContainer width="100%" height="100%"` without `debounce`.
- `frontend/src/app/components/pages/LaporanPage.tsx:297` and `334` use `ResponsiveContainer width="100%" height="100%"` without `debounce`.

Impact:
- Charts can render blank or jitter when their parent container has no stable dimensions.
- Chart color usage is inconsistent with `CHART_COLORS`.

Fix direction:
- Give chart wrappers stable `h-*`, `min-h-*`, or `aspect-*` dimensions.
- Add `debounce={200}` consistently.
- Replace hardcoded hex colors with `CHART_COLORS`.

### P1 - Brand Naming Is Inconsistent

Evidence:
- `frontend/app/layout.tsx:20` metadata title is `SmartStock - AI-Powered ERP`.
- `frontend/src/app/components/Sidebar.tsx:63` renders `SmartStock`.
- `frontend/app/login/select/page.tsx:58` renders `InsightSphere POS`.

Impact:
- First-viewport brand signal changes depending on page. This makes the product feel unfinished even if layout is polished.

Fix direction:
- Pick one visible product name. Based on repo/docs, use `InsightSphere`.
- If `SmartStock` is a module name, render it as a module/subtitle, not the app brand.

### P2 - Responsive Layout Mostly Works, But Some Surfaces Need Stress Testing

Visual confirmation:
- Dashboard mobile at 390x844 stacks KPI cards correctly and keeps the branch filter usable.
- Header content is compressed and only partially visible at the right edge, though not catastrophically broken.

Risks:
- Many data-heavy tables rely on horizontal overflow wrappers inconsistently.
- Icon sizing still uses separate `w-* h-*` pairs heavily.

Static scan:
- 324 `h-* w-*` or `w-* h-*` pairs in TSX, contrary to `SPACING.md` icon size guidance.
- 21 `rounded-[...]` or `rounded-md` matches in TSX.
- 156 gradient-related matches and 121 hex color matches across TS/TSX/CSS. Some are valid chart tokens, but many need token review.

Fix direction:
- Keep responsive table wrappers as a checklist item for all pages with `<table`.
- Migrate icon classes to `size-*` opportunistically in touched files.
- Avoid arbitrary radius except receipts/print-only contexts where it is justified.

## Recommended Migration Order

P0:
1. Done - Fix typecheck baseline.
2. Done - Fix ESLint design-system rule scoping so it does not reject token definitions.
3. Done - Align `theme.css` primary/AI variables with `colors.ts` and docs.
4. Done - Align `typography.ts` with its own banned list and `TYPOGRAPHY.md`.

P1:
1. Done - Lint/design-token cleanup for auth, shell, shared components, inventory forms/modals, prediction/XAI, page/core hooks, services, and POS components.
2. Next - DashboardPage table and typography cleanup.
3. Next - TransactionHistoryPage, PrediksiStokPage, and StockHistoryTable table cleanup with `TABLE.*`.
4. Next - ForecastChart and TopProductsChart visual sizing/color pass.
5. Next - Brand rename pass: `SmartStock` vs `InsightSphere`.

P2:
1. Done - POS micro-form cleanup in CartPanel and JobQueuePanel.
2. Next - Sweep `font-mono` to `font-data` where it is not already covered by lint.
3. Next - Sweep `w-* h-*` icons to `size-*` in touched components.
4. Next - Add/adjust lint checks for placeholder color, focus ring, and table token usage after baseline is clean.

## Verification Commands

Initial audit results:

```powershell
cd C:\Portfolio\InsightSphere\frontend
npm run typecheck
# fails

npm run lint
# fails: 349 problems, 227 errors, 122 warnings
```

P0 implementation update:

```powershell
cd C:\Portfolio\InsightSphere\frontend
npm run typecheck
# passes

npm run lint -- --quiet
# fails: 171 errors
```

Notes:
- Typecheck blockers from missing route imports, RHF/Zod resolver typing, missing calendar/carousel dependencies, react-resizable-panels v4 API mismatch, and Recharts tooltip/legend typing have been resolved.
- ESLint `design-system/no-banned-tokens` no longer reports token source files or `eslint.config.mjs`.
- At this point remaining lint errors were implementation backlog; they were resolved in the P1 cleanup below.

P1 implementation update:

```powershell
cd C:\Portfolio\InsightSphere\frontend
npm run typecheck
# passes

npm run lint -- --quiet
# passes
```

Notes:
- Lint backlog was reduced from 171 errors after P0 to 0 errors after P1 cleanup.
- POS cleanup removed remaining `any`, hardcoded `Rp ` in receipts, hardcoded micro text classes, and manual `font-black` usage.
- Core hook cleanup replaced React set-state-in-effect patterns in responsive/media/cart/loading flows.

Visual check used:

```powershell
cd C:\Portfolio\InsightSphere\frontend
npm run dev -- --port 3001
```

Then Playwright CLI opened `http://localhost:3001/login/select` and `http://localhost:3001/` with `/api/auth/me` mocked as admin.
