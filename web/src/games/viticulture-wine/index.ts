import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ViticultureWineState, ViticultureWineAction, ViticultureWineSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ViticultureWineGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const viticultureWinePlugin: GamePlugin<ViticultureWineState, ViticultureWineAction, typeof settings> = {
  id: "viticulture-wine",
  title: "Viticulture Wine Estate",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Wine-estate mini: 10 turns of Vines and Visitors managing the estate.",
  howToPlay: "Viticulture Wine Estate condenses the seasonal wine-estate worker placement game into ten quick turns. You begin with $200 cash, no Vines, and no Visitors. Each turn, pick one action: Plant a Vine for $40, Save your cash for 5% interest, Welcome a Visitor for $60, or Sell a Vine back to the market for a roughly $30-50 payout. After your action, every Vine in your vineyard earns $8 from grape harvest and every Visitor earns $12 from tour and tastings. A Tuscan estate event flavors the turn. Your final score is your net worth — cash plus the cost-basis value of your vines and visitors. Vines yield reliable harvest income but tie up capital, visitors amplify earnings but cost more, and saving is slow but safe. Aim for a balanced wine estate by turn 10 to top the Tuscan vineyard leaderboards.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ViticultureWineSettings),
  reducer,
  isTerminal,
  component: ViticultureWineGame,
};
