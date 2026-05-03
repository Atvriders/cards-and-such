import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { LitsPuzzleState, LitsPuzzleAction, LitsPuzzleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LitsPuzzleGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const litsPuzzlePlugin: GamePlugin<LitsPuzzleState, LitsPuzzleAction, typeof settings> = {
  id: "lits-puzzle",
  title: "LITS",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place exactly one tetromino (L, I, T, or S) in each region. No two same-type tetrominoes may touch edge-to-edge. Shaded cells must be connected with no 2x2 fully shaded.",
  howToPlay: "LITS shades exactly one tetromino — an L, I, T, or S shape — inside each region of the grid. The four shapes can be rotated and reflected freely. Across the entire grid, three constraints hold: (1) all shaded cells form one connected blob, (2) no 2x2 square is fully shaded, and (3) two same-type tetrominoes from different regions may not touch edge-to-edge.\n\nThe \"no 2x2 shaded\" rule keeps the shading thin, the connectivity rule ties everything together, and the same-type-no-touch rule forces variety between adjacent regions.\n\nEach puzzle shows a small region layout. A target cell is highlighted with four candidate values: L, I, T, S, or empty (the cell could be unshaded). Apply the LITS rules to choose correctly.\n\nSix puzzles per round; 100 points per correct answer plus a time bonus. Wrong picks reveal the correct value. LITS is fiendishly addictive once it clicks — small puzzles can feel like a Rubik's cube of polyominoes.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as LitsPuzzleSettings),
  reducer,
  isTerminal,
  
  hint: (state: LitsPuzzleState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-lits-puzzle-answer-0"]', pulses: 3 } : null,component: LitsPuzzleGame,
};
