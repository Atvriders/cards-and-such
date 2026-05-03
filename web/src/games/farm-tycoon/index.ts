import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FarmTycoonState, FarmTycoonAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FarmTycoon = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FarmTycoon as unknown as React.ComponentType<unknown> })));
export const farmTycoonPlugin = {
  id: "farm-tycoon",
  title: "Farm Tycoon",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Buy seeds, plant crops, and harvest across 50 turns. Seasons affect yield — grow your farm fortune!",
  howToPlay: `Farm Tycoon is a farming simulation played over 50 turns. You manage six fields and must plant, grow, and harvest five different crops to maximize your cash by the final turn.

The game cycles through four seasons — Spring, Summer, Autumn, and Winter — every 5 turns. Each season dramatically affects crop yields. Tomatoes thrive in summer heat but wither in winter. Carrots and wheat do better in cooler seasons. Winter is harsh: all yields drop significantly, so plan ahead.

Each field shows either empty soil ready for planting, or a growing crop counting down its turns. Click a crop button beneath an empty field to plant it. Each crop has a seed cost, a grow time, and a sell price. Wheat is cheap and fast (2 turns). Corn is mid-range (3 turns). Tomato is expensive but high-value (4 turns). Potato and Carrot fill out the middle ground.

When you are ready, click "Advance Turn" to grow all crops by one turn. Any crop that has finished growing is automatically harvested and sold, with income adjusted by the current season multiplier.

Watch your cash carefully — you cannot plant without funds. Try to keep all six fields busy at all times. Target $2,000 by turn 50 for a top score. Good luck, farmer!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: FarmTycoonState, action: FarmTycoonAction) => FarmTycoonState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".farm-crop-btn", pulses: 3 }; },
  component: FarmTycoon,
} as unknown as GamePlugin;
