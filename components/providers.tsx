"use client";

import { FirebaseAuthProvider } from "@/lib/firebase-auth-context";
import { ToastProviderWrapper } from "@/lib/toast-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Web3Provider } from "@/components/web3-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <FirebaseAuthProvider>
        <Web3Provider>
          <ToastProviderWrapper>{children}</ToastProviderWrapper>
        </Web3Provider>
      </FirebaseAuthProvider>
    </ThemeProvider>
  );
}
