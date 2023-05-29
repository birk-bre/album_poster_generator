"use client";

import { createContext } from "react";

export const ClientContext = createContext<{ access_token: null | string }>({
  access_token: null,
});
export const ClientProvider = ({
  children,
  access_token,
}: {
  children: React.ReactNode;
  access_token: string | null;
}) => {
  return (
    <ClientContext.Provider value={{ access_token }}>
      {children}
    </ClientContext.Provider>
  );
};
