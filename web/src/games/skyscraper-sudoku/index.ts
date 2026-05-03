import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SkyscraperSudokuState, SkyscraperSudokuStateAction, SkyscraperSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SkyscraperSudokuGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SkyscraperSudokuGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const skyscraperSudokuPlugin: GamePlugin<SkyscraperSudokuState, SkyscraperSudokuStateAction, typeof settings> = {
  id: "skyscraper-sudoku",
  title: "Skyscraper Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Edge clues count visible buildings of increasing height.",
  howToPlay: "Skyscraper Sudoku merges Skyscrapers and Sudoku. Each cell holds a digit 1 to 9 (interpreted as a building height) and standard Sudoku constraints apply (no repeats in row, column, or box). Additionally, edge clues outside some rows and columns indicate the count of visible skyscrapers from that direction. Tall buildings hide shorter ones behind them.\n\nThe edge clues act as powerful constraints — a clue of 1 means the closest building is 9 (tallest), hiding all others. A clue of 9 forces an ascending sequence 1,2,...,9. Clues between 2 and 8 narrow the arrangement.\n\nThis quiz uses 9x9 Skyscraper Sudoku with six puzzles. Each highlights one cell with edge clues active, presenting four height candidates. Apply the visible-buildings count combined with Sudoku rules to find the answer. Six puzzles per round; 100 points per correct answer plus time bonus. Pick the height honoring both constraints.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as SkyscraperSudokuSettings),
  reducer,
  isTerminal,
  
  hint: (state: SkyscraperSudokuState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-skyscraper-sudoku-answer-0"]', pulses: 3 } : null,component: SkyscraperSudokuGame,
};
