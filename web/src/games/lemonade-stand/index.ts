import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { LemonadeState, LemonadeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LemonadeStand } from "./Game.js";

export const lemonadeStandPlugin = {
  id: "lemonade-stand",
  title: "Lemonade Stand",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic sim — set your price, make cups, spend on ads, and beat the weather over 30 days!",
  howToPlay: `Lemonade Stand is a classic business simulation game. You run a lemonade stand for 30 days, trying to earn as much profit as possible.

Each morning you see the day's weather forecast — Sunny, Cloudy, Hot, or Rainy — which strongly affects customer demand. Hot days bring large crowds eager for cold drinks; rainy days drive people away and hurt sales significantly.

Before opening, set three decisions: your price per cup (10–100 cents), how many cups to make (1–50), and your advertising budget (0–50 cents). Advertising boosts customer awareness and attracts more buyers. Each cup costs 4 cents to make in ingredients, plus whatever you spend on ads.

Click "Open Stand!" to simulate the day. You will see how many cups sold, your total revenue, production costs, and your daily profit or loss. Unsold cups are thrown away, so over-producing on bad weather days wastes money.

Strategy tips: On hot days raise your price and make plenty of cups — demand is high and customers will pay more. On rainy days keep production very low to avoid losses from waste. Mid-range advertising ($0.20–$0.30) usually gives the best return. Watch your cash — going negative means you can't afford supplies.

Your final score is based on total money at end of day 30. Starting cash is $2.00 — can you build it to $20.00 or more?`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: LemonadeStand,
} as unknown as GamePlugin;
