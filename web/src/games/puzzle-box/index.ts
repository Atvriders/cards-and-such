import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PuzzleBoxState, PuzzleBoxAction, PuzzleBoxSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PuzzleBox } from "./Game.js";

const settings = {
  shuffleMoves: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["20", "50", "100"] as const,
    default: "50" as const,
  },
  theme: {
    kind: "enum" as const,
    label: "Tile Theme",
    options: ["numbers", "emoji", "colors"] as const,
    default: "numbers" as const,
  },
} as const;

export const puzzleBoxPlugin: GamePlugin<PuzzleBoxState, PuzzleBoxAction, typeof settings> = {
  id: "puzzle-box",
  title: "Puzzle Box",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Arrange 9 sliding tiles into the correct order. Three visual themes to choose from.",
  howToPlay: `Puzzle Box is a classic 3×3 sliding tile puzzle — sometimes called the "8-puzzle." The board holds eight tiles and one blank space. The tiles are scrambled at the start, and your goal is to slide them back into the correct solved order.

The solved arrangement places tiles 1 through 8 in reading order (left-to-right, top-to-bottom) with the blank in the bottom-right corner. For emoji and color themes, the target is the same positional order — the visual representations just change.

To move a tile, click on any tile that is directly adjacent (horizontally or vertically) to the blank space. That tile slides into the blank, and the blank moves to where the tile was. Only tiles touching the blank can be moved — diagonal moves are not allowed.

Plan your moves carefully! Beginners often move tiles back and forth without making progress. A good strategy is to solve the top row first, then the left column, and finally the remaining 2×2 area. This avoids accidentally undoing your earlier work.

Score: you start with 500 base points plus up to 500 bonus points. The bonus decreases by 5 for every move you make, so solving in under 100 moves earns the maximum. There is no time limit — take as long as you need.

Three themes add visual variety: Numbers (classic), Emoji (animal faces), and Colors (color patches). The puzzle logic is identical regardless of theme.`,
  settings,
  initialState: (seed: number, s: PuzzleBoxSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-puzzle-box-action"]', pulses: 3 }; },
  component: PuzzleBox,
};
