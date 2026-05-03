import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { CrypticSudokuState, CrypticSudokuStateAction, CrypticSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CrypticSudokuGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CrypticSudokuGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const crypticSudokuPlugin: GamePlugin<CrypticSudokuState, CrypticSudokuStateAction, typeof settings> = {
  id: "cryptic-sudoku",
  title: "Cryptic Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Letter clues decode to initial digits; double-layer puzzle.",
  howToPlay: "Cryptic Sudoku layers a word puzzle on top of standard Sudoku. Some cells are marked with letters; those letters spell out a coded word or phrase. Each unique letter represents a unique digit, and the digits must satisfy standard Sudoku rules. To solve, you decode the letter-to-digit mapping while simultaneously placing digits.\n\nA typical Cryptic Sudoku reveals hidden words like \"PUZZLE\" or \"SUDOKU\" once decoded. The puzzles often have a thematic flair — the hidden word may relate to a theme suggested by the puzzle title.\n\nThis quiz uses 9x9 Cryptic Sudoku with six puzzles. Each shows partial digit placements and a few letter cells, asking which digit corresponds to a specific letter (or which letter goes in a specific cell). Apply Sudoku constraints first to narrow down, then read the letter-to-digit mapping. Six puzzles per round; 100 points per correct answer plus time bonus. Pick the digit corresponding to the marked letter cell.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as CrypticSudokuSettings),
  reducer,
  isTerminal,
  
  hint: (state: CrypticSudokuState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-cryptic-sudoku-answer-0"]', pulses: 3 } : null,component: CrypticSudokuGame,
};
