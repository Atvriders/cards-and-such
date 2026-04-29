import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenWondersBabelState, SevenWondersBabelAction, SevenWondersBabelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenWondersBabelGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sevenWondersBabelPlugin: GamePlugin<SevenWondersBabelState, SevenWondersBabelAction, typeof settings> = {
  id: "seven-wonders-babel",
  title: "7 Wonders: Babel",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tower of Babel draft with shared law tiles.",
  howToPlay: "7 Wonders: Babel is a homage to Antoine Bauza's Babel expansion, where a Tower of Babel grows over the four suits and law tiles affect all civilizations. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau. Three of one suit earn +10 (a tower tier); five earn an additional +15 (the cap-stone). Pairs of rank earn +5 (a law tile); three-of-a-kind +10 (a great-law tile). Raw ranks sum as tribute. Score equals tableau total plus +25 for beating the CPU. Strategy: in Babel, the shared mechanic incentivizes hoarding one suit; use that pressure deliberately, or refuse it for diversified tribute. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevenWondersBabelSettings),
  reducer,
  isTerminal,
  component: SevenWondersBabelGame,
};
