import React, { createContext, useContext, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export type AccessRole = "guest" | "viewer" | "admin";

interface AccessContextValue {
  isPublic: boolean;
  role: AccessRole;
  canEdit: boolean;
  canViewFinance: boolean;
  user: { id?: string; name?: string; role?: string } | null;
}

const AccessContext = createContext<AccessContextValue | undefined>(undefined);

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isPublic = location.startsWith("/public");

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: !isPublic,
    retry: false,
  });
  const user = meQuery.data ?? null;

  const value = useMemo<AccessContextValue>(() => {
    if (isPublic) {
      return { isPublic: true, role: "guest", canEdit: false, canViewFinance: false, user: null };
    }
    const role: AccessRole =
      (user as any)?.role === "admin" ? "admin" : user ? "viewer" : "guest";
    return {
      isPublic: false,
      role,
      canEdit: role === "admin",
      canViewFinance: role !== "guest",
      user: user as any,
    };
  }, [isPublic, user]);

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error("useAccess must be used inside AccessProvider");
  return ctx;
}

/**
 * Wrap a UI element so it only renders if the user has the role.
 */
export function RequireRole({
  role,
  fallback = null,
  children,
}: {
  role: AccessRole;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { role: current } = useAccess();
  const order: Record<AccessRole, number> = { guest: 0, viewer: 1, admin: 2 };
  if (order[current] < order[role]) return <>{fallback}</>;
  return <>{children}</>;
}
