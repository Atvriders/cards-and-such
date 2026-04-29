import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicLegacyS2State, PandemicLegacyS2Action, PandemicLegacyS2Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PandemicLegacyS2Game } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pandemicLegacyS2Plugin: GamePlugin<PandemicLegacyS2State, PandemicLegacyS2Action, typeof settings> = {
  id: "pandemic-legacy-s2",
  title: "Pandemic Legacy S2",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "12-month follow-up; rebuild a post-collapse world.",
  howToPlay: "Pandemic Legacy S2 is a ten-round cooperative dice homage to Pandemic Legacy: Season 2, the post-collapse follow-up where players rebuild civilization city by city across a 12-month campaign. You and an AI ally roll dice each round to push the rebuild forward. Team target is 70 across 10 rounds. 🌅\n\nEach round both dice are rolled and summed, contributing to your team score. Reach 70 by round 10 and the world is reborn with a +50 cooperative bonus. Average per round is 7; ten rounds usually exceed the target.\n\nPress Play Round to roll, Next Round to advance, and Finish on round 10. The game completes in well under a minute, distilling Season 2's hopeful rebuild theme into a compact cooperative session that reflects the larger campaign's emotional cooperative arc beautifully and is endlessly replayable for a quick cooperative tabletop sit-down feel.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicLegacyS2Settings),
  reducer, isTerminal, component: PandemicLegacyS2Game,
};
