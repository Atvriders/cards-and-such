import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FifteenPuzzleState, FifteenPuzzleAction, FifteenPuzzleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FifteenPuzzleGame } from "./Game.js";

const settings = {
  dummy: { kind: "boolean" as const, label: "dummy", default: false },
} as const;
type S = SettingsOf<typeof settings>;

export const fifteenTilesLogicPlugin: GamePlugin<FifteenPuzzleState, FifteenPuzzleAction, typeof settings> = {
  id: "fifteen-tiles-logic",
  title: "Fifteen Tiles Logic",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic 4x4 sliding-tile puzzle: arrange 1-15 in order with one blank cell.",
  howToPlay: `The Fifteen Puzzle, popularised by the 1880 Sam Loyd craze, is the canonical 4x4 sliding-tile puzzle. Tiles 1 through 15 fill a 4x4 grid with one empty cell, and your goal is to slide tiles into the blank until they read 1-15 across rows with the blank at bottom-right.

Click any tile orthogonally adjacent to the blank to slide it in. Tiles already in their goal position turn green so you can track progress.

Tips: solve top-to-bottom and left-to-right. Finish row 1, then row 2, never disturbing solved rows. The "last two of a row" trick uses a small rotation through the column below. Half of all permutations are unsolvable, so this game always shuffles via random walks from solved to guarantee a solution exists.

Scoring: 800 points minus 4 per move with an 80-point floor.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FifteenPuzzleSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".fp-btn", pulses: 3 }; },
  component: FifteenPuzzleGame,
};
