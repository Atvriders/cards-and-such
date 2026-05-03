import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type HomeRunDerbyState, type HomeRunDerbyAction } from "./state.js";
const HomeRunDerby = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HomeRunDerby as unknown as React.ComponentType<unknown> })));
export const homeRunDerbySettings = {
  outs: { kind: "enum" as const, label: "Outs", options: ["5", "10"] as const, default: "5" as const },
} as const;

export const homeRunDerbyPlugin: GamePlugin<HomeRunDerbyState, HomeRunDerbyAction, typeof homeRunDerbySettings> = {
  id: "home-run-derby",
  title: "Home Run Derby",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Step into the batter's box and launch as many home runs as you can before reaching your out limit.",
  howToPlay: `Home Run Derby puts you in the batter's box facing an endless supply of pitches. Your goal is simple: hit as many home runs as possible before running out of outs.

Each pitch, you control two things — Timing and Power. Timing should be centered (50%) for a square contact. Drifting too early or late weakens the hit. Power at 80% generates maximum exit velocity; too little and the ball dies at the warning track, too much and you pop it up.

Check the wind indicator before each swing. A tailwind (→ out) adds distance; a headwind (← in) costs you 20–30 feet. Adjust power slightly to compensate.

Results are shown as colored dots: gold HR, green hit, red out. Only outs count down your limit — you can keep swinging until outs are exhausted.

Scoring: every home run is worth 100 points. Hits score nothing but use no outs. Pure home run derby rules — all that matters is the long ball.

The MLB Home Run Derby record is 61 HRs in a single round. Can you top it? Dial in that sweet 50% timing and let it rip!`,
  settings: homeRunDerbySettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-home-run-derby-action"]', pulses: 3 }; },
  component: HomeRunDerby,
};
