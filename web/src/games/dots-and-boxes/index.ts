import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DotsAndBoxesState, DotsAndBoxesAction, DotsAndBoxesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DotsAndBoxes } from "./Game.js";

const settings = {
  boardSize: {
    kind: "enum" as const,
    label: "Dots per Side",
    options: ["3", "5", "7"] as const,
    default: "5" as const,
  },
} as const;

export const dotsAndBoxesPlugin: GamePlugin<DotsAndBoxesState, DotsAndBoxesAction, typeof settings> = {
  id: "dots-and-boxes",
  title: "Dots and Boxes",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connect dots with lines. Complete the 4th side of a box to score it and go again.",
  howToPlay: `Dots and Boxes is played on a grid of dots. Players take turns drawing a single line segment connecting two adjacent dots (horizontally or vertically). When you draw the fourth and final side of a 1×1 square box, you claim that box and immediately take another turn — you keep going until you draw a line that doesn't complete any box.

The game ends when all possible line segments have been drawn. The player who claimed more boxes wins. You play as Blue; the bot plays as Red.

Board size can be 3×3 dots (2×2 boxes, quick games), 5×5 dots (4×4 boxes, standard), or 7×7 dots (6×6 boxes, longer games). Click any undrawn edge between two dots to draw your line.

The bot uses a heuristic strategy. It will always take a free box if one is available (completing a fourth side). Otherwise, it tries to make safe moves — moves that don't leave a box with three sides drawn (which would gift you a capture next turn). When forced to give up a chain, it picks a random move.

Strategy tip: think several moves ahead. A "double cross" — sacrificing a short chain to preserve control of a longer chain — is a key advanced technique in Dots and Boxes.`,
  settings,
  initialState: (seed: number, s: DotsAndBoxesSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: DotsAndBoxes,
};
