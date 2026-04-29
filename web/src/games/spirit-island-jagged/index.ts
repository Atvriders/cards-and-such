import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpiritIslandJaggedState, SpiritIslandJaggedAction, SpiritIslandJaggedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpiritIslandJaggedGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const spiritIslandJaggedPlugin: GamePlugin<SpiritIslandJaggedState, SpiritIslandJaggedAction, typeof settings> = {
  id: "spirit-island-jagged",
  title: "Spirit Island Jagged Earth",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spirit Island expansion with new spirits and adversaries.",
  howToPlay: "Spirit Island Jagged Earth is a ten-round cooperative dice tribute to the major Spirit Island expansion that introduces new spirits and adversaries. You and an AI nature-spirit ally roll dice each round to push back colonists. Team target is 70 across 10 rounds. 🌋\n\nEach round both dice are rolled and summed, with the sum added to your team score. Reach 70 by round 10 and the island is saved with a +50 cooperative bonus. Per-round averages near 7; ten rounds usually exceed the target if luck holds.\n\nPress Play Round to roll, Next Round to advance, and Finish on round 10. The game completes in well under a minute, distilling Jagged Earth's expanded flavour into a compact dice cooperative session. While the expansion's spirits are abstracted away, the cooperative defence-of-the-island feeling comes through in this pocket version beautifully.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpiritIslandJaggedSettings),
  reducer, isTerminal, component: SpiritIslandJaggedGame,
};
