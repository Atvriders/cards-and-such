import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FifteenPuzzleState, FifteenPuzzleAction, FifteenPuzzleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FifteenPuzzleGame } from "./Game.js";

const settings = {
  puzzles: { kind: "enum" as const, label: "Puzzles", options: ["8"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const fifteenTilesLogicPlugin: GamePlugin<FifteenPuzzleState, FifteenPuzzleAction, typeof settings> = {
  id: "fifteen-tiles-logic",
  title: "Fifteen Tiles Logic",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `4×4 sliding-tile logic: pick the next tile to slide on the optimal path.`,
  howToPlay: `The Fifteen Puzzle, invented by Noyes Chapman in 1874 and popularised in the 1880 Sam Loyd craze, is the classic 4×4 sliding-tile puzzle. Tiles 1–15 fill a 4×4 grid with one empty cell; tiles slide one at a time into the empty cell.

In this solo puzzle adaptation, each puzzle shows you a near-solved board and asks which tile to slide next on the optimal solution path. Pick from the candidate tiles.

Eight puzzles per session, 100 points each (800 max).

Tips: solving the Fifteen Puzzle from scratch typically follows a row-then-column pattern: solve the top row, then the left column, then the next row, etc. The "last two" of each row require a setup-and-rotate trick. Always plan the empty cell's path so it ends adjacent to the tile you want to move next. Half of all random configurations are unsolvable due to permutation parity.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FifteenPuzzleSettings),
  reducer,
  isTerminal,
  component: FifteenPuzzleGame,
};
