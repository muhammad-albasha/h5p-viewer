"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/h5p-viewer/api/auth">
      {children}
    </SessionProvider>
  );
}
