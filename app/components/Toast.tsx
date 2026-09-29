"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "info" | "warning";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {toasts.map(toast => {
          const isSuccess = toast.type === "success";
          const isWarning = toast.type === "warning";

          const bg = isSuccess ? "#0f172a" : isWarning ? "#78350f" : "#1e293b";
          const borderColor = isSuccess ? "#16a34a" : isWarning ? "#f59e0b" : "#3b82f6";
          const iconColor = isSuccess ? "#4ade80" : isWarning ? "#fbbf24" : "#60a5fa";

          const IconComponent = isSuccess
            ? CheckCircle2
            : isWarning
            ? AlertTriangle
            : Info;

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: "auto",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 18px",
                borderRadius: 12,
                background: bg,
                border: `1px solid ${borderColor}`,
                color: "#f8fafc",
                fontSize: 13,
                fontWeight: 600,
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                animation: "toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                minWidth: 260,
                maxWidth: 420,
              }}
            >
              <style>{`
                @keyframes toastSlideIn {
                  from { opacity: 0; transform: translateY(16px) scale(0.96); }
                  to { opacity: 1; transform: translateY(0) scale(1); }
                }
              `}</style>
              <IconComponent size={18} color={iconColor} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 2,
                  marginLeft: 4,
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful fallback if used outside provider
    return {
      showToast: (message: string) => {
        if (typeof window !== "undefined") {
          console.log("[Toast]", message);
        }
      },
    };
  }
  return ctx;
}
