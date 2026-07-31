"use client";

import { createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/admin-api/auth";
import { AdminApiError } from "@/lib/admin-api/client";
import type { AdminProfile, AdminRole } from "@/lib/admin-api/types";

type SessionValue = {
  admin: AdminProfile;
  canUse: (...roles: AdminRole[]) => boolean;
};

const SessionContext = createContext<SessionValue | null>(null);

export function AdminSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const query = useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => authApi.me().then((response) => response.data),
  });

  useEffect(() => {
    if (query.error instanceof AdminApiError && query.error.status === 401) {
      window.location.replace(
        `/admin/login?returnTo=${encodeURIComponent(pathname)}&reason=session-expired`,
      );
    }
  }, [pathname, query.error]);

  if (query.isPending) {
    return <AdminShellSkeleton />;
  }
  if (
    query.error instanceof AdminApiError &&
    query.error.status === 401
  ) {
    return <AdminShellSkeleton />;
  }
  if (query.isError || !query.data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-container-low p-6">
        <div className="ambient-shadow max-w-md rounded-3xl bg-white p-8 text-center">
          <h1 className="font-headline-sm text-primary">
            Sesi admin belum dapat dimuat
          </h1>
          <p className="mt-3 text-on-surface-variant">
            {query.error instanceof AdminApiError
              ? query.error.message
              : "Periksa API lalu coba kembali."}
          </p>
          <button
            className="mt-6 rounded-full bg-primary px-6 py-3 font-semibold text-white"
            onClick={() => query.refetch()}
          >
            Coba lagi
          </button>
        </div>
      </main>
    );
  }

  return (
    <SessionContext.Provider
      value={{
        admin: query.data,
        canUse: (...roles) => roles.includes(query.data.role),
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useAdminSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("AdminSessionProvider is required.");
  return value;
}

export function PermissionGate({
  roles,
  children,
}: {
  roles: AdminRole[];
  children: React.ReactNode;
}) {
  const { canUse } = useAdminSession();
  return canUse(...roles) ? children : null;
}

function AdminShellSkeleton() {
  return (
    <div
      className="flex min-h-screen animate-pulse bg-surface-container-low motion-reduce:animate-none"
      role="status"
    >
      <span className="sr-only">Memuat panel admin</span>
      <div className="hidden w-[280px] bg-primary md:block" />
      <div className="flex-1 p-8">
        <div className="h-16 rounded-2xl bg-white" />
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div className="h-32 rounded-2xl bg-white" key={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
