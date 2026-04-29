import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LordOfRingsLcgState, LordOfRingsLcgAction, LordOfRingsLcgSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LordOfRingsLcgGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const lordOfRingsLcgPlugin: GamePlugin<LordOfRingsLcgState, LordOfRingsLcgAction, typeof settings> = {
  id: "lord-of-rings-lcg",
  title: "Lord of Rings LCG",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative Middle-earth quest LCG.",
  howToPlay: "Lord of Rings LCG is a ten-round cooperative dice tribute to Fantasy Flight Games' Lord of the Rings: The Card Game, the living-card-game cooperative quest through Middle-earth. You and an AI fellowship ally roll dice each round to advance the quest. Team target is 70 across 10 rounds. 💍\n\nEach round both dice are rolled and summed, with the sum added to your team score. Reach 70 by round 10 and the One Ring is destroyed with a +50 fellowship bonus. Per-round averages around 7 mean ten rounds usually clear the target.\n\nPress Play Round to roll, Next Round to advance, and Finish on round 10. The game completes in well under a minute. It distills the cooperative fellowship-questing of the original LCG into a fast, evocative pocket-sized session — perfect for fans of Tolkien's epic who want a quick taste of the cooperative quest without an hour of setup involved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LordOfRingsLcgSettings),
  reducer, isTerminal, component: LordOfRingsLcgGame,
};
