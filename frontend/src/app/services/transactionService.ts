import { api, ApiError } from "../lib/api";
import { StoreTransactionCreate, TransactionCreate, TransactionResponse } from "../types/pos";

/**
 * Transaction Service — Menangani pengiriman data transaksi Kasir ke Backend.
 * 
 * Sesuai [HARDENED] plan:
 * 1. Mendukung Idempotency via client_txn_id.
 * 2. Menampung logika filter error 409 (Conflict/Race Condition).
 */
export const transactionService = {
  /**
   * Mengirim satu transaksi tunggal ke backend.
   * 
   * @throws {ApiError} Jika status 409, berarti ada race condition pada stok.
   */
  async createTransaction(payload: TransactionCreate | StoreTransactionCreate): Promise<TransactionResponse> {
    try {
      return await api<TransactionResponse>("/transactions/", {
        method: "POST",
        body: payload,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // Normalisasi pesan error untuk race condition agar mudah ditangkap UI
        console.error("Race condition detected: Stock version mismatch.");
        throw new Error("STOK_CONFLICT");
      }
      throw error;
    }
  },

  /**
   * Sinkronisasi tumpukan transaksi offline (Batch Sync).
   * Digunakan oleh fitur PWA offline-first di Phase selanjutnya.
   */
  async syncBatch(transactions: Array<TransactionCreate | StoreTransactionCreate>): Promise<TransactionResponse[]> {
    return await api<TransactionResponse[]>("/transactions/batch", {
      method: "POST",
      body: { transactions },
    });
  }
};
