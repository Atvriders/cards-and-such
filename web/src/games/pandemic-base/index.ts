import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicBaseState, PandemicBaseAction, PandemicBaseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PandemicBaseGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pandemicBasePlugin: GamePlugin<PandemicBaseState, PandemicBaseAction, typeof settings> = {
  id: "pandemic-base",
  title: "Pandemic Base",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative disease control around the globe.",
  howToPlay: "Pandemic Base is a ten-round cooperative-rolling tribute to Matt Leacock's seminal cooperative game Pandemic, where you and an AI medic ally race to suppress disease outbreaks worldwide. Each round you both roll one six-sided die — your sum is added to a team score with a target of 70. 🦠\n\nReach the 70-point target by round 10 and the world is saved with a +50 cooperative bonus. Average per round is 7 points; ten rounds usually clear the target with comfortable margin. The original Pandemic involves cubes, outbreaks and cure research — this distillation captures only the cooperative dice tension.\n\nPress Play Round to roll both dice, then Next Round to advance, or Finish on round 10. The game completes in under a minute. It's the perfect cooperative micro-version, recreating the team-spirit feel of the original epic without any of the complex board overhead so beloved fans never tire of it.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicBaseSettings),
  reducer, isTerminal, component: PandemicBaseGame,
};
