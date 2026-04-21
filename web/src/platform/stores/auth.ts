import { create } from "zustand";
import { persist } from "zustand/middleware";
import { claimUsername, resumeUsername } from "../api/http.js";
import type { Username } from "@cards/shared";

interface AuthState {
  username: string | null;
  token: string | null;
  expiresAt: number | null;
  status: "idle" | "loading" | "error";
  error: string | null;
  claim(username: Username): Promise<void>;
  resume(username: Username): Promise<void>;
  logout(): void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      username: null, token: null, expiresAt: null,
      status: "idle", error: null,

      async claim(username) {
        set({ status: "loading", error: null });
        try {
          const r = await claimUsername(username);
          set({ username: r.username, token: r.token, expiresAt: r.expiresAt, status: "idle" });
        } catch (e) {
          set({ status: "error", error: (e as Error).message });
        }
      },
      async resume(username) {
        set({ status: "loading", error: null });
        try {
          const r = await resumeUsername(username);
          set({ username: r.username, token: r.token, expiresAt: r.expiresAt, status: "idle" });
        } catch (e) {
          set({ status: "error", error: (e as Error).message });
        }
      },
      logout() {
        set({ username: null, token: null, expiresAt: null, status: "idle", error: null });
      },
    }),
    { name: "cards-auth" },
  ),
);
