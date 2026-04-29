import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicHotZoneNaState, PandemicHotZoneNaAction, PandemicHotZoneNaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PandemicHotZoneNaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pandemicHotZoneNaPlugin: GamePlugin<PandemicHotZoneNaState, PandemicHotZoneNaAction, typeof settings> = {
  id: "pandemic-hot-zone-na",
  title: "Pandemic Hot Zone NA",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact Pandemic on just North America.",
  howToPlay: "Pandemic Hot Zone NA is a ten-round cooperative dice tribute to Pandemic: Hot Zone — North America, the compact 45-minute version of Leacock's classic concentrated on the continent. You and an AI ally roll dice each round to score together. The team needs 70 points by round 10. 🌎\n\nEach round, both dice are rolled and summed; that sum is added to your team score. Reach 70 and a +50 bonus is awarded. Across ten rounds, totals near 70 are common — making for a tense, often tight race against the disease.\n\nPress Play Round to roll, then Next Round to continue, and Finish on round 10. The game completes in well under a minute, distilling Hot Zone's quicker cooperative beat into a satisfying pocket-sized session ideal for any spare moment, and easily replayed many times to chase higher cooperative bonus scores together.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicHotZoneNaSettings),
  reducer, isTerminal, component: PandemicHotZoneNaGame,
};
