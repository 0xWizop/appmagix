"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

interface BrandThemeContextType {
  colors: BrandColors;
  refreshColors: () => Promise<void>;
}

const BrandThemeContext = createContext<BrandThemeContextType | undefined>(undefined);

const defaultColors: BrandColors = {
  primary: "#22c55e",
  secondary: "#166534",
  accent: "#22c55e",
};

export function BrandThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<BrandColors>(defaultColors);
  const pathname = usePathname();

  const fetchColors = async () => {
    try {
      const res = await fetch("/api/user/preferences");
      const data = await res.json();
      if (data.preferences?.brandColors) {
        setColors(data.preferences.brandColors);
        applyColors(data.preferences.brandColors);
      }
    } catch (error) {
      console.error("Failed to fetch brand colors:", error);
    }
  };

  const applyColors = (cols: BrandColors) => {
    const root = document.documentElement;
    root.style.setProperty("--brand-green", cols.primary);
    root.style.setProperty("--brand-green-dark", cols.secondary);
    // You could also add more granular variables here
  };

  useEffect(() => {
    fetchColors();
  }, [pathname]); // Refresh on navigation just in case

  return (
    <BrandThemeContext.Provider value={{ colors, refreshColors: fetchColors }}>
      {children}
    </BrandThemeContext.Provider>
  );
}

export function useBrandTheme() {
  const context = useContext(BrandThemeContext);
  if (context === undefined) {
    throw new Error("useBrandTheme must be used within a BrandThemeProvider");
  }
  return context;
}
