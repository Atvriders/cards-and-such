import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TacoState, TacoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TacoTruck } from "./Game.js";

export const tacoTruckPlugin = {
  id: "taco-truck",
  title: "Taco Truck",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Run a taco truck for 20 days. Choose your filling, set prices, and invest in salsa and location upgrades to maximize profits!",
  howToPlay: `Taco Truck puts you in charge of a street food truck for 20 days. Each day you decide how many tacos to make, what price to charge, and which filling to feature — then watch how many hungry customers show up.

Choose a Filling from Beef, Chicken, Veggie, or Shrimp. Each has different ingredient costs and base customer demand. Unsold tacos are mostly wasted, so try to match your batch to expected sales.

Set your Price ($2–$10). Lower prices attract more foot traffic; higher prices earn more per sale — find your balance. Adjust your Taco Count (1–60) to match your forecast for the day.

Between service windows you can invest in two upgrades: Better Salsa ($25 each, up to 3 levels) which makes your tacos more popular, and Better Spot ($40 each, up to 3 levels) which brings your truck to higher-traffic locations — both boost daily demand.

Strategy: Start conservative (25 tacos, $4) and build capital. Chicken is the most cost-efficient filling early on. Upgrade your location first for maximum demand boost. Aim for $1500 by day 20 for a perfect score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: TacoState, action: TacoAction) => TacoState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".taco-btn", pulses: 3 }; },
  component: TacoTruck,
} as unknown as GamePlugin;
