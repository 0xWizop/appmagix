"use client";

import * as React from "react";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastIcon,
} from "@/components/ui/toast";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: {
    success: (message: string, description?: string) => void;
    error: (message: string, description?: string) => void;
    warning: (message: string, description?: string) => void;
    info: (message: string, description?: string) => void;
  };
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProviderWrapper({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const [openIds, setOpenIds] = React.useState<Set<string>>(new Set());

  const addToast = React.useCallback(
    (variant: ToastVariant, title: string, description?: string, duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const item: ToastItem = { id, variant, title, description, duration };

      setToasts((prev) => [...prev, item]);
      setOpenIds((prev) => new Set(prev).add(id));

      setTimeout(() => {
        setOpenIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
      }, duration);
    },
    []
  );

  const toast = React.useMemo(
    () => ({
      success: (message: string, description?: string) => addToast("success", message, description),
      error: (message: string, description?: string) => addToast("error", message, description),
      warning: (message: string, description?: string) => addToast("warning", message, description),
      info: (message: string, description?: string) => addToast("info", message, description),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastProvider swipeDirection="right">
        {children}
        {toasts.map((item) => (
          <Toast
            key={item.id}
            variant={item.variant}
            open={openIds.has(item.id)}
            onOpenChange={(open) => {
              if (!open) {
                setOpenIds((prev) => {
                  const next = new Set(prev);
                  next.delete(item.id);
                  return next;
                });
                setTimeout(() => {
                  setToasts((prev) => prev.filter((t) => t.id !== item.id));
                }, 300);
              }
            }}
          >
            <ToastIcon variant={item.variant} />
            <div className="flex-1">
              <ToastTitle>{item.title}</ToastTitle>
              {item.description && <ToastDescription>{item.description}</ToastDescription>}
            </div>
            <ToastClose aria-label="Close" />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}

const noopToast = {
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
};

export function useToast() {
  const ctx = React.useContext(ToastContext);
  return ctx?.toast ?? noopToast;
}
