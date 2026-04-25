import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PastaState, PastaAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PastaShop } from "./Game.js";

export const pastaShopPlugin = {
  id: "pasta-shop",
  title: "Pasta Shop",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Run an Italian pasta shop for 22 days. Pick your pasta, perfect your sauce, and grow your customer base to earn the top score!",
  howToPlay: `Pasta Shop lets you manage a cozy Italian eatery over 22 days. Every day you choose which pasta to cook, how many portions to prepare, and what price to charge — then open for service and see how the lunch crowd responds.

Choose a Pasta Type from Spaghetti, Fettuccine, Penne, or Ravioli. Each has different ingredient costs and natural demand. Ravioli commands premium prices but has lower base demand; Spaghetti is a crowd-pleaser with solid margins.

Set your Portion Count (1–70) and Price per Portion ($3–$14). Leftover portions are partially wasted, so anticipate demand carefully. Lower prices bring in more diners; higher prices increase revenue per seat — balance is key.

Invest in two upgrades between services: Better Sauce ($28 each, up to 3 tiers) makes your pasta irresistible and boosts demand, and Marketing ($35 each, up to 3 tiers) advertises to new customers and grows your daily foot traffic.

Strategy: Start with Spaghetti at 28 portions and $6. Save up for one sauce upgrade early, then reinvest into marketing. Scale up batch size as demand grows. Aim for $1800 by day 22 for a perfect score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: PastaState, action: PastaAction) => PastaState,
  isTerminal,
  component: PastaShop,
} as unknown as GamePlugin;
