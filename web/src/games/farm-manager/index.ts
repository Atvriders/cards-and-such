import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FarmState, FarmAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FarmManager } from "./Game.js";

export const farmManagerPlugin = {
  id: "farm-manager",
  title: "Farm Manager",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Plant crops, harvest, and survive 10 seasons of unpredictable weather!",
  howToPlay: `Farm Manager is a single-player farming simulation across 10 seasons. You start with $50 and manage 6 fields, planting and harvesting crops to grow your fortune.

Each season has two stages. First, the planting phase: click the empty plant buttons inside each field to choose a crop. Three crops are available — Wheat (cheapest, $3/bushel), Corn (mid-range, $5/bushel), and Tomato (expensive, $8/bushel). Each crop costs money to plant, so budget wisely. Fields left unplanted remain fallow and produce nothing.

When ready, click "End Planting" to reveal the season's weather event. Weather is random: Normal gives standard yields (10 bushels/field), a Bumper crop gives 18 bushels, Drought drops yield to 3, and a Flood devastates down to 1. Then click "Harvest" to collect your revenue and see your profit.

Strategy: Higher-value crops like Tomato pay well but cost more to plant. On bad weather seasons the extra cost may not be worth it. Wheat is safer but lower reward. Try to plant all 6 fields each season to maximize upside, and keep enough cash in reserve to survive drought seasons.

Your score is based on your total money after 10 seasons. Reach $500 for a perfect score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: FarmState, action: FarmAction) => FarmState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".farm-crop-btn", pulses: 3 }; },
  component: FarmManager,
} as unknown as GamePlugin;
