import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FoodChainMagnateState, FoodChainMagnateAction, FoodChainMagnateSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FoodChainMagnateGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const foodChainMagnatePlugin: GamePlugin<FoodChainMagnateState, FoodChainMagnateAction, typeof settings> = {
  id: "food-chain-magnate",
  title: "Food Chain Magnate",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Burger empire mini-sim: 10 turns of Restaurants and Managers ruling the market.",
  howToPlay: "Food Chain Magnate is a streamlined burger-empire simulation in ten quick turns. You begin with $200 cash, no Restaurants, and no Managers. Each turn, pick one action: Buy a Restaurant for $40, Save your cash for 5% interest, Hire a Manager for $60, or Sell a Restaurant back to the market for a roughly $30-50 random payout. After your action, every Restaurant in your chain earns $8 in burger and drink sales, and every Manager on payroll earns you $12 from advertising and supply chain magic. A fast-food market event flavors the turn. Your final score is your net worth — cash plus the cost-basis value of your restaurants and managers. The challenge is balance: restaurants generate reliable revenue but tie up capital, managers amplify earnings but cost more upfront, and saving plays it safe. Aim for a strong, balanced chain by turn 10 to top the food chain leaderboards.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FoodChainMagnateSettings),
  reducer,
  isTerminal,
  component: FoodChainMagnateGame,
};
