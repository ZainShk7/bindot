import { createContext, useContext, useState, type ReactNode } from "react";

type AdminErrorValue = {
  error: string;
  setError: (m: string) => void;
};

const AdminErrorContext = createContext<AdminErrorValue | null>(null);

export function AdminErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState("");

  return (
    <AdminErrorContext.Provider value={{ error, setError }}>
      {children}
    </AdminErrorContext.Provider>
  );
}

export function useAdminError() {
  const ctx = useContext(AdminErrorContext);
  if (!ctx)
    throw new Error("useAdminError must be used within AdminErrorProvider");
  return ctx;
}
