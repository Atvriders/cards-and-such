import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FoodTruckTycoonState, FoodTruckTycoonAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FoodTruckTycoon = /* @__PURE__ */ lazy(() => import("./FoodTruckTycoon.js").then((mod) => ({ default: mod.FoodTruckTycoon as unknown as React.ComponentType<unknown> })));
export const foodTruckTycoonSettings = {
  days: {
    kind: "enum" as const,
    label: "Days",
    options: ["5", "7", "10"] as const,
    default: "7",
  },
} as const;

type FoodTruckTycoonSettingsType = SettingsOf<typeof foodTruckTycoonSettings>;

export const foodTruckTycoonPlugin: GamePlugin<FoodTruckTycoonState, FoodTruckTycoonAction, typeof foodTruckTycoonSettings> = {
  id: "food-truck-tycoon",
  title: "Food Truck Tycoon",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Run a food truck for several days — set prices, restock, and maximise profit.",
  howToPlay: `Food Truck Tycoon is a management board game where you operate a mobile food stand over 5, 7, or 10 days. Each day, a new wave of hungry customers arrives. Your goal is to maximise total profit by the end of the final day.

Each day has two phases. In the Prep phase, you set prices for your five items (burger, taco, pizza, salad, soda) and restock inventory. Each restock of 5 units costs the base ingredient cost multiplied by 5. You start with $30 and 5 units of each item at default prices.

Then click Open for Business. Customers arrive one by one, each wanting a specific item and carrying a budget. If you have stock and your price is within their budget, the sale goes through. If the price is too high or you are out of stock, they leave empty-handed.

After serving, you see a report: how many customers were served, total revenue, and today's profit (revenue minus restocking costs). Click Next Day to move on.

Pricing strategy is key: set prices too high and customers walk away; too low and you leave money on the table. Watch which items run out fast and restock those on the next day. Soda has the lowest cost so high markup is possible; pizza is expensive but customers pay more for it.

Score equals your total profit in dollars, capped at 100. Consistent daily profits of $10–$15 will reach a top score in 7–10 days.`,
  settings: foodTruckTycoonSettings,
  initialState: (seed: number, settings: FoodTruckTycoonSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: FoodTruckTycoon,
};
