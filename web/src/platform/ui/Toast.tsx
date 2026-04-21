import { create } from "zustand";
import { useEffect } from "react";
import "./Toast.css";

export interface Toast { id: number; kind: "info" | "error" | "success"; message: string }

interface Store {
  toasts: Toast[];
  push(kind: Toast["kind"], message: string): void;
  dismiss(id: number): void;
}

let nextId = 1;

export const useToast = create<Store>((set) => ({
  toasts: [],
  push(kind, message) {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, kind, message }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  dismiss(id) { set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })); },
}));

export function ToastHost(): JSX.Element {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);
  return (
    <div className="toast-host" role="region" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`} role={t.kind === "error" ? "alert" : "status"}>
          <span>{t.message}</span>
          <button onClick={() => dismiss(t.id)} aria-label="dismiss">✕</button>
        </div>
      ))}
    </div>
  );
}
