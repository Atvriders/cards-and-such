import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { OilState, OilAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OilTycoon = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OilTycoon as unknown as React.ComponentType<unknown> })));
export const oilTycoonPlugin = {
  id: "oil-tycoon",
  title: "Oil Tycoon",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drill, refine, and sell oil over 20 quarters. React to market prices, prospect new wells, and build your fortune!",
  howToPlay: `Oil Tycoon puts you in charge of a small petroleum company over 20 quarters (5 years). Starting with 2 wells and $800, grow your operation by drilling new wells and refining your production.

Each quarter you set your Sell Price ($20–$100/barrel). The oil market fluctuates randomly — selling at or below market price means full sales; pricing above market means fewer buyers. Watch the market price indicator and decide whether to grab margin or volume.

Between quarters you can Upgrade your Refinery ($150, up to 3 levels) to boost production efficiency by 15% per level, or pay to Prospect ($100) which gives you a 50% chance of striking a new well that quarter.

Wells each produce about 300 barrels per quarter (boosted by refinery upgrades), but cost $80/quarter to operate regardless of output. Don't expand so fast that overhead exceeds revenue.

Strategy: Keep your sell price near or just below market. Upgrade refinery before buying new wells — efficiency beats raw capacity early on. Prospect when flush with cash. Target $8000 by quarter 20!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: OilState, action: OilAction) => OilState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".oil-btn", pulses: 3 }; },
  component: OilTycoon,
} as unknown as GamePlugin;
