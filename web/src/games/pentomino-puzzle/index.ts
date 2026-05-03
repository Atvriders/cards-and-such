import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { PentominoPuzzleState, PentominoPuzzleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PentominoPuzzle } from "./PentominoPuzzle.js";

const pentominoPuzzleSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

export const pentominoPuzzlePlugin: GamePlugin<PentominoPuzzleState, PentominoPuzzleAction, typeof pentominoPuzzleSettings> = {
  id: "pentomino-puzzle",
  title: "Pentomino Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fit pentomino pieces together to fill the rectangular grid.",
  howToPlay: `Pentominoes are shapes made of five squares joined edge-to-edge. Your goal is to place all the given pieces so they fill every cell of the rectangular grid without overlapping.

Click a piece preview at the top to select it (it will be highlighted). Then click any empty cell on the grid to place the piece, using that cell as the top-left anchor of the piece. The piece will snap into position if it fits; if not, nothing happens.

Click any placed piece on the grid to remove it and return it to your hand. This lets you reposition pieces as you work out the solution.

Pieces cannot overlap and must stay within the grid boundaries. The puzzle is complete when every cell is filled.

Tips: start with the most awkward pieces — the I-pentomino (1×5 strip), the U, and the T are often hardest to fit. Identify corners and edges first, since pieces that fit along the border have fewer choices. Work inward from constrained areas. The total number of squares in your piece set exactly equals the grid area, so there is no slack — every piece must fit perfectly.`,
  settings: pentominoPuzzleSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".piece-mini-grid")) ? { selector: ".piece-mini-grid", pulses: 3 } : null,
  component: PentominoPuzzle,
};
