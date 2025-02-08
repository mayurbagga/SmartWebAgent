"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";

interface PrivyProviderWrapperProps {
  children: ReactNode;
}

export const Providers: React.FC<PrivyProviderWrapperProps> = ({
  children,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Prevents hydration errors

  return (
    <PrivyProvider
      appId="cm4jsvuou01cnyejck56sr8ba"
      config={{
        loginMethods: ["wallet", "email"],
        appearance: {
          theme: "dark",
          accentColor: "#676FFF",
          logo: "https://i.imgur.com/6IYBfVa.png",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
};
