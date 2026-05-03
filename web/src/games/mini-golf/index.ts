import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type MiniGolfState, type MiniGolfAction } from "./state.js";
const MiniGolf = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MiniGolf as unknown as React.ComponentType<unknown> })));
export const miniGolfSettings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["easy", "medium", "hard"] as const, default: "medium" as const },
} as const;

export const miniGolfPlugin: GamePlugin<MiniGolfState, MiniGolfAction, typeof miniGolfSettings> = {
  id: "mini-golf",
  title: "Mini Golf",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "9 holes of mini golf. Set angle and power each putt. Par 3 per hole — lowest total score wins.",
  howToPlay: `Mini Golf gives you 9 holes on a compact course. Every hole has a par of 3, meaning you're expected to sink the ball in 3 putts. Your goal is to complete all 9 holes in as few strokes as possible.

On each putt you set two sliders: Angle (center = straight toward the pin, deviation curves the path) and Power (scaled to the distance remaining — the game shows your ideal power as a hint). Click Putt to see the result.

The game simulates a trajectory based on your angle and power relative to the current distance to the pin. Perfectly centered aim with ideal power gives the best chance. Errant angle or mismatched power leaves you farther from the hole or off-line.

Special outcomes: Eagle (−2), Birdie (−1), Par (0), Bogey (+1), Double Bogey (+2), etc. are awarded based on strokes taken. You get up to 8 strokes per hole before the system forces completion.

Your final score is 500 points + 50 for every stroke under par (or minus 50 per over). Shooting under par earns bonus points. Difficulty controls the angle/power tolerance: Easy is forgiving, Hard requires precise slider placement.`,
  settings: miniGolfSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".mg-btn", pulses: 3 }; },
  component: MiniGolf,
};
