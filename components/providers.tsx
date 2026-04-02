"use client";

import { FirebaseAuthProvider } from "@/lib/firebase-auth-context";
import { ToastProviderWrapper } from "@/lib/toast-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Web3Provider } from "@/components/web3-provider";
import { BrandThemeProvider } from "@/components/dashboard/brand-theme-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <FirebaseAuthProvider>
        <BrandThemeProvider>
          <Web3Provider>
            <ToastProviderWrapper>{children}</ToastProviderWrapper>
          </Web3Provider>
        </BrandThemeProvider>
      </FirebaseAuthProvider>
    </ThemeProvider>
  );
}
