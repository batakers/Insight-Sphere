import { api } from "../lib/api";
import { formatRupiah } from "@/app/lib/format";
import { Product } from "../types/pos";

interface InventoryStockItem {
  product_id: string;
  product_sku: string;
  product_name: string;
  product_category: string;
  product_family?: string;
  product_unit?: string;
  product_price?: number;
  product_image_url?: string;
  current_stock: number;
  version: number;
  is_service?: boolean;
  min_qty?: number;
  custom_price?: boolean;
  price_hint?: string;
}

// ── Mock Products — Produk nyata toko fotokopian ─────────────────────────────
export const MOCK_POS_PRODUCTS: Product[] = [
  // ── Cetak Foto — Ukuran Kecil (min 5 lembar) ────────────────────────────────
  { id: "foto-2x3",      sku: "CF-2X3",   name: "Cetak Foto 2x3",             category: "Cetak Foto", family: "foto",    unit: "lembar",  base_price: 1000,  current_stock: 999, version: 1, min_qty: 5 },
  { id: "foto-3x4",      sku: "CF-3X4",   name: "Cetak Foto 3x4",             category: "Cetak Foto", family: "foto",    unit: "lembar",  base_price: 1000,  current_stock: 999, version: 1, min_qty: 5 },
  { id: "foto-4x6",      sku: "CF-4X6",   name: "Cetak Foto 4x6",             category: "Cetak Foto", family: "foto",    unit: "lembar",  base_price: 1000,  current_stock: 999, version: 1, min_qty: 5 },
  // ── Cetak Foto — Ukuran Besar (harga diskresi) ──────────────────────────────
  { id: "foto-4r",       sku: "CF-4R",    name: "Cetak Foto 4R",              category: "Cetak Foto", family: "foto",    unit: "lembar",  base_price: 4000,  current_stock: 999, version: 1 },
  { id: "foto-5r",       sku: "CF-5R",    name: "Cetak Foto 5R",              category: "Cetak Foto", family: "foto",    unit: "lembar",  base_price: 5000,  current_stock: 999, version: 1 },
  { id: "foto-8r",       sku: "CF-8R",    name: "Cetak Foto 8R",              category: "Cetak Foto", family: "foto",    unit: "lembar",  base_price: 8000,  current_stock: 999, version: 1 },
  // ── Print — Harga Tetap ──────────────────────────────────────────────────────
  { id: "print-bw",      sku: "PR-BW",    name: "Print B&W",                  category: "Print",      family: "print",   unit: "halaman", base_price: 500,   current_stock: 999, version: 1, is_service: true },
  { id: "print-bw-bb",   sku: "PR-BWBB",  name: "Print B&W Bolak-balik",      category: "Print",      family: "print",   unit: "lembar",  base_price: 800,   current_stock: 999, version: 1, is_service: true },
  { id: "print-clr",     sku: "PR-CLR",   name: "Print Warna",                category: "Print",      family: "print",   unit: "halaman", base_price: 1000,  current_stock: 999, version: 1, is_service: true },
  { id: "print-clr-bb",  sku: "PR-CLRBB", name: "Print Warna Bolak-balik",    category: "Print",      family: "print",   unit: "lembar",  base_price: 1800,  current_stock: 999, version: 1, is_service: true },
  // ── Print — Harga Diskresi ───────────────────────────────────────────────────
  { id: "print-hq",      sku: "PR-HQ",    name: "Print HQ (Foto)",            category: "Print",      family: "print",   unit: "lembar",  base_price: 3000,  current_stock: 999, version: 1, is_service: true, custom_price: true, price_hint: `${formatRupiah(3000)} - ${formatRupiah(5000)} tergantung kertas & halaman` },
  { id: "print-poster",  sku: "PR-PST",   name: "Print Poster / Banner",      category: "Print",      family: "print",   unit: "lembar",  base_price: 15000, current_stock: 999, version: 1, is_service: true, custom_price: true, price_hint: "Tergantung ukuran & kualitas cetak" },
  { id: "print-stiker",  sku: "PR-STK",   name: "Print Stiker",               category: "Print",      family: "print",   unit: "lembar",  base_price: 5000,  current_stock: 999, version: 1, is_service: true, custom_price: true, price_hint: "Tergantung ukuran & jenis kertas stiker" },
  // ── Fotokopi ─────────────────────────────────────────────────────────────────
  { id: "copy-bw",       sku: "FC-BW",    name: "Fotokopi A4 B&W",            category: "Fotokopi",   family: "copy",    unit: "lembar",  base_price: 200,   current_stock: 999, version: 1, is_service: true },
  { id: "copy-clr",      sku: "FC-CLR",   name: "Fotokopi A4 Warna",          category: "Fotokopi",   family: "copy",    unit: "lembar",  base_price: 1500,  current_stock: 999, version: 1, is_service: true },
  { id: "copy-f4-bw",    sku: "FC-F4BW",  name: "Fotokopi F4 B&W",            category: "Fotokopi",   family: "copy",    unit: "lembar",  base_price: 250,   current_stock: 999, version: 1, is_service: true },
  // ── Laminasi — Ukuran Standar ────────────────────────────────────────────────
  { id: "lam-a4",        sku: "LM-A4",    name: "Laminasi A4",                category: "Laminasi",   family: "laminasi", unit: "lembar", base_price: 5000,  current_stock: 100, version: 1 },
  { id: "lam-f4",        sku: "LM-F4",    name: "Laminasi F4",                category: "Laminasi",   family: "laminasi", unit: "lembar", base_price: 6000,  current_stock: 80,  version: 1 },
  { id: "lam-a3",        sku: "LM-A3",    name: "Laminasi A3",                category: "Laminasi",   family: "laminasi", unit: "lembar", base_price: 8000,  current_stock: 60,  version: 1 },
  { id: "lam-custom",    sku: "LM-CST",   name: "Laminasi Custom Size",       category: "Laminasi",   family: "laminasi", unit: "lembar", base_price: 5000,  current_stock: 80,  version: 1, custom_price: true, price_hint: "Harga sesuai ukuran dokumen" },
  // ── Jilid ────────────────────────────────────────────────────────────────────
  { id: "jilid-spiral",  sku: "JL-SPR",   name: "Jilid Spiral A4",            category: "Jilid",      family: "jilid",   unit: "buku",    base_price: 8000,  current_stock: 50,  version: 1 },
  { id: "jilid-mika",    sku: "JL-MKA",   name: "Jilid Mika A4",              category: "Jilid",      family: "jilid",   unit: "buku",    base_price: 5000,  current_stock: 60,  version: 1 },
  { id: "jilid-hard",    sku: "JL-HRD",   name: "Jilid Hard Cover A4",        category: "Jilid",      family: "jilid",   unit: "buku",    base_price: 25000, current_stock: 20,  version: 1, custom_price: true, price_hint: `${formatRupiah(25000)} - ${formatRupiah(50000)} tergantung tebal buku & pilihan cover` },
  // ── Jasa ─────────────────────────────────────────────────────────────────────
  { id: "edit-file",     sku: "JS-EDT",   name: "Jasa Edit File",             category: "Jasa",       family: "jasa",    unit: "job",     base_price: 0,     current_stock: 999, version: 1, is_service: true, custom_price: true, price_hint: "Gratis untuk edit ringan, opsional untuk edit kompleks" },
  { id: "ketik-dok",     sku: "JS-KTK",   name: "Jasa Ketik Dokumen",         category: "Jasa",       family: "jasa",    unit: "halaman", base_price: 5000,  current_stock: 999, version: 1, is_service: true, custom_price: true, price_hint: `${formatRupiah(3000)} - ${formatRupiah(7000)} per halaman tergantung kompleksitas` },
  { id: "desain",        sku: "JS-DSN",   name: "Jasa Desain",                category: "Jasa",       family: "jasa",    unit: "job",     base_price: 20000, current_stock: 999, version: 1, is_service: true, custom_price: true, price_hint: "Tergantung kompleksitas & jumlah revisi" },
  { id: "scan-a4",       sku: "JS-SCN",   name: "Scan Dokumen A4",            category: "Jasa",       family: "jasa",    unit: "lembar",  base_price: 2000,  current_stock: 999, version: 1, is_service: true },
];

