import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execFileSync } from "node:child_process";

function readLatestCommits(): string[] {
  try {
    const out = execFileSync(
      "git",
      ["log", "-5", "--pretty=%h %s"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    return out
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch {
    return [];
  }
}

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_LATEST_COMMITS__: JSON.stringify(readLatestCommits()),
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, "") },
      "/ws": { target: "ws://localhost:4000", ws: true },
    },
  },
});
