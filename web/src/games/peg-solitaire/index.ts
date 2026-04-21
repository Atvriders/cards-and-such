import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PegSolitaireState, PegSolitaireAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PegSolitaire } from "./PegSolitaire.js";

export const pegSolitaireSettings = {
  variant: {
    kind: "enum" as const,
    label: "Board",
    options: ["english"] as const,
    default: "english" as const,
  },
} as const;

type PegSolitaireSettingsType = SettingsOf<typeof pegSolitaireSettings>;

export const pegSolitairePlugin: GamePlugin<PegSolitaireState, PegSolitaireAction, typeof pegSolitaireSettings> = {
  id: "peg-solitaire",
  title: "Peg Solitaire",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Jump pegs over pegs to remove them. Try to leave one peg in the center.",
  howToPlay: `Peg Solitaire (also called Brainvita) is played on an English cross board — a 7×7 grid with the four corner squares removed, leaving 33 positions. The board starts with 32 pegs filling all positions except the center hole.

A move consists of jumping one peg over an adjacent peg (horizontally or vertically) into an empty hole on the other side. The peg that was jumped over is removed. You cannot jump diagonally.

Click a peg to select it (it turns yellow). Valid jump destinations are highlighted in green. Click a green hole to complete the jump. Alternatively, click the peg to select, then click the destination directly.

The goal is to remove as many pegs as possible. The perfect solution leaves exactly one peg in the center hole. Solving the puzzle perfectly requires careful planning — the classic puzzle has a known solution.

Scoring: 1000 points for leaving 1 peg (perfect), minus 150 for each additional peg remaining, with a floor of 50. Leaving 1 peg anywhere still scores well; only the center earns the full 1000.

Tips: try to maintain symmetry early in the game. Work from the edges inward. Avoid stranding pegs in corners where they cannot be jumped.`,
  settings: pegSolitaireSettings,
  initialState: (seed: number, settings: PegSolitaireSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: PegSolitaire,
};
