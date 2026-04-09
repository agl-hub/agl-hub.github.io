import React, { createContext, useContext, useMemo, useState } from "react";
import { useLocation } from "wouter";

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

  // Static site: default to admin role so all features are accessible
  const [role] = useState<AccessRole>("admin");

  const value = useMemo<AccessContextValue>(() => {
    if (isPublic) {
      return { isPublic: true, role: "guest", canEdit: false, canViewFinance: false, user: null };
    }
    return {
      isPublic: false,
      role,
      canEdit: role === "admin",
      canViewFinance: role !== "guest",
      user: { name: "Admin", role },
    };
  }, [isPublic, role]);

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
