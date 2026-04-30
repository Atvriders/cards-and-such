import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { AlchemyShopState, AlchemyShopAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AlchemyShop } from "./Game.js";

export const alchemyShopPlugin = {
  id: "alchemy-shop",
  title: "Alchemy Shop",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Buy ingredients, combine them into potions, and fulfill 8 customer orders before time runs out!",
  howToPlay: `Alchemy Shop is an order-fulfillment strategy game. You run a potion shop and must complete 8 customer orders by combining the right ingredients. Each turn you manage your budget, stock ingredients, and brew potions.

Six ingredients are available — Fire, Water, Earth, Air, Arcane, and Shadow — each costing 8 coins per unit. Six potion recipes exist, each requiring exactly 3 ingredients in the right combination. For example, a Healing Potion uses Water + Earth + Arcane.

Up to 3 orders are active at once. Each order has a timer showing how many turns remain. Fulfill an order before the last turn to earn a speed bonus on top of the base reward. Let an order expire and you pay a 10-coin penalty.

Click "Fulfill" on an order when you have all required ingredients in stock. A new order appears to replace it. Click "End Turn" when done acting — timers tick down and expired orders are replaced.

Strategy: Identify which recipes share ingredients and stock those. Buy in bulk when you have surplus coins. Prioritize urgent orders (timer 1) — expiry penalties add up fast. Aim for 200+ coins to achieve a top score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: AlchemyShopState, action: AlchemyShopAction) => AlchemyShopState,
  isTerminal,
  component: AlchemyShop,
} as unknown as GamePlugin;
