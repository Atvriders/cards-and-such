import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RobinsonCrusoeCoopState, RobinsonCrusoeCoopAction, RobinsonCrusoeCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RobinsonCrusoeCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const robinsonCrusoeCoopPlugin: GamePlugin<RobinsonCrusoeCoopState, RobinsonCrusoeCoopAction, typeof settings> = {
  id: "robinson-crusoe-coop",
  title: "Robinson Crusoe Coop",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative survival; build camp and explore.",
  howToPlay: "Robinson Crusoe Coop is a ten-round cooperative dice tribute to Portal Games' Robinson Crusoe: Adventures on the Cursed Island, the cooperative survival game on a hostile shore. You and an AI castaway ally roll dice each round to gather resources and explore. Team target is 70 across 10 rounds. 🏝️\n\nEach round both dice are rolled and summed, with the sum added to your team score. Reach 70 by round 10 and rescue arrives with a +50 cooperative bonus. Per-round averages near 7 mean ten rounds usually clear the target.\n\nPress Play Round to roll, Next Round to advance, and Finish on round 10. The game completes in well under a minute. It distills Robinson Crusoe's brutal cooperative survival into a brisk pocket session — perfect for a quick castaway fix that captures the desperate teamwork of the original even at this micro-scale dice-only level.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RobinsonCrusoeCoopSettings),
  reducer, isTerminal, component: RobinsonCrusoeCoopGame,
};
