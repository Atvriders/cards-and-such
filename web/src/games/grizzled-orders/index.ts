import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GrizzledOrdersState, GrizzledOrdersAction, GrizzledOrdersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GrizzledOrdersGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const grizzledOrdersPlugin: GamePlugin<GrizzledOrdersState, GrizzledOrdersAction, typeof settings> = {
  id: "grizzled-orders",
  title: "Grizzled Orders",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Grizzled expansion with officer cards and missions.",
  howToPlay: "Grizzled Orders is a ten-round cooperative dice tribute to The Grizzled: At Your Orders, the expansion adding officer cards and mission objectives to the WWI cooperative card game. You and an AI officer ally roll dice each round to fulfill orders. Team target is 70 across 10 rounds. 🎖️\n\nEach round both dice are rolled and summed, with the sum added to your team score. Reach 70 by round 10 and the mission is complete with a +50 cooperative bonus. Per-round averages near 7 mean ten rounds usually meet the objective comfortably.\n\nPress Play Round to roll, Next Round to advance, and Finish on round 10. The game completes in well under a minute. The expansion's mission-focused feel comes through in pocket form, creating a brisk and cooperative session for two — you and a virtual squad-mate working together against fate itself.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GrizzledOrdersSettings),
  reducer, isTerminal, component: GrizzledOrdersGame,
};
