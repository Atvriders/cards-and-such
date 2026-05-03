import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TradingPostState, TradingPostAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TradingPost = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TradingPost as unknown as React.ComponentType<unknown> })));
export const tradingPostPlugin = {
  id: "trading-post",
  title: "Trading Post",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Buy low, sell high across 10 turns. React to market events and maximize your gold!",
  howToPlay: `Trading Post is a buy-low-sell-high merchant simulation played over 10 turns. You start with 200 gold and must trade five goods — Silk, Spice, Iron, Grain, and Gems — to build the largest fortune possible.

Each turn has two phases. In the Buy Phase, examine today's prices and purchase any goods you think will be profitable. Each good has a base price that fluctuates each turn. You can buy 1, 3, or 5 units at a time, limited by your gold. In the Sell Phase, unload your inventory at current prices.

Between turns, a random market event may shake up prices. A pirate raid might slash silk prices while a festival boosts spice demand. Reading these events and anticipating future prices is the key skill.

Strategy tips: Grain is cheap but low margin. Gems are expensive but offer massive profits when prices surge. Avoid holding too many goods that just dropped — cut losses quickly. Aim for at least 600 gold by turn 10 for a top score. Watch the event text carefully — it reveals the next opportunity!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: TradingPostState, action: TradingPostAction) => TradingPostState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".tp-btn", pulses: 3 }; },
  component: TradingPost,
} as unknown as GamePlugin;
