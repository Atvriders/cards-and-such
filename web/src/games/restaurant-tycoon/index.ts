import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { RestaurantState, RestaurantAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RestaurantTycoon } from "./Game.js";

export const restaurantTycoonPlugin = {
  id: "restaurant-tycoon",
  title: "Restaurant Tycoon",
  category: "strategy",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Run your own restaurant — manage staff, set the menu price, and build your reputation over 30 days!",
  howToPlay: `Restaurant Tycoon puts you in charge of a dining establishment for 30 days. Your goal is to maximize profit by balancing staff, pricing, and marketing.

Each day you set four decisions: Staff (1–5 workers, each costs $20/day in wages), Menu Price ($5–$30 per meal), Daily Marketing budget ($0–$50), and a Featured Meal (Burger, Pizza, Salad, or Pasta). Each meal type has different ingredient costs and customer popularity.

Click "Open Restaurant!" to simulate the day. Your restaurant capacity equals staff × 8 seats. More staff lets you serve more customers, but cuts into profit. Set your price too high and customers stay away; too low and you can't cover costs.

Reputation (0–100) grows when you're busy and shrinks during slow days. Higher reputation brings more customers. Marketing also boosts traffic but costs money every day.

Strategy: Start with 2–3 staff and a mid-range price ($10–$15). Invest in marketing early to build reputation fast. As reputation climbs, raise prices gradually. Avoid overstaffing on slow days. Target $3000 cash by day 30 for a top score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: RestaurantState, action: RestaurantAction) => RestaurantState,
  isTerminal,
  component: RestaurantTycoon,
} as unknown as GamePlugin;
