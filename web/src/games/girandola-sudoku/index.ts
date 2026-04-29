import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { GirandolaSudokuState, GirandolaSudokuStateAction, GirandolaSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GirandolaSudokuGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const girandolaSudokuPlugin: GamePlugin<GirandolaSudokuState, GirandolaSudokuStateAction, typeof settings> = {
  id: "girandola-sudoku",
  title: "Girandola Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spiral-pattern extra region must contain 1 to 9.",
  howToPlay: "Girandola Sudoku adds a spiral-shaped extra constraint region to standard Sudoku. The girandola is a swirling 9-cell pattern stretching from the center outward, and like a row, column, or box, it must contain each digit 1 to 9 exactly once.\n\nThe spiral region typically follows positions like (5,5), (4,5), (4,6), (5,6), (5,4), (6,4), (6,5), (6,6), (4,4) — a curl around the center cell. Each puzzle includes prefilled digits and asks you to deduce one cell's value using row, column, box, and girandola constraints.\n\nThis quiz presents six puzzles. Each shows a relevant slice and one girandola cell missing, with four lettered candidates. Apply all four constraint types — the girandola often pins a cell when standard rules fall short. Six puzzles per round; 100 points per correct answer plus time bonus. The spiral feels exotic but plays cleanly. Pick the digit honoring all constraints.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as GirandolaSudokuSettings),
  reducer,
  isTerminal,
  component: GirandolaSudokuGame,
};
