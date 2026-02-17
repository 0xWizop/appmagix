"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex rounded-lg border border-border p-1">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          theme === "light"
            ? "bg-brand-green-dark text-white"
            : "text-text-muted hover:text-text-primary"
        )}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          theme === "dark"
            ? "bg-brand-green-dark text-white"
            : "text-text-muted hover:text-text-primary"
        )}
      >
        Dark
      </button>
      <button
        type="button"
        onClick={() => setTheme("system")}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          theme === "system"
            ? "bg-brand-green-dark text-white"
            : "text-text-muted hover:text-text-primary"
        )}
      >
        System
      </button>
    </div>
  );
}
