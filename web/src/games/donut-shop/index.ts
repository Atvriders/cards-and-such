import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DonutState, DonutAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DonutShop = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DonutShop as unknown as React.ComponentType<unknown> })));
export const donutShopPlugin = {
  id: "donut-shop",
  title: "Donut Shop",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Run a donut bakery for 18 days. Bake the right flavors, set smart prices, and upgrade your glaze and display case to sweeten your profits!",
  howToPlay: `Donut Shop puts you behind the counter of a neighborhood bakery for 18 days. Each morning you decide how many dozens to bake, which flavor to feature, and what price to charge — then open the doors and watch the customers roll in.

Choose a Flavor from Glazed, Chocolate, Sprinkles, or Fritter. Glazed is the most popular and has the lowest cost. Fritters are premium but harder to sell in volume. Matching flavor to expected demand is the key to minimizing waste.

Set your Dozens to Bake (1–20) and Price per Dozen ($4–$18). Unsold donuts go stale and lose most of their value, so don't overbake. Lower prices pull more foot traffic; higher prices boost margins — find the sweet spot.

Two upgrades are available between service windows: Better Glaze ($22 each, up to 3 tiers) improves taste and boosts demand, and Display Case ($32 each, up to 3 tiers) showcases your donuts attractively and brings in more impulse buyers.

Strategy: Start with 8 dozens of Glazed at $8. Invest in one glaze upgrade early, then save for a display case. Scale batch size as upgrades grow your customer base. Reach $1200 by day 18 for a perfect score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: DonutState, action: DonutAction) => DonutState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".donut-btn", pulses: 3 }; },
  component: DonutShop,
} as unknown as GamePlugin;
