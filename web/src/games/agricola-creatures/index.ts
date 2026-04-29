import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AgricolaCreaturesState, AgricolaCreaturesAction, AgricolaCreaturesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AgricolaCreaturesGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const agricolaCreaturesPlugin: GamePlugin<AgricolaCreaturesState, AgricolaCreaturesAction, typeof settings> = {
  id: "agricola-creatures",
  title: "Agricola All Creatures",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-player pastoral mini: 10 turns of buying livestock and hiring shepherds.",
  howToPlay: "Agricola All Creatures Big and Small is a streamlined pastoral resource game distilled to ten quick turns. You start with $200 cash, no livestock, and no shepherds. Each turn, pick one action: Buy a Livestock animal for $40, Save your cash for 5% interest, Hire a Shepherd for $60, or Sell a Livestock back to the market for a roughly $30-50 random payout. After your action, every animal in your pasture yields $8 in milk/wool/meat and every shepherd earns you $12 in skilled labor. A pastoral event flavors the turn. Your final score is your net worth — cash plus the cost-basis value of your animals and shepherds. The trick is balance: livestock yields reliable returns but locks up capital, shepherds amplify your income but cost more upfront. Aim for a balanced farm by turn 10 to maximize your final net worth.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AgricolaCreaturesSettings),
  reducer,
  isTerminal,
  component: AgricolaCreaturesGame,
};
