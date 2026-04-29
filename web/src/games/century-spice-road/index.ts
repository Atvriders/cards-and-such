import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CenturySpiceRoadState, CenturySpiceRoadAction, CenturySpiceRoadSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CenturySpiceRoadGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const centurySpiceRoadPlugin: GamePlugin<CenturySpiceRoadState, CenturySpiceRoadAction, typeof settings> = {
  id: "century-spice-road",
  title: "Century Spice Road",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spice-trading caravan mini: 10 turns of Spice cards and Caravan upgrades.",
  howToPlay: "Century Spice Road condenses the camel-caravan trading game into ten quick turns. You begin with $200 cash, no Spice cards, and no Caravans. Each turn, pick one action: Buy a Spice card for $40, Save your cash for 5% interest, Buy a Caravan for $60, or Sell a Spice card back to the market for a roughly $30-50 payout. After your action, every Spice card earns you $8 from market sales and every Caravan earns you $12 from extra trade routes. A trade-route event flavors the turn. Your final score is your net worth — cash plus the cost-basis value of your cards and caravans. Spice cards yield steady income but tie up capital, caravans amplify earnings but cost more, and saving is slow but safe. Aim for a balanced caravan operation by turn 10 and dominate the Spice Road.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CenturySpiceRoadSettings),
  reducer,
  isTerminal,
  component: CenturySpiceRoadGame,
};
