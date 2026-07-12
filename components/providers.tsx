"use client";

import { FirebaseAuthProvider } from "@/lib/firebase-auth-context";
import { ToastProviderWrapper } from "@/lib/toast-context";
import { ThemeProvider } from "@/components/theme-provider";
import { BrandThemeProvider } from "@/components/dashboard/brand-theme-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <FirebaseAuthProvider>
        <BrandThemeProvider>
          <ToastProviderWrapper>{children}</ToastProviderWrapper>
        </BrandThemeProvider>
      </FirebaseAuthProvider>
    </ThemeProvider>
  );
}
