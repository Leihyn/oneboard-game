"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";

interface ToastItem {
  id: number;
  message: string;
  type: "info" | "success" | "danger" | "warning" | "nft" | "rent";
  icon?: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastItem["type"], icon?: string) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const BORDER_COLORS: Record<ToastItem["type"], string> = {
  info: "border-l-[var(--teal)]",
  success: "border-l-[var(--green)]",
  danger: "border-l-[var(--red)]",
  warning: "border-l-[var(--amber)]",
  nft: "border-l-[var(--purple)]",
  rent: "border-l-[var(--orange)]",
};

const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [counter, setCounter] = useState(0);

  const addToast = useCallback((message: string, type: ToastItem["type"] = "info", icon?: string) => {
    const id = counter;
    setCounter((c) => c + 1);
    setToasts((prev) => {
      const next = [...prev, { id, message, type, icon }];
      // Keep only the latest MAX_TOASTS
      return next.slice(-MAX_TOASTS);
    });

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, [counter]);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container — positioned at top-center to avoid overlapping sidebar */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 360 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto"
            style={{ animation: "slide-down 0.3s var(--ease-out) forwards" }}
          >
            <div className={`flex items-center gap-2.5 px-4 py-3 rounded-[var(--r-sharp)] border-l-4 ${BORDER_COLORS[t.type]} bg-[var(--card)] shadow-[var(--shadow-elevated)]`}>
              {t.icon && <span className="text-lg">{t.icon}</span>}
              <span className="text-[var(--text)] leading-snug" style={{ fontSize: "var(--text-sm)" }}>{t.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
