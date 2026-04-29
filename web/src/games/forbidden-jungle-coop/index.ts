import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ForbiddenJungleCoopState, ForbiddenJungleCoopAction, ForbiddenJungleCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ForbiddenJungleCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const forbiddenJungleCoopPlugin: GamePlugin<ForbiddenJungleCoopState, ForbiddenJungleCoopAction, typeof settings> = {
  id: "forbidden-jungle-coop",
  title: "Forbidden Jungle Coop",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Activate crystal structures before vines overgrow.",
  howToPlay: "Forbidden Jungle Coop is a ten-round cooperative dice tribute to the Forbidden series sequel where adventurers activate crystal structures before vines consume the path. You and an AI explorer ally roll dice each round to gather crystal energy. Team target is 70 points across 10 rounds. 🌿\n\nEach round both dice are rolled and summed, contributing to your team score. Reach 70 by round 10 and the temple's crystals activate with a +50 success bonus. Per-round averages around 7 mean ten rounds typically clear the target with comfortable margin.\n\nPress Play Round to roll, Next Round to advance, and Finish on round 10. The game completes in well under a minute, distilling Forbidden Jungle's lush vine-strangled atmosphere into a brisk, cooperative pocket-sized session. The vine-choked theme comes through clearly even in this dice-only adaptation perfect for repeats.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ForbiddenJungleCoopSettings),
  reducer, isTerminal, component: ForbiddenJungleCoopGame,
};
