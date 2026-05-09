# Frontend Audit Report — InsightSphere

**Auditor**: Senior Frontend Architect & Lead QA Specialist  
**Tanggal**: 26 April 2026  
**Cakupan**: 13 page components, Layout, Sidebar, Header, ErrorBoundary, RouteGuard, AuthContext, 50 shadcn/ui primitives, 20 token files, hooks, stores.  
**Versi**: v1.0

---

## Daftar Isi

1. [Executive Summary](#1-executive-summary)
2. [Audit Design System & Konsistensi UI](#2-audit-design-system--konsistensi-ui)
3. [Fitur & Navigasi Antar Halaman](#3-fitur--navigasi-antar-halaman)
4. [Hal yang Sering Terlupakan](#4-hal-yang-sering-terlupakan-the-unthought-of)
5. [Ringkasan Statistik](#5-ringkasan-statistik)
6. [Top Prioritas Tindakan](#6-top-prioritas-tindakan)

---

## 1. Executive Summary

### Kondisi saat ini
- **13 page components** sudah built, 3 page (CashManagement, StockMovement, UserManagement) sudah full token migration.
- **20 design system token files** tersedia di `frontend/src/app/lib/`, tapi **adoption rate ~23%** (hanya 3/13 page fully migrated).
- **Dark mode**: ~28% coverage. Mayoritas page hanya support light mode.
- **Accessibility**: 3 page compliant (CashMgmt, StockMvmt, UserMgmt), 5 page **zero ARIA**.
- **Performance**: hanya 1 page (DashboardPage) menggunakan lazy loading. 4 page Recharts-heavy loaded eagerly.
- **Security**: 7 `console.log` di production code mencetak user data.

### Skor Keseluruhan

| Dimensi | Skor | Catatan |
|---------|------|---------|
| Design System Compliance | 3/10 | 20 token files tersedia, tapi hanya 3/13 page fully adopted |
| Dark Mode | 3/10 | ~28% coverage, 2 page zero dark mode |
| Accessibility | 4/10 | 3 page excellent, 5 page zero ARIA |
| Performance | 4/10 | No code splitting, monolithic mega-components |
| Security | 7/10 | Auth architecture solid (httpOnly cookie), tapi console.log leaks |
| Navigation & State | 6/10 | RouteGuard + RBAC ada, tapi missing pages & nested route guard |
| User Feedback | 5/10 | Toast ada di beberapa page, tapi mayoritas button tanpa feedback |

---

## 2. Audit Design System & Konsistensi UI

### 2.1 Hardcoded Values

| # | Temuan | Severity | File(s) Terdampak | Saran Perbaikan |
|---|--------|----------|-------------------|-----------------|
| 1 | **55 instance hardcoded rose/red color classes** (`text-rose-*`, `bg-rose-*`, `border-rose-*`) di luar 3 page yang sudah di-migrate. Palette policy (`COLORS.md v1.1`) melarang penggunaan langsung — harus via `C.destructive.*` atau `BADGE.variant.destructive`. | **High** | `PrediksiStokPage` (10), `UserProfilePage` (8), `PengaturanPage` (6), `MLOpsDashboardPage` (5), `InventarisPage` (4), `XAIPage` (4), `DashboardPage` (3), `KasirPage` (3), `LaporanPage` (3) | Ganti semua dengan `C.destructive.text`, `C.destructive.bg`, `C.destructive.border`, atau `BADGE.variant.destructive` sesuai konteks. |
| 2 | **~33 hardcoded `"Rp "` string** di mock data `DashboardPage`. Tidak menggunakan `formatRupiah()` dari `format.ts`. | **Medium** | `DashboardPage` (33), `LaporanPage` (7) | Ubah mock data value dari string `"Rp 3.2 Jt"` ke angka numerik, lalu format via `formatRupiah(amount, { compact: true })` saat render. |
| 3 | **~40+ hardcoded hex colors** (`#6366f1`, `#8b5cf6`, `#ec4899`, `#f43f5e`, dll.) di Recharts props. Token `CHART_COLORS` dari `charts.ts` tersedia tapi tidak digunakan. | **Medium** | `LaporanPage` (10+), `XAIPage` (8+), `PrediksiStokPage` (8+), `MLOpsDashboardPage` (12+) | Import `CHART_COLORS`, `CHART_AXIS`, `CHART_GRID`, `CHART_TOOLTIP` dari `@/app/lib/charts` dan gunakan sebagai pengganti hex literal. |
| 4 | **8 instance `focus:outline-none focus:border-indigo-*`** — seharusnya `focus-visible:` + `A11Y.focusRing.*` atau `FOCUS.ring`. `focus:` trigger pada mouse click juga, melanggar A11Y best practice. | **Medium** | `PrediksiStokPage`, `KasirPage`, `PengaturanPage`, `InventarisPage`, `TransactionHistoryPage` | Ganti `focus:outline-none focus:border-indigo-500` → `A11Y.focusRing.default` atau `FOCUS.ring` canonical token. Gunakan `focus-visible:` prefix. |
| 5 | **`UserProfilePage` menduplikasi `ROLE_CONFIG`** secara manual (hardcoded rose/indigo/emerald/teal) — padahal `BADGE.role` dan `getRoleInfo()` dari `status.ts` sudah tersedia. | **Medium** | `UserProfilePage` | Hapus `ROLE_CONFIG` lokal, gunakan `BADGE.role[user.role]` + `getRoleInfo(user.role)`. |
| 6 | **`PrediksiStokPage` menduplikasi `PriorityBadge`** dengan hardcoded color map — padahal `BADGE.variant.destructive/warning/success` sudah canonical. | **Low** | `PrediksiStokPage` | Refactor `PriorityBadge` → gunakan `BADGE.base + BADGE.size.sm + BADGE.variant.*`. |

### 2.2 Komponen Atomik & Duplikasi

| # | Temuan | Severity | Saran |
|---|--------|----------|-------|
| 7 | **Tidak ada reusable `<FilterBar>` component** — setiap page mem-build filter section sendiri dengan pattern berbeda (6 page terdampak). | **Medium** | Buat `FilterBar.tsx` sesuai spec `PATTERNS.md §4.4`. Satu component dengan slot untuk search, filter select, dan action buttons. |
| 8 | **Tidak ada reusable `<PageHeader>` component** — setiap page menduplikasi header pattern (title + subtitle + action buttons) secara manual. | **Medium** | Buat `PageHeader.tsx` sesuai spec `BREADCRUMBS.md §9.3`. Props: `title`, `subtitle`, `actions`, `breadcrumbs`. |
| 9 | **Modal forms tidak terabstraksi** — setiap page menulis modal form inline (~100-200 baris per modal). | **Low** | Buat `FormModal.tsx` wrapper yang handle backdrop, animation, header, footer, close-on-escape secara konsisten. Atau manfaatkan `useModalA11y` hook yang sudah ada. |
| 10 | **Badge styling di 5+ page** masih manual — tidak menggunakan `BADGE.*` tokens dari `data.ts`. | **Medium** | Migrate semua inline badge ke `cn(BADGE.base, BADGE.size.*, BADGE.variant.*)`. |

### 2.3 Responsive Design

| # | Temuan | Severity | Saran |
|---|--------|----------|-------|
| 11 | **`PrediksiStokPage` — zero dark mode support.** Card dan tabel hanya `bg-white`, `text-slate-900`, `border-slate-200` tanpa `dark:` counterpart. UI pecah total di dark mode. | **High** | Tambahkan `dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800` pada semua card wrapper, heading, dan text. |
| 12 | **`LaporanPage` — zero dark mode support.** Sama seperti PrediksiStokPage: semua card `bg-white` tanpa `dark:` prefix. | **High** | Full dark mode audit dan tambahkan semua `dark:` variants. |
| 13 | **`CashManagementPage` & `UserManagementPage` — tabel tanpa `overflow-x-auto` wrapper.** Pada layar < 768px, kolom tabel akan terpotong/overlap. | **Medium** | Bungkus `<table>` dalam `<div className="overflow-x-auto">`. |
| 14 | **Mobile sidebar overlay** di `Layout.tsx` menggunakan hardcoded `z-50` dan `bg-slate-900/60 backdrop-blur-sm` — seharusnya `Z.overlay` + `BACKDROP.overlay` tokens. | **Low** | Gunakan `Z.overlay`, `BACKDROP.overlay` tokens untuk konsistensi. |

---

## 3. Fitur & Navigasi Antar Halaman

### 3.1 Flow Navigasi

| # | Temuan | Severity | Saran |
|---|--------|----------|-------|
| 15 | **`RouteGuard` RBAC hanya cek exact `routes.find(r => r.path === pathname)`** — sub-routes dan dynamic segments (misal `/inventaris/[id]`) tidak ter-guard. User bisa bypass guard dengan mengakses sub-path yang tidak terdaftar di `routes`. | **High** | Gunakan `pathname.startsWith(r.path)` atau regex matching agar semua nested routes juga ter-protect. |
| 16 | **Missing `not-found.tsx`** — Next.js App Router akan menampilkan default 404 yang tidak branded, merusak UX. | **Medium** | Buat `app/not-found.tsx` dengan design konsisten (spec sudah ada di `PATTERNS.md §9.4`). |
| 17 | **Missing `error.tsx`** (Next.js route-level) — saat ini hanya ada `ErrorBoundary` component yang di-wrap manual. Next.js `error.tsx` convention menangkap error di level route segment secara otomatis. | **Medium** | Buat `app/error.tsx` (client component) yang memanfaatkan `ErrorBoundary` fallback UI. |
| 18 | **Missing `loading.tsx`** per route — tidak ada Suspense boundary atau streaming. Halaman langsung blank lalu jump ke rendered content. | **Low** | Buat `app/loading.tsx` dengan skeleton dari `Skeletons.tsx` yang sudah ada. |
| 19 | **`ErrorBoundary` tombol "Kembali ke Dashboard"** menggunakan `window.location.href = "/"` (hard navigation) — trigger full page reload dan kehilangan semua client state. | **Low** | Gunakan Next.js `router.push("/")` atau `<Link href="/">`. Buat wrapper functional component karena ErrorBoundary adalah class component. |

### 3.2 State Management

| # | Temuan | Severity | Saran |
|---|--------|----------|-------|
| 20 | **`UserManagementPage` — `window.confirm()` untuk delete action** — blocking, non-styleable, dan tidak konsisten dengan custom delete modal di `CashManagementPage`. | **High** | Ganti `window.confirm()` dengan custom confirmation modal menggunakan `MODAL.*` tokens, sama seperti pattern di `CashManagementPage`. |
| 21 | **`inventoryStore` — singleton module-level state** tanpa SSR guard. Pada Next.js SSR, state bisa bocor antar request karena module singleton di-share di server. | **Medium** | Migrasi ke Zustand store (sudah di-spec Phase 5) atau tambahkan `typeof window !== 'undefined'` guard. |
| 22 | **Semua form di page components menggunakan manual `useState` per field** — tidak ada validasi library. React Hook Form + Zod sudah ada di dependency plan tapi belum dipakai. | **Medium** | Migrate form state ke React Hook Form + Zod schema. Mengurangi re-render dan memberikan type-safe validation. |

### 3.3 Feedback User

| # | Temuan | Severity | Saran |
|---|--------|----------|-------|
| 23 | **6 page tanpa toast feedback pada aksi apapun** — `DashboardPage`, `LaporanPage`, `PrediksiStokPage`, `MLOpsDashboardPage`, `TransactionHistoryPage`, `XAIPage`. Button hanya `console.log` atau no-op. | **Medium** | Tambahkan `toast.success()` / `toast.error()` pada setiap user action (export, refresh, filter). |
| 24 | **Tidak ada disabled/loading state pada submit button di modal forms.** User bisa double-click submit, potensial duplicate action. | **Medium** | Tambahkan `isSubmitting` state → disable button + show spinner saat proses. |
| 25 | **`PengaturanPage` — toast hanya 1 kali** (`toast.success` di save profile), sementara ada 7 tab dengan banyak form action tanpa feedback. | **Low** | Tambahkan toast untuk setiap save action di semua tab settings. |

---

## 4. Hal yang Sering Terlupakan (The "Unthought-of")

### 4.1 Accessibility (A11y)

| # | Temuan | Severity | Saran |
|---|--------|----------|-------|
| 26 | **5 page TIDAK memiliki ARIA attributes sama sekali** — `DashboardPage`, `LaporanPage`, `MLOpsDashboardPage`, `TransactionHistoryPage`, `KasirPage`. Tabel tanpa `role`, modal/drawer tanpa `aria-modal`, icon-only buttons tanpa `aria-label`. | **High** | Audit per page: tambahkan `aria-label` ke semua icon-only buttons, `role="dialog" aria-modal="true"` ke modals/drawers, `aria-labelledby` ke dialog titles. |
| 27 | **`PengaturanPage` — 10 form `<label>` TANPA `htmlFor` pairing**, sementara CashManagement/StockMovement/UserManagement sudah di-fix. | **High** | Pasangkan `htmlFor="field-id"` di semua `<label>` dan `id="field-id"` di `<input>` yang sesuai. |
| 28 | **`PrediksiStokPage` — search `<input>` tanpa `<label>`** (hanya placeholder text). Screen reader tidak bisa mendeskripsikan field ini. | **Medium** | Tambahkan visually-hidden `<label>` atau `aria-label="Search SKU"` pada input. |
| 29 | **`RouteGuard` loading spinner** — tidak ada `aria-live` atau `role="status"` pada loading state. Screen reader tidak tahu halaman sedang loading. | **Low** | Tambahkan `role="status" aria-live="polite"` pada loading container. |
| 30 | **`InventarisPage` — drawer tidak memiliki focus trap atau `onKeyDown` Escape handler.** Hanya CashManagement, StockMovement, UserManagement yang sudah memiliki keyboard handling. | **Medium** | Tambahkan `onKeyDown` Escape handler dan focus trap menggunakan `useModalA11y` hook yang sudah tersedia. |

### 4.2 Error Handling

| # | Temuan | Severity | Saran |
|---|--------|----------|-------|
| 31 | **`ErrorBoundary` hanya wrap `{children}` di `Layout.tsx`** — satu boundary untuk seluruh halaman. Jika satu widget crash (chart, table), seluruh halaman hilang dan diganti error fallback. | **Medium** | Wrap masing-masing section berat (chart, table, KPI) dengan `<ErrorBoundary compact sectionName="...">`. `DashboardPage` sudah melakukan ini sebagian — page lain harus mengikuti. |
| 32 | **`ErrorBoundary` fallback UI — hardcoded styling** (`bg-rose-50`, `text-rose-500`, `rounded-[3rem]`, dll.) tanpa design system tokens. | **Low** | Migrate `ErrorBoundary` styling ke `C.destructive.*`, `R.*`, `T.*`, `E.*` tokens. |
| 33 | **Tidak ada global error handler untuk unhandled promise rejections.** Jika async operation gagal di luar try-catch, error hilang tanpa jejak dan user tidak mendapat feedback. | **Low** | Tambahkan `window.addEventListener('unhandledrejection', ...)` di root App.tsx untuk log + toast error. |

### 4.3 Performance & Optimization

| # | Temuan | Severity | Saran |
|---|--------|----------|-------|
| 34 | **Hanya `DashboardPage` menggunakan `next/dynamic` lazy loading.** 12 page lain loaded eagerly di initial bundle, termasuk 4 page yang import Recharts (~200KB library). | **High** | Gunakan `next/dynamic` untuk lazy-load page components di route files, terutama yang import Recharts: `LaporanPage`, `PrediksiStokPage`, `XAIPage`, `MLOpsDashboardPage`. |
| 35 | **4 monolithic mega-components** (47-59KB each) tanpa decomposition: `PengaturanPage` (47KB), `UserManagementPage` (48KB), `StockMovementPage` (49KB), `CashManagementPage` (59KB). Setiap re-render merender seluruh page tree. | **High** | Pecah menjadi sub-components (`TableSection`, `FilterBar`, `ModalForm`, `DrawerDetail`) dan bungkus dengan `React.memo()` di render boundary yang tepat. |
| 36 | **5 page TIDAK menggunakan `useMemo`/`useCallback`** untuk data filtering/sorting. Setiap keystroke di filter input = re-compute seluruh dataset. | **Medium** | Wrap `filteredData`, `sortedData`, `paginatedData` dengan `useMemo`, dan handler functions dengan `useCallback`. Page yang sudah benar: `CashManagementPage`, `StockMovementPage` — jadikan referensi. |
| 37 | **Recharts `<ResponsiveContainer>` tanpa explicit `debounce`** — pada window resize, chart re-render terus-menerus tanpa throttle. | **Low** | Tambahkan `debounce={200}` prop pada setiap `<ResponsiveContainer>`. |

### 4.4 Security

| # | Temuan | Severity | Saran |
|---|--------|----------|-------|
| 38 | **7 `console.log()` calls di production code** — mencetak user data (`"Delete user: user.id"`, `"Create user: formData"`, `"Product saved: data"`). Informasi ini terekspos di browser DevTools. | **High** | Hapus semua `console.log` di `InventarisPage` (4 instance) dan `UserManagementPage` (3 instance). Jika debugging diperlukan, gunakan conditional logger: `if (process.env.NODE_ENV === 'development') console.log(...)`. |
| 39 | **`RouteGuard` loading state** tidak support dark mode (`bg-slate-50` only) dan menampilkan `"Authenticating..."` tanpa i18n. | **Low** | Tambah `dark:bg-slate-950` dan gunakan `t("common.authenticating")`. |
| 40 | **`inventoryStore.deductStock()`** menggunakan `new Date().toLocaleTimeString("id-ID")` — locale-dependent formatting di store layer. Jika locale berubah, format waktu transaksi historis menjadi inkonsisten. | **Low** | Simpan ISO timestamp (`new Date().toISOString()`) di store, format saat render menggunakan `formatDate()` dari `format.ts`. |

---

## 5. Ringkasan Statistik

### Per Severity

| Kategori | 🔴 High | 🟠 Medium | 🟡 Low | Total |
|----------|---------|-----------|--------|-------|
| Design System & UI | 2 | 6 | 2 | 10 |
| Navigasi & State | 2 | 4 | 2 | 8 |
| Accessibility | 2 | 2 | 1 | 5 |
| Error Handling | 0 | 1 | 2 | 3 |
| Performance | 2 | 1 | 1 | 4 |
| Security | 1 | 0 | 2 | 3 |
| **TOTAL** | **9** | **14** | **10** | **33** |

### Per Page — Token Migration Status

| Page | Size | Token Adopted | Dark Mode | ARIA | `formatRupiah` | `BADGE.*` | `CHART_*` | Overall |
|------|------|--------------|-----------|------|---------------|-----------|-----------|---------|
| CashManagementPage | 59KB | ✅ Full | ✅ | ✅ | ✅ | ✅ | N/A | 🟢 |
| StockMovementPage | 49KB | ✅ Full | ✅ | ✅ | N/A | ✅ | N/A | 🟢 |
| UserManagementPage | 48KB | ✅ Full | ✅ | ✅ | N/A | ✅ | N/A | 🟢 |
| KasirPage | 19KB | 🟡 Partial | ✅ | ❌ | ✅ | N/A | N/A | 🟡 |
| InventarisPage | 33KB | 🟡 Partial | ✅ | 🟡 | ✅ | ❌ | N/A | 🟡 |
| TransactionHistoryPage | 28KB | 🟡 Partial | 🟡 | ❌ | ✅ | ❌ | N/A | 🟡 |
| DashboardPage | 26KB | 🟡 Partial | 🟡 | ❌ | ❌ | ❌ | N/A | 🟠 |
| PengaturanPage | 47KB | 🟡 Partial | ✅ | 🟡 | N/A | N/A | N/A | 🟡 |
| UserProfilePage | 26KB | ❌ Minimal | 🟡 | ❌ | N/A | ❌ | N/A | 🟠 |
| PrediksiStokPage | 21KB | ❌ Minimal | ❌ | ❌ | N/A | ❌ | ❌ | 🔴 |
| LaporanPage | 25KB | ❌ Minimal | ❌ | ❌ | ❌ | N/A | ❌ | 🔴 |
| MLOpsDashboardPage | 23KB | ❌ Minimal | 🟡 | ❌ | N/A | ❌ | ❌ | 🔴 |
| XAIPage | 32KB | ❌ Minimal | 🟡 | 🟡 | N/A | N/A | ❌ | 🟠 |

**Legend**: ✅ Done | 🟡 Partial | ❌ Not started | N/A Not applicable

---

## 6. Top Prioritas Tindakan

### 🔴 P0 — Immediate Fix (Hari ini / besok)

| # | Action | Finding | Impact |
|---|--------|---------|--------|
| 1 | Hapus 7 `console.log` di production code | #38 | **Security** — data user terekspos di DevTools |
| 2 | Fix RBAC guard untuk nested routes (`startsWith` matching) | #15 | **Security** — unauthorized access pada sub-routes |
| 3 | Tambah dark mode di `PrediksiStokPage` & `LaporanPage` | #11, #12 | **UI** — broken total di dark mode |

### 🟠 P1 — Sprint ini (1 minggu)

| # | Action | Finding | Impact |
|---|--------|---------|--------|
| 4 | Lazy-load 4 Recharts pages via `next/dynamic` | #34 | **Performance** — ~200KB bundle reduction |
| 5 | Pecah 4 mega-component (47-59KB) ke sub-components | #35 | **Performance** — render perf + maintainability |
| 6 | Ganti `window.confirm()` → custom modal di UserManagement | #20 | **UX** — consistency + design system compliance |
| 7 | ARIA audit: 5 page tanpa accessibility attributes | #26 | **A11y** — WCAG 2.1 AA compliance |
| 8 | Fix 10 `<label>` tanpa `htmlFor` di PengaturanPage | #27 | **A11y** — form accessibility |
| 9 | Migrate 55 hardcoded rose classes → `C.destructive.*` | #1 | **Design System** — token adoption |
| 10 | Migrate 40+ hex colors di charts → `CHART_COLORS.*` | #3 | **Design System** — token adoption |

### 🟡 P2 — Sprint berikutnya (2 minggu)

| # | Action | Finding | Impact |
|---|--------|---------|--------|
| 11 | Buat `not-found.tsx`, `error.tsx`, `loading.tsx` | #16, #17, #18 | **UX** — branded error/loading pages |
| 12 | Buat reusable `FilterBar` + `PageHeader` components | #7, #8 | **DX** — reduce duplication |
| 13 | Migrate 33 hardcoded `"Rp "` → `formatRupiah()` | #2 | **i18n** — format consistency |
| 14 | Migrate manual form state → React Hook Form + Zod | #22 | **DX** — type-safe validation |
| 15 | Tambah toast feedback ke 6 page tanpa feedback | #23 | **UX** — user feedback |
| 16 | Wrap expensive computations dengan `useMemo` | #36 | **Performance** — reduce unnecessary recomputation |
| 17 | Tambah granular `<ErrorBoundary compact>` per widget | #31 | **Resilience** — partial failure isolation |

---

## Appendix A: File Reference

### Pages (sorted by migration priority)
- `frontend/src/app/components/pages/PrediksiStokPage.tsx` — 🔴 Priority
- `frontend/src/app/components/pages/LaporanPage.tsx` — 🔴 Priority
- `frontend/src/app/components/pages/MLOpsDashboardPage.tsx` — 🔴 Priority
- `frontend/src/app/components/pages/DashboardPage.tsx` — 🟠
- `frontend/src/app/components/pages/UserProfilePage.tsx` — 🟠
- `frontend/src/app/components/pages/XAIPage.tsx` — 🟠
- `frontend/src/app/components/pages/TransactionHistoryPage.tsx` — 🟡
- `frontend/src/app/components/pages/InventarisPage.tsx` — 🟡
- `frontend/src/app/components/pages/PengaturanPage.tsx` — 🟡
- `frontend/src/app/components/pages/KasirPage.tsx` — 🟡
- `frontend/src/app/components/pages/CashManagementPage.tsx` — 🟢 Done
- `frontend/src/app/components/pages/StockMovementPage.tsx` — 🟢 Done
- `frontend/src/app/components/pages/UserManagementPage.tsx` — 🟢 Done

### Token Files (available at `frontend/src/app/lib/`)
- `typography.ts`, `colors.ts`, `buttons.ts`, `motion.ts`, `containers.ts`
- `forms.ts`, `data.ts`, `feedback.ts`, `nav.ts`, `overlays.ts`
- `charts.ts`, `a11y.ts`, `responsive.ts`, `radii.ts`, `elevation.ts`
- `spacing.ts`, `layout.ts`, `format.ts`, `status.ts`, `utility.ts`

### Missing Components (spec exists, implementation pending)
- `PageHeader.tsx` — `BREADCRUMBS.md §9.3`
- `FilterBar.tsx` — `PATTERNS.md §4.4`
- `FormField.tsx` — `PATTERNS.md §6.4`
- `SkipLink.tsx` — `A11Y.md §4.7`
- `not-found.tsx` — `PATTERNS.md §9.4`
- `error.tsx` — `PATTERNS.md §9.5`
- `loading.tsx` — Next.js convention

---

> **Dokumen ini akan di-update seiring progres perbaikan. Setiap item yang sudah di-fix akan ditandai ✅ dengan tanggal penyelesaian.**
