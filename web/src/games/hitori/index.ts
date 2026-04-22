import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { HitoriState, HitoriAction, HitoriSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Hitori } from "./Game.js";

export const hitoriSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["5", "6", "7"] as const,
    default: "5",
  },
} as const;

export const hitoriPlugin: GamePlugin<HitoriState, HitoriAction, typeof hitoriSettings> = {
  id: "hitori",
  title: "Hitori",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shade cells to eliminate duplicate numbers in each row and column, keeping unshaded cells connected.",
  howToPlay: `Hitori is a Japanese logic puzzle. The grid is filled with numbers, and some numbers appear more than once in a row or column. Your goal is to shade cells (turn them black) so that the following three rules are satisfied.

First, no unshaded row or column may contain duplicate numbers — each value must appear at most once among the unshaded cells. Second, no two shaded cells may be orthogonally adjacent (they cannot touch up, down, left, or right — diagonal touching is allowed). Third, all unshaded cells must form a single connected region: you must be able to reach any unshaded cell from any other by moving through unshaded cells orthogonally.

Click any cell to toggle its shading: click once to shade it black, click again to unshade it. Cells highlighted in red indicate violations — either duplicates among unshaded cells or adjacent shaded cells. Use the Reset button to clear the board and start over.

Strategy tip: if a number appears only twice in a row, exactly one of them must be shaded. Numbers that appear only once in their row and column are always unshaded. Use the adjacency rule to prevent illegal shading patterns.`,
  settings: hitoriSettings,
  initialState: (seed: number, settings: HitoriSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Hitori,
};
