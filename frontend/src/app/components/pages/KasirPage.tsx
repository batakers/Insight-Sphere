"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Search, 
  ShoppingCart, 
  Package, 
  LayoutGrid, 
  CheckCircle2, 
  LogOut,
  ChevronRight,
  Filter,
  Zap,
  Wrench,
  Printer,
  RotateCcw,
  Pencil,
  X,
  Lightbulb,
} from "lucide-react";
import { useTranslation } from "@/app/i18n";
import { useAuth } from "@/app/context/AuthContext";
import { useProducts } from "@/app/hooks/useProducts";
import { useCart } from "@/app/hooks/useCart";
import { useCheckout } from "@/app/hooks/useCheckout";
import { cn } from "@/app/lib/utils";
import { T } from "@/app/lib/typography";
import { C } from "@/app/lib/colors";
import { R } from "@/app/lib/radii";
import { E, Z } from "@/app/lib/elevation";
import { formatRupiah } from "@/app/lib/format";
import { INPUT } from "@/app/lib/forms";

// Sub-komponen (akan dipisah ke file sendiri nanti jika sudah stabil)
import { ProductCard } from "@/app/components/pos/ProductCard";
import { CartPanel } from "@/app/components/pos/CartPanel";
import { StockCheckView } from "@/app/components/pos/StockCheckView";
import { PaymentModal } from "@/app/components/pos/PaymentModal";
import { ServicePanel } from "@/app/components/pos/ServicePanel";
import { JobQueuePanel } from "@/app/components/pos/JobQueuePanel";
import { RefundModal } from "@/app/components/pos/RefundModal";

/**
 * KasirPage — Halaman Utama POS InsightSphere.
 * 
 * Menggabungkan semua hooks (Produk, Keranjang, Checkout) ke dalam satu 
 * interface Bento-style yang premium.
 */
