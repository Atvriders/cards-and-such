import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CityBuilderState, CityBuilderAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CityBuilderMicro = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CityBuilderMicro as unknown as React.ComponentType<unknown> })));
export const cityBuilderMicroPlugin = {
  id: "city-builder-micro",
  title: "City Builder Micro",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place buildings on an 8×8 grid to maximize city happiness within 20 turns!",
  howToPlay: `City Builder Micro challenges you to design the happiest city possible on an 8×8 grid across 20 turns. You start with a $50 budget and must spend it wisely on four building types.

Houses (cost $5) form the residential backbone of your city. Each house adds 2 happiness. Shops (cost $8) add 3 happiness and generate income each turn, letting you buy more buildings. Parks (cost $6) are the most powerful happiness booster — each park adds 5 happiness and gives +2 bonus happiness to every adjacent building. Factories (cost $4) are cheap but generate -2 happiness and reduce the happiness of their neighbors by 1 each.

Placement strategy is critical. Parks placed near houses and shops multiply your score significantly. Try to cluster parks in the center surrounded by houses and shops. Keep factories far away from everything, or avoid them entirely unless you desperately need cheap buildings to fill the grid.

Each turn you earn income from your existing shops ($3 each) and houses ($1 each), so a strong early economy lets you build more. Select a building type from the toolbar, then click any empty cell to place it.

Click "End Turn" when done placing. After 20 turns your final happiness score is calculated. Aim for 80+ for a top-tier city!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: CityBuilderState, action: CityBuilderAction) => CityBuilderState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".city-cell", pulses: 3 }; },
  component: CityBuilderMicro,
} as unknown as GamePlugin;
