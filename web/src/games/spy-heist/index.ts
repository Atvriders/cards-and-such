import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SpyHeistState, SpyHeistAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpyHeist = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpyHeist as unknown as React.ComponentType<unknown> })));
export const spyHeistPlugin = {
  id: "spy-heist",
  title: "Spy Heist",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Plan a 6-stage heist. Choose your approach wisely — too much heat and you're caught!",
  howToPlay: `Spy Heist is a risk-management heist game with 6 stages. Each stage presents three tactical choices with different success rates, loot rewards, and detection risks.

At each stage — from breaching the museum exterior to crossing the border — you pick how you want to proceed. Stealth options have high success rates but modest rewards. Aggressive rushes pay big if they work but spike your Heat meter. Hacking and bribing fall in between.

Two key meters drive the game: Loot (what you've stolen) and Heat (detection level 0–100%). Reach 100% Heat and you're caught mid-heist — game over with a reduced score. Survive all 6 stages and the total loot you've accumulated determines your final score.

Each choice shows its success probability, loot gain, potential penalty on failure, and heat generated. Weigh them carefully. A failed high-risk gamble can drop your loot and spike heat simultaneously.

Strategy: Start conservative to keep heat low, then go bold in the later high-value stages. If heat is already above 60%, favor the lowest-heat options. 150+ loot earns a top score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: SpyHeistState, action: SpyHeistAction) => SpyHeistState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".sh-choice", pulses: 3 }; },
  component: SpyHeist,
} as unknown as GamePlugin;