export function KasirPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Hooks Logic
  const { products, isInitialLoading, categories, searchInCache } = useProducts(user?.storeNbr || undefined);
  const cart = useCart();
  const checkout = useCheckout();

  // State UI
  const [activeTab, setActiveTab] = useState<"pos" | "stock" | "service" | "queue">("pos");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [customPriceProduct, setCustomPriceProduct] = useState<typeof products[0] | null>(null);
  const [customPriceInput, setCustomPriceInput] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // F1 barcode shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Filtered Products untuk Grid
  const displayProducts = useMemo(() => {
    return searchInCache(searchQuery, selectedCategory);
  }, [searchInCache, searchQuery, selectedCategory]);

  return (
    <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-4 animate-in fade-in duration-500 xl:h-[calc(100vh-2rem)] xl:flex-row">
      {/* Sidebar Navigasi Kasir (Kategori) */}
      <aside className={cn(R.xl, E.sm, "w-full shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all xl:w-64")}>
        <div className="border-b border-slate-100 p-4 dark:border-slate-800 xl:p-6">
          <div className="flex items-center gap-3">
            <div className={cn(R.lg, E.glowPrimary, "size-10 bg-indigo-600 flex items-center justify-center text-white")}>
              <ShoppingCart className="size-5" />
            </div>
            <div className="hidden lg:block">
              <h2 className={cn(T.h3, "text-slate-900 dark:text-slate-100")}>InsightPOS</h2>
              <p className={cn(T.caption, "text-slate-400 leading-none mt-0.5")}>Versi 2.4.0</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 overflow-hidden p-4 xl:block xl:flex-1 xl:space-y-2 xl:overflow-y-auto xl:no-scrollbar">
          <button 
            onClick={() => setActiveTab("pos")}
            className={cn(
              "flex min-w-16 flex-1 items-center justify-center gap-3 rounded-2xl p-3 transition-all cursor-pointer group xl:w-full xl:justify-start",
              activeTab === "pos" ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 shadow-sm shadow-indigo-50 dark:shadow-none" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600"
            )}
          >
            <div className={cn(
              cn(R.md, "size-8 flex items-center justify-center transition-all"),
              activeTab === "pos" ? "bg-indigo-600 text-white shadow-md ring-4 ring-indigo-100 dark:ring-indigo-900/50" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
            )}>
              <LayoutGrid className="size-4" />
            </div>
            <span className={cn(T.buttonSm, "hidden lg:block")}>{t("pos.nav_pos")}</span>
          </button>

          <button 
            onClick={() => setActiveTab("stock")}
            className={cn(
              "flex min-w-16 flex-1 items-center justify-center gap-3 rounded-2xl p-3 transition-all cursor-pointer group xl:w-full xl:justify-start",
              activeTab === "stock" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 shadow-sm" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600"
            )}
          >
            <div className={cn(
              cn(R.md, "size-8 flex items-center justify-center transition-all"),
              activeTab === "stock" ? "bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100 dark:ring-emerald-900/50" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
            )}>
              <Package className="size-4" />
            </div>
            <span className={cn(T.buttonSm, "hidden lg:block")}>{t("pos.nav_stock")}</span>
          </button>

          <button
            onClick={() => setActiveTab("service")}
            className={cn(
              "flex min-w-16 flex-1 items-center justify-center gap-3 rounded-2xl p-3 transition-all cursor-pointer group xl:w-full xl:justify-start",
              activeTab === "service" ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 shadow-sm" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600"
            )}
          >
            <div className={cn(
              cn(R.md, "size-8 flex items-center justify-center transition-all"),
              activeTab === "service" ? "bg-indigo-600 text-white shadow-md ring-4 ring-indigo-100 dark:ring-indigo-900/50" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
            )}>
              <Wrench className="size-4" />
            </div>
            <span className={cn(T.buttonSm, "hidden lg:block")}>{t("pos.nav_service")}</span>
          </button>

          <button
            onClick={() => setActiveTab("queue")}
            className={cn(
              "flex min-w-16 flex-1 items-center justify-center gap-3 rounded-2xl p-3 transition-all cursor-pointer group xl:w-full xl:justify-start",
              activeTab === "queue" ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 shadow-sm" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600"
            )}
          >
            <div className={cn(
              cn(R.md, "size-8 flex items-center justify-center transition-all"),
              activeTab === "queue" ? "bg-amber-500 text-white shadow-md ring-4 ring-amber-100 dark:ring-amber-900/50" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
            )}>
              <Printer className="size-4" />
            </div>
            <span className={cn(T.buttonSm, "hidden lg:block")}>{t("pos.nav_queue")}</span>
          </button>

          <div className="w-full py-2 xl:pt-8 xl:pb-4">
             <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2" />
          </div>

          {activeTab === "pos" && (
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 xl:block xl:space-y-1">
               <p className={cn(T.h4, "px-3 text-slate-300 mb-3 hidden lg:block")}>Kategori</p>
                <button 
                  onClick={() => setSelectedCategory("all")}
                  className={cn(
                    cn(T.buttonSm, R.md, "w-full text-left px-4 py-2.5 transition-all cursor-pointer"),
                    selectedCategory === "all" ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-lg" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {t("common.all")}
                </button>
               {categories.map(cat => (
                 <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      cn(T.buttonSm, R.md, "w-full text-left px-4 py-2.5 transition-all cursor-pointer truncate"),
                      selectedCategory === cat ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-lg" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                 >
                   {cat}
                 </button>
               ))}
            </div>
          )}
        </nav>

        <div className="p-4 mt-auto">
           <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 hidden lg:block">
              <p className={cn(T.label, "text-slate-400 mb-1")}>Kasir Aktif</p>
              <p className={cn(T.bodySm, "font-bold text-slate-900 dark:text-slate-200 truncate")}>{user?.name || "Cashier"}</p>
              <div className={cn(T.caption, C.success.icon, "flex items-center gap-1.5 mt-2")}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online Mode
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content (Grid Produk) */}
      <main className="flex min-h-[640px] flex-1 flex-col gap-4 overflow-hidden xl:min-h-0">
        {/* Top Bar Search */}
        <header className={cn(R.xl, E.sm, "h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-4")}>
           <div className="relative flex-1 max-w-xl group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                aria-label={t("pos.search_placeholder")}
                placeholder={t("pos.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(INPUT.base, INPUT.size.lg, R.lg, "pl-12 pr-4 shadow-inner", T.bodySm, "font-bold")}
              />
           </div>

           <div className="flex items-center gap-3">
              <div className={cn(R.md, "hidden lg:flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-2 border border-amber-100 dark:border-amber-800/50")}>
                <Zap className="size-3.5" />
                <span className={cn(T.label, "text-amber-700 dark:text-amber-400")}>Shift Pagi</span>
              </div>
              <button
                onClick={() => setRefundModalOpen(true)}
                className={cn(T.buttonSm, R.md, E.sm, "hidden lg:flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800/50 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all cursor-pointer")}
              >
                <RotateCcw className="size-3.5" /> {t("pos.refund")}
              </button>
              <div className="h-10 w-px bg-slate-100 dark:bg-slate-800" />
              <button aria-label={t("pos.logout")} className={cn(R.lg, E.sm, "size-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-800 transition-all cursor-pointer group")}>
                <LogOut className="size-4 transition-transform group-hover:scale-110" aria-hidden="true" />
              </button>
           </div>
        </header>

        {/* Content Area */}
        <section className={cn(R.xl, E.sm, "flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col")}>
          {activeTab === "pos" && (
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
              {isInitialLoading ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-4">
                   {[...Array(10)].map((_, i) => (
                     <div key={i} className={cn(R.xl, "aspect-square bg-slate-50 dark:bg-slate-800 animate-pulse border border-slate-100 dark:border-slate-700")} />
                   ))}
                </div>
              ) : displayProducts.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-4">
                   {displayProducts.map(p => (
                     <ProductCard
                       key={p.id}
                       product={p}
                       onAdd={() => {
                         if (p.custom_price) {
                           setCustomPriceInput(p.base_price > 0 ? p.base_price.toString() : "");
                           setCustomPriceProduct(p);
                         } else {
                           cart.addItem(p);
                         }
                       }}
                     />
                   ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                   <div className={cn(R.full, "size-20 bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 border border-dashed border-slate-200 dark:border-slate-700")}>
                      <LayoutGrid className="size-8 text-slate-200 dark:text-slate-600" />
                   </div>
                   <h3 className={cn(T.h3, "text-slate-900 dark:text-slate-100")}>{t("pos.empty_title")}</h3>
                   <p className={cn(T.bodySm, "text-slate-400 mt-1")}>{t("pos.empty_desc")}</p>
                </div>
              )}
            </div>
          )}
          {activeTab === "stock" && <StockCheckView />}
          {activeTab === "service" && <ServicePanel onAdd={(svc) => cart.addItem(svc)} />}
          {activeTab === "queue" && <JobQueuePanel />}

          {/* Status Bar / Legend */}
          <footer className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-400 dark:text-slate-500 bg-slate-50/10 dark:bg-slate-800/20">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <div className="size-2 rounded-full bg-emerald-500" />
                   <span className={cn(T.caption, "text-slate-400")}>Stok Aman</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="size-2 rounded-full bg-amber-500" />
                   <span className={cn(T.caption, "text-slate-400")}>Stok Menipis</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="size-2 rounded-full bg-rose-500 dark:bg-rose-400" />
                   <span className={cn(T.caption, "text-slate-400")}>Stok Habis</span>
                </div>
             </div>
             <p className={cn(T.caption, "text-slate-400")}>Total Produk: {products.length}</p>
          </footer>
        </section>
      </main>

      {/* Cart Panel (Sisi Kanan) */}
      <CartPanel 
         cart={cart}
         onCheckout={() => setPaymentModalOpen(true)}
      />

      {/* Payment Modal */}
      {paymentModalOpen && (
        <PaymentModal
          cart={cart}
          checkout={checkout}
          onClose={() => setPaymentModalOpen(false)}
        />
      )}

      {/* Refund Modal */}
      {refundModalOpen && <RefundModal onClose={() => setRefundModalOpen(false)} />}

      {/* Custom Price Modal */}
      {customPriceProduct && (
        <div className={cn(Z.modal, "fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200")}>
          <div className={cn(R.xl, E["2xl"], "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-80 p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200")}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className={cn(R.md, "size-8 bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center")}>
                  <Pencil className={cn("size-4", C.warning.icon)} />
                </div>
                <div>
                  <p className={cn(T.h3, "text-slate-900 dark:text-slate-100")}>{customPriceProduct.name}</p>
                  <p className={cn(T.caption, "text-slate-400 dark:text-slate-500")}>Masukkan Harga</p>
                </div>
              </div>
              <button onClick={() => setCustomPriceProduct(null)} aria-label={t("common.close")} className={cn(R.md, "p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer")}>
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            {customPriceProduct.price_hint && (
              <p className={cn(T.bodySm, R.md, "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 mb-4 border border-amber-100 dark:border-amber-800/30 flex items-start gap-2")}>
                <Lightbulb className="size-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                {customPriceProduct.price_hint}
              </p>
            )}

            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-bold">Rp</span>
              <input
                type="number" min="0" autoFocus
                value={customPriceInput}
                onChange={e => setCustomPriceInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    const price = parseInt(customPriceInput) || 0;
                    cart.addItem({ ...customPriceProduct, base_price: price });
                    setCustomPriceProduct(null);
                  }
                  if (e.key === "Escape") setCustomPriceProduct(null);
                }}
                placeholder="0"
                className={cn(INPUT.base, R.lg, "h-14 pl-12 pr-4 text-xl font-bold")}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCustomPriceProduct(null)}
                className={cn(T.buttonSm, R.md, "flex-1 py-2.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer")}>
                {t("common.cancel")}
              </button>
              <button
                onClick={() => {
                  const price = parseInt(customPriceInput) || 0;
                  cart.addItem({ ...customPriceProduct, base_price: price });
                  setCustomPriceProduct(null);
                }}
                className={cn(T.buttonSm, R.md, E.glowWarning, "flex-1 py-2.5 text-white bg-amber-500 hover:bg-amber-400 transition-all cursor-pointer")}>
                {parseInt(customPriceInput) === 0 || !customPriceInput ? `${t("common.add")} (${t("pos.free")})` : `${t("common.add")} · ${formatRupiah(parseInt(customPriceInput)||0)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
