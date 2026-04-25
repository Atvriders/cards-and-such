import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { BakeryState, BakeryAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BakeryShop } from "./Game.js";

export const bakeryShopPlugin = {
  id: "bakery-shop",
  title: "Bakery Shop",
  category: "strategy",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Run a bakery over 25 days — bake croissants, muffins, cakes and more. Set quantities, prices, and feature items!",
  howToPlay: `Bakery Shop puts you in charge of a small artisan bakery for 25 days. Each morning, decide how many of each item to bake and what to charge before opening your doors.

You can bake five items: Croissants, Muffins, Cakes, Bread, and Donuts. Each has different ingredient costs, demand levels, and maximum prices. Your oven has a daily capacity (starts at 100 items total). Bake too much and you waste ingredients; bake too little and you miss sales.

Set quantities (0–50 per item) and prices for each. Choosing a Featured item gives that item a 25% demand boost for the day — great for pushing high-margin items like cakes.

Upgrade your Oven ($60 each, up to 3 levels) to increase daily capacity by 20 items per level, letting you bake and sell more.

Strategy: Lead with high-demand items like Bread and Donuts for steady cash flow. Use Feature to boost Cake sales when you have enough ingredients. Avoid over-baking low-demand items. Upgrade the oven after the first few days. Target $1500 cash by day 25!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: BakeryState, action: BakeryAction) => BakeryState,
  isTerminal,
  component: BakeryShop,
} as unknown as GamePlugin;
