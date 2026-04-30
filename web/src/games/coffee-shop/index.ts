import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CoffeeState, CoffeeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CoffeeShop } from "./Game.js";

export const coffeeShopPlugin = {
  id: "coffee-shop",
  title: "Coffee Shop",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Brew and sell coffee drinks over 28 days. Set batch size, price, and invest in upgrades!",
  howToPlay: `Coffee Shop puts you behind the counter of a small café for 28 days. Each day you decide how many cups to prepare, what to charge, and which drink to feature — then see how many you sell.

Choose a Featured Drink from Espresso, Latte, Cold Brew, or Tea. Each has different ingredient costs and base demand. Unsold cups are partially wasted, so match your batch size to expected demand.

Adjust your Price ($2–$12). Lower prices attract more customers, higher prices boost revenue per cup — find the sweet spot. Set your Batch Size (1–80 cups) to match your forecast.

Between batches you can invest in two upgrades: Loyalty Program ($30 each, up to 3 tiers) which brings in repeat customers, and Equipment Upgrades ($50 each, up to 3 levels) which increase efficiency and quality — both boost demand.

Strategy: Start small (30 cups, $4) and build cash. Invest in one loyalty tier early to grow your base. Raise prices as demand grows. Cold Brew and Latte have the best profit margins. Target $2000 by day 28 for a full score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: CoffeeState, action: CoffeeAction) => CoffeeState,
  isTerminal,
  component: CoffeeShop,
} as unknown as GamePlugin;
