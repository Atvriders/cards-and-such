import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicInTheLabState, PandemicInTheLabAction, PandemicInTheLabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PandemicInTheLabGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pandemicInTheLabPlugin: GamePlugin<PandemicInTheLabState, PandemicInTheLabAction, typeof settings> = {
  id: "pandemic-in-the-lab",
  title: "Pandemic In The Lab",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lab-action expansion; cure discovery is multi-step.",
  howToPlay: "Pandemic In The Lab is a ten-round cooperative dice tribute to the In the Lab expansion for Pandemic where cure discovery becomes a multi-step lab-action process. You and an AI virologist ally roll dice each round to advance research. The team needs 70 points by round 10. 🔬\n\nEach round both dice are rolled and summed, with the sum added to your team score. Reach the 70-point target and the cure is discovered with a +50 cooperative bonus. Per-round average is 7; ten rounds normally reach the target.\n\nPress Play Round to roll, Next Round to continue, and Finish on round 10. The game completes in well under a minute, distilling the lab-research flavour of the expansion into a quick cooperative session. Excellent as a brief solo cooperative dice-roller emphasizing teamwork even when one of the players is computer-controlled.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicInTheLabSettings),
  reducer, isTerminal, component: PandemicInTheLabGame,
};
