import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiagonalKillerState, DiagonalKillerStateAction, DiagonalKillerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiagonalKillerGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const diagonalKillerPlugin: GamePlugin<DiagonalKillerState, DiagonalKillerStateAction, typeof settings> = {
  id: "diagonal-killer",
  title: "Diagonal Killer Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Killer Sudoku with main diagonal constraint added.",
  howToPlay: "Diagonal Killer Sudoku combines Killer Sudoku (cage sums, no-repeat within cages) with Diagonal Sudoku (the two main diagonals must each contain digits 1 to 9 exactly once). The combined ruleset triples the constraint density on diagonal cells, making them the easiest to deduce despite the puzzle's overall difficulty.\n\nA cell on the main diagonal sits on five constraints: row, column, box, cage, and diagonal. With so many active rules, the cell often resolves quickly even from sparse clues.\n\nThis quiz uses 9x9 Diagonal Killer Sudoku with six puzzles. Each highlights a diagonal cell or a cage cell that affects a diagonal cell, presenting four candidates. Apply all five constraint types where relevant. Six puzzles per round; 100 points per correct answer plus time bonus. Diagonal Killer rewards diagonal-first scanning — the X pattern usually gives away cell values before standard scanning reveals them. Pick the digit satisfying every active constraint.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as DiagonalKillerSettings),
  reducer,
  isTerminal,
  
  hint: (state: DiagonalKillerState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-diagonal-killer-answer-0"]', pulses: 3 } : null,component: DiagonalKillerGame,
};
