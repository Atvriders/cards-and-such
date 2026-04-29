import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MagicMazeMaxSecurityState, MagicMazeMaxSecurityAction, MagicMazeMaxSecuritySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MagicMazeMaxSecurityGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const magicMazeMaxSecurityPlugin: GamePlugin<MagicMazeMaxSecurityState, MagicMazeMaxSecurityAction, typeof settings> = {
  id: "magic-maze-max-security",
  title: "Magic Maze Max Security",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Magic Maze expansion with prison heist scenario.",
  howToPlay: "Magic Maze Max Security is a ten-round cooperative dice tribute to Sit Down's Magic Maze: Maximum Security, the expansion adding a prison heist scenario with guards. You and an AI accomplice ally roll dice each round to make your escape. Team target is 70 across 10 rounds. 🚓\n\nEach round both dice are rolled and summed, with the sum added to your team score. Reach 70 by round 10 and the heist succeeds with a +50 cooperative escape bonus. Per-round averages around 7 mean ten rounds usually clear the target.\n\nPress Play Round to roll, Next Round to advance, and Finish on round 10. The game completes in well under a minute. It distills Magic Maze's silent cooperative chaos into a quick pocket session — perfect for a brisk cooperative heist fix that channels the original's tension even in distilled dice form for many cooperative replays.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MagicMazeMaxSecuritySettings),
  reducer, isTerminal, component: MagicMazeMaxSecurityGame,
};