/**
 * Product Service — Logic pengambilan data produk & stok untuk Kasir.
 * 
 * Target endpoint: GET /inventory/stock
 * Jika backend tidak tersedia, fallback ke MOCK_POS_PRODUCTS.
 */
export const productService = {
  /**
   * Mengambil daftar produk untuk POS berdasarkan cabang kasir.
   * Fallback ke MOCK_POS_PRODUCTS jika backend tidak tersedia.
   */
  async getPOSProducts(store_nbr?: number): Promise<Product[]> {
    try {
      const params = store_nbr ? { store_nbr } : {};
      const response = await api<InventoryStockItem[]>("/inventory/stock", { query: params });
      return response.map((item) => ({
        id: item.product_id,
        sku: item.product_sku,
        name: item.product_name,
        category: item.product_category,
        family: item.product_family || "umum",
        unit: item.product_unit || "pcs",
        base_price: item.product_price || 0,
        image_url: item.product_image_url,
        current_stock: item.current_stock,
        version: item.version,
        is_service: item.is_service,
        min_qty: item.min_qty,
        custom_price: item.custom_price,
        price_hint: item.price_hint,
      }));
    } catch {
      return MOCK_POS_PRODUCTS;
    }
  },

  /**
   * Pencarian produk (lokal atau remote).
   */
  async searchProducts(query: string, store_nbr?: number): Promise<Product[]> {
    const all = await this.getPOSProducts(store_nbr);
    const q = query.toLowerCase();
    return all.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  }
};
