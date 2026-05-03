import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MosaicState, MosaicAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Mosaic } from "./Mosaic.js";

const mosaicSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy",
  },
} as const;

type S = SettingsOf<typeof mosaicSettings>;

export const mosaicPuzzlePlugin: GamePlugin<MosaicState, MosaicAction, typeof mosaicSettings> = {
  id: "mosaic-puzzle",
  title: "Mosaic",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shade cells black or white so each numbered cell's 3×3 neighbourhood contains exactly that many black cells.",
  howToPlay: `Mosaic is a grid-shading logic puzzle. Every cell is either black or white. Some cells display a number — that number tells you exactly how many black cells exist within the cell's 3×3 neighbourhood, counting the clue cell itself and all of its diagonal, orthogonal, and corner neighbours (up to nine cells total; edge and corner cells have smaller neighbourhoods).

Your task is to shade every cell either black or white so that all number clues are satisfied simultaneously.

How to interact: click any cell once to mark it white, again to mark it black, and a third time to return it to unknown (grey). Work out which cells must be black or white by reasoning about the numbered clues. When all cells are filled and every clue is satisfied, the puzzle is solved.

Strategy: start with clues at 0 — all neighbours must be white. Clues equal to the size of their neighbourhood (4 in a corner, 6 on an edge, or 9 in the interior) force all neighbours black. Use overlapping neighbourhoods to propagate deductions across the grid.

The puzzle is solvable by pure logic — no guessing required.`,
  settings: mosaicSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-mosaic-puzzle-action"]', pulses: 3 }; },
  component: Mosaic,
};
