import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicLegacyS1State, PandemicLegacyS1Action, PandemicLegacyS1Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PandemicLegacyS1Game } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pandemicLegacyS1Plugin: GamePlugin<PandemicLegacyS1State, PandemicLegacyS1Action, typeof settings> = {
  id: "pandemic-legacy-s1",
  title: "Pandemic Legacy S1",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Campaign Pandemic with permanent consequences.",
  howToPlay: "Pandemic Legacy S1 is a ten-round cooperative dice tribute to Rob Daviau and Matt Leacock's Pandemic Legacy: Season 1, the campaign Pandemic where permanent consequences shape future games. You and an AI ally roll dice each round to suppress an evolving threat. Team target is 70 across 10 rounds. 📜\n\nEach round both dice are rolled and summed, adding to your team score. Reach 70 by round 10 and Year One ends in success with a +50 cooperative bonus. Per-round averages near 7 mean ten rounds typically clear the target with margin.\n\nPress Play Round to roll, then Next Round to continue, and Finish on round 10. The game completes in well under a minute, distilling Pandemic Legacy's narrative drive into a compact cooperative experience. The session captures the cooperative legacy spirit beautifully in pocket form for replays.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicLegacyS1Settings),
  reducer, isTerminal, component: PandemicLegacyS1Game,
};
