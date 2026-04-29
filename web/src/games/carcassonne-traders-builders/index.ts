import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarcassonneTradersBuildersState, CarcassonneTradersBuildersAction, CarcassonneTradersBuildersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarcassonneTradersBuildersGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const carcassonneTradersBuildersPlugin: GamePlugin<CarcassonneTradersBuildersState, CarcassonneTradersBuildersAction, typeof settings> = {
  id: "carcassonne-traders-builders",
  title: "Carcassonne: Traders & Builders",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trade goods (wine, cloth, grain), builders, traders, and meeples.",
  howToPlay: "Carcassonne: Traders & Builders introduces wine, cloth, and grain trade tokens plus a builder bonus tile. In this 5x5 solo adaptation you place 17 tiles drawn from six themes: wine, cloth, grain, builders, traders, and meeples. Click any empty cell to place the next queued tile. Each placement scores 1 base point plus 1 per adjacent same-type tile. Trade goods score multiple bonus points historically, simulated here by clustering mechanics — wine next to wine and cloth next to cloth quickly compound. Plan carefully: with six distinct types and 17 tiles you'll often see 3-4 of each, so building two strong clusters is realistic. After all 17 tiles are placed the score is finalised. Solid scores fall in the 30-42 range; an exceptional cluster strategy can deliver 50+. Random queue ensures replay variety.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarcassonneTradersBuildersSettings),
  reducer,
  isTerminal,
  component: CarcassonneTradersBuildersGame,
};
