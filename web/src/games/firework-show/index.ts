import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FireworkState, FireworkAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FireworkShow = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FireworkShow as unknown as React.ComponentType<unknown> })));
export const fireworkShowPlugin = {
  id: "firework-show",
  title: "Firework Show",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap glowing firework targets before they fade. Build a combo multiplier and light up the night sky for maximum score!",
  howToPlay: `Firework Show is a fast-paced tap game set against a dark night sky. Colorful firework bursts appear at random positions — click or tap them before they fade to earn points!

Five firework colors appear: Red (10 pts), Blue (15 pts), Green (12 pts), Purple (20 pts), and Gold (25 pts). Each target has a limited lifespan shown by a glowing pulse animation. The faster you tap, the more you score.

Build a combo multiplier by tapping targets consecutively without missing any. Your multiplier starts at 1× and grows by 0.5 with each successful hit, capping at 8×. Miss a target — letting it expire — and your multiplier resets to 1×.

Targets appear continuously for 30 seconds. Prioritize high-value Gold and Purple fireworks when the multiplier is high. When targets cluster, tap the largest ones first since smaller targets expire faster.

Your final score is calculated at the end of the show. A score of 100 requires 5000 total points — achievable with a sustained high multiplier and good target selection. Watch for bursts of multiple targets and chain them for massive combo bonus!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: FireworkState, action: FireworkAction) => FireworkState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-firework-show-action"]', pulses: 3 }; },
  component: FireworkShow,
} as unknown as GamePlugin;
