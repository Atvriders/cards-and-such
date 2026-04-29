import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpiritIslandNatureState, SpiritIslandNatureAction, SpiritIslandNatureSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpiritIslandNatureGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const spiritIslandNaturePlugin: GamePlugin<SpiritIslandNatureState, SpiritIslandNatureAction, typeof settings> = {
  id: "spirit-island-nature",
  title: "Spirit Island Nature Incarnate",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Expansion with aspects transforming spirits.",
  howToPlay: "Spirit Island Nature Incarnate is a ten-round cooperative dice tribute to Greater Than Games' Spirit Island expansion that adds aspects which transform existing spirits. You and an AI nature-spirit ally roll dice each round to defend the island. Team target is 70 across 10 rounds. 🌳\n\nEach round both dice are rolled and summed, with the result added to your team score. Reach the 70-point target by round 10 and the island repels invaders with a +50 cooperative bonus. Per-round averages near 7 typically reach the target.\n\nPress Play Round to roll, Next Round to advance, and Finish on round 10. The game completes in well under a minute. It captures the aspect-driven cooperative feel of the original expansion in a brisk pocket form perfect for a quick cooperative dice fix without setup or learning curve overhead, ready to replay.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpiritIslandNatureSettings),
  reducer, isTerminal, component: SpiritIslandNatureGame,
};
