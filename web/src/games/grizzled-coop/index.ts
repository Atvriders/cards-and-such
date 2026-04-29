import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GrizzledCoopState, GrizzledCoopAction, GrizzledCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GrizzledCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const grizzledCoopPlugin: GamePlugin<GrizzledCoopState, GrizzledCoopAction, typeof settings> = {
  id: "grizzled-coop",
  title: "Grizzled Coop",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "WWI survival cooperative; suppress threats with morale.",
  howToPlay: "Grizzled Coop is a ten-round cooperative dice tribute to The Grizzled, the WWI cooperative card game where you suppress threats while preserving morale. You and an AI fellow soldier ally roll dice each round to survive missions together. Team target is 70 across 10 rounds. 🪦\n\nEach round both dice are rolled and summed, contributing to your team score. Reach 70 by round 10 and you both make it home with a +50 morale bonus. Per-round averages around 7 mean ten rounds usually clear the target if luck holds steady through tough rounds.\n\nPress Play Round to roll, Next Round to advance, and Finish on round 10. The game completes in well under a minute. It captures The Grizzled's somber cooperative tone in a fast, brisk pocket-sized session that respects the original's wartime emotional weight and replays cleanly for many short bursts.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GrizzledCoopSettings),
  reducer, isTerminal, component: GrizzledCoopGame,
};
