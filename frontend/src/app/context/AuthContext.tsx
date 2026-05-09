"use client";

/**
 * AuthContext — Phase 0.3 rewrite (ADR-002 cookie-based).
 *
 * Perubahan dari versi lama:
 *   - Buang DEMO_CREDENTIALS hardcoded + localStorage persistence
 *   - Session di-hydrate via `useQuery(["auth", "me"])` dari cookie httpOnly
 *   - `login()` panggil Next proxy `/api/auth/login` (bukan backend langsung)
 *   - Listen global event `auth:unauthorized` dari api client → auto-logout
 *
 * Role naming (ADR-003 updated):
 *   - FE UserRole = "admin" | "owner" | "inventory_manager" | "cashier"
 *   - Backend BackendRole mirrors FE 1:1 (semua 4 role dibedakan)
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as authClient from "@/app/lib/auth-client";
import type { BackendUser, BackendRole } from "@/app/lib/auth-client";
import { ApiError, API_EVENTS } from "@/app/lib/api";
import { useTranslation } from "@/app/i18n";

// ============================================================
// Types
// ============================================================

export type UserRole = "admin" | "owner" | "inventory_manager" | "cashier";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  storeNbr: number | null;
  avatar?: string;
  twoFactorEnabled: boolean;
}

export type LoginResult =
  | { kind: "success" }
  | { kind: "requires_2fa"; challengeToken: string }
  | { kind: "failed"; error: string };

interface AuthContextType {
  user: User | null;
  role: UserRole;
  actualRole: UserRole | null;
  login: (username: string, pin: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  switchView: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// Role mapping (ADR-003 transitional)
// ============================================================

function mapBackendRoleToFE(role: BackendRole): UserRole {
  switch (role) {
    case "admin":             return "admin";
    case "owner":             return "owner";
    case "inventory_manager": return "inventory_manager";
    case "cashier":           return "cashier";
    default:                  return "cashier";
  }
}

function mapBackendUserToFE(u: BackendUser): User {
  return {
    id: u.id,
    name: u.full_name || u.username,
    role: mapBackendRoleToFE(u.role),
    username: u.username,
    storeNbr: u.store_nbr,
    avatar: u.avatar_url || undefined,
    twoFactorEnabled: u.two_factor_enabled,
  };
}

// ============================================================
// Provider
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [viewingAsRole, setViewingAsRole] = useState<UserRole | null>(null);

  // Hydrate session from cookie on mount (dan di-share ke component lain
  // via useQuery cache). Retry skip kalau 401 — tidak auth = baris kosong,
  // user harus login dulu.
  const {
    data: backendUser,
    isLoading,
  } = useQuery<BackendUser | null, ApiError>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        return await authClient.fetchMe();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // Not authenticated — itu state normal, bukan error.
          return null;
        }
        throw err;
      }
    },
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const user = backendUser ? mapBackendUserToFE(backendUser) : null;

  // Listen global 401 dari `api` client (data endpoint) → otomatis logout.
  useEffect(() => {
    const handleUnauthorized = () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
      setViewingAsRole(null);
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        toast.error(t("auth.session.expired"), {
          description: t("auth.session.expired_desc"),
        });
        router.push("/login/select");
      }
    };
    window.addEventListener(API_EVENTS.UNAUTHORIZED, handleUnauthorized);
    return () => {
      window.removeEventListener(API_EVENTS.UNAUTHORIZED, handleUnauthorized);
    };
  }, [queryClient, router, t]);

  // ============================================================
  // Actions
  // ============================================================

  const login = useCallback(
    async (username: string, pin: string): Promise<LoginResult> => {
      try {
        const result = await authClient.login({ username, pin });
        if (authClient.isChallenge(result)) {
          return {
            kind: "requires_2fa",
            challengeToken: result.challenge_token,
          };
        }
        // Full success — sync query cache dari response payload
        // (hemat round-trip ke /auth/me).
        queryClient.setQueryData(["auth", "me"], result.user);
        setViewingAsRole(null);
        return { kind: "success" };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : t("auth.error.server");
        return { kind: "failed", error: message };
      }
    },
    [queryClient, t]
  );

  const logout = useCallback(async () => {
    try {
      await authClient.logout();
    } catch {
      // Cookie tetap di-clear oleh Next route handler meskipun backend error.
    }
    queryClient.setQueryData(["auth", "me"], null);
    queryClient.clear();
    setViewingAsRole(null);
    router.push("/login/select");
  }, [queryClient, router]);

  const switchView = useCallback(
    (newRole: UserRole) => {
      // Impersonation hanya boleh untuk admin — FE-only concept, backend
      // tidak aware. Diaudit di Phase 4.
      if (user?.role === "admin" || user?.role === "owner") {
        setViewingAsRole(newRole);
      }
    },
    [user]
  );

  // ============================================================
  // Derived state
  // ============================================================

  const effectiveRole: UserRole =
    viewingAsRole || user?.role || "cashier";

  const value: AuthContextType = {
    user,
    role: effectiveRole,
    actualRole: user?.role ?? null,
    login,
    logout,
    switchView,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
