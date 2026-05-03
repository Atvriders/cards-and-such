import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { JigsawSudokuMiniState, JigsawSudokuMiniAction, JigsawSudokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const JigsawSudokuMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.JigsawSudokuMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const jigsawSudokuMiniPlugin: GamePlugin<JigsawSudokuMiniState, JigsawSudokuMiniAction, typeof settings> = {
  id: "jigsaw-sudoku-mini",
  title: "Jigsaw Sudoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Standard 4x4 Sudoku but boxes are irregular jigsaw shapes instead of 2x2 blocks. Each region must contain each digit exactly once.",
  howToPlay: "Jigsaw Sudoku Mini ditches the rigid 2x2 boxes for irregular four-cell regions that meander across the grid. The rules are otherwise standard: fill 1-4 with no repeats per row, column, or jigsaw region.\n\nBecause regions can stretch L-shapes or zigzags, the deductive paths feel different from regular Sudoku. A single givens placement often forces several others by row+region intersection. Look for regions that touch one row twice — they pin two digits immediately.\n\nEach puzzle shows a partial grid, a marked target cell, and four candidate digits. Apply the row, column, and region rules to identify the unique value.\n\nSix puzzles per round. Correct answers award 100 points plus speed bonus; wrong answers earn nothing. After each guess, the right answer is revealed and you can move to the next puzzle. Jigsaw introduces just enough irregularity to refresh the classic Sudoku feel.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as JigsawSudokuMiniSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".jigsawpiece-num", pulses: 3 }; },
  component: JigsawSudokuMiniGame,
};
