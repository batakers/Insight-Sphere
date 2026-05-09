/**
 * Auth Client — Phase 0.3.
 *
 * Thin wrapper untuk memanggil Next.js API auth proxy routes dari client
 * (AuthContext, PortalTemplate login form, etc). Abstraksi tipis di atas
 * fetch — TIDAK pakai `api` instance dari api.ts karena:
 *   1. baseURL api.ts = /api/backend, sementara auth routes di /api/auth
 *   2. Error handling auth sedikit berbeda (2FA challenge bukan error)
 *   3. Menghindari recursive event emission saat cookie invalid.
 */

import { ApiError } from "./api";

// ============================================================
// Types (mirror backend UserResponse + request shapes)
// ============================================================

export type BackendRole = "admin" | "owner" | "inventory_manager" | "cashier";

export interface BackendUser {
  id: string;
  username: string;
  full_name: string | null;
  role: BackendRole;
  store_nbr: number | null;
  email: string | null;
  phone: string | null;
  position: string | null;
  avatar_url: string | null;
  is_active: boolean;
  two_factor_enabled: boolean;
}

export interface LoginRequest {
  username: string;
  pin: string;
}

export interface LoginSuccess {
  user: BackendUser;
}

export interface LoginChallenge {
  requires_2fa: true;
  challenge_token: string;
  message?: string;
}

export type LoginResponse = LoginSuccess | LoginChallenge;

// ============================================================
// Helpers
// ============================================================

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const resp = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    throw new ApiError(
      resp.status,
      data.detail || `Request failed: ${resp.status}`,
      data
    );
  }

  return data as T;
}

async function getJson<T>(path: string): Promise<T> {
  const resp = await fetch(path, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    throw new ApiError(
      resp.status,
      data.detail || `Request failed: ${resp.status}`,
      data
    );
  }

  return data as T;
}

// ============================================================
// Public API
// ============================================================

/**
 * Login step 1 — username + PIN.
 * Return:
 *   - `{ user }` kalau 2FA disabled (sukses penuh)
 *   - `{ requires_2fa, challenge_token }` kalau 2FA enabled (lanjut step 2)
 *   - throw ApiError kalau credential invalid
 */
export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return postJson<LoginResponse>("/api/auth/login", credentials);
}

/**
 * Logout — clear httpOnly cookie server-side.
 */
export function logout(): Promise<{ success: true }> {
  return postJson<{ success: true }>("/api/auth/logout");
}

/**
 * Refresh — rotate cookie dengan token baru dari backend.
 * Throw 401 kalau cookie invalid (caller harus redirect ke login).
 */
export function refresh(): Promise<{ success: true }> {
  return postJson<{ success: true }>("/api/auth/refresh");
}

/**
 * Fetch current user profile. 401 = not authenticated / cookie invalid.
 */
export function fetchMe(): Promise<BackendUser> {
  return getJson<BackendUser>("/api/auth/me");
}

/**
 * Helper: cek apakah LoginResponse adalah 2FA challenge.
 */
export function isChallenge(resp: LoginResponse): resp is LoginChallenge {
  return "requires_2fa" in resp && resp.requires_2fa === true;
}
