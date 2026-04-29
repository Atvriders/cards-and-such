import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicFallOfRomeState, PandemicFallOfRomeAction, PandemicFallOfRomeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PandemicFallOfRomeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pandemicFallOfRomePlugin: GamePlugin<PandemicFallOfRomeState, PandemicFallOfRomeAction, typeof settings> = {
  id: "pandemic-fall-of-rome",
  title: "Pandemic Fall of Rome",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Historical Pandemic; barbarians replace disease.",
  howToPlay: "Pandemic Fall of Rome is a ten-round cooperative dice homage to the historical Pandemic spinoff where barbarian invasions replace disease cubes. You and an AI Roman general ally roll dice each round to defend the empire. Team target is 70 points across 10 rounds. 🏛️\n\nEach round both dice are rolled and summed, with that sum added to your team score. Reach 70 by the final round and the empire is saved with a +50 unity bonus. Average per-round score is 7; ten rounds typically reach the target.\n\nPress Play Round to roll the dice, then Next Round to advance, and Finish on round 10. The game completes in well under a minute, distilling Fall of Rome's historical urgency into a tight, cooperative pocket form. The thematic combat-heavy reskin of Pandemic shines through even at this micro scale, replayable many times.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicFallOfRomeSettings),
  reducer, isTerminal, component: PandemicFallOfRomeGame,
};
