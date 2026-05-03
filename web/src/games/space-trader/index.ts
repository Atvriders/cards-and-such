import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SpaceTraderState, SpaceTraderAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpaceTraderGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpaceTraderGame as unknown as React.ComponentType<unknown> })));
export const spaceTraderPlugin = {
  id: "space-trader",
  title: "Space Trader",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trade goods across 8 planets over 15 hyperspace jumps — buy low, sell high, and return rich!",
  howToPlay: `Space Trader is an interstellar merchant simulation. Starting on Terra with 200 credits, you must buy and sell four commodity types across a galaxy of planets over 15 hyperspace jumps.

The four goods — Food, Tech, Ore, and Medicine — have base prices but fluctuate randomly at each planet. Prices shift every time you jump, creating arbitrage opportunities. Buy cheap on one world, sell dear on another.

Your cargo hold fits 20 units total across all goods. Think carefully about what to carry: high-value Tech takes the same space as low-value Food, so fill your hold strategically. You cannot buy more than the hold allows.

Hyperspace jumps cost 3 fuel each. You start with 15 fuel (5 jumps). Refuel at any port for 30 credits — do not let yourself strand! Each jump takes you to a random planet with new prices.

At the end of 15 jumps, your score is based on total credits plus the base value of your remaining cargo. Try to liquidate cargo before the final jump for maximum return. Aim to triple your starting credits for a top score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: SpaceTraderState, action: SpaceTraderAction) => SpaceTraderState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".st-qty-btn", pulses: 3 }; },
  component: SpaceTraderGame,
} as unknown as GamePlugin;
