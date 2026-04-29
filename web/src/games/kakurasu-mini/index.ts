import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { KakurasuMiniState, KakurasuMiniAction, KakurasuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KakurasuMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const kakurasuMiniPlugin: GamePlugin<KakurasuMiniState, KakurasuMiniAction, typeof settings> = {
  id: "kakurasu-mini",
  title: "Kakurasu Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shade cells so row index sums equal row clue. 4x4 grid logic.",
  howToPlay: "Kakurasu (also spelled Kakuru) is a number-shading puzzle. The grid is 4x4. Each row has a clue at its right; each column has a clue at its bottom. The cells in a row are indexed 1-4 from the left; cells in a column are indexed 1-4 from the top.\n\nYour goal: shade certain cells so the indices of shaded cells in each row sum to the row's clue, and the indices of shaded cells in each column sum to the column's clue. For example, if a row's clue is 6 and only the cells at positions 2 and 4 are shaded, the sum is 2+4 = 6.\n\nIn this mini version, each puzzle shows a partially-filled grid and asks which single cell must be shaded next to satisfy the row/column constraints. Apply both row and column logic to deduce the answer.\n\nSix puzzles per round, scoring 100 points each plus 10-point time bonus per remaining second. Wrong picks reveal the correct cell. Kakurasu uses pure arithmetic with no guesswork — every puzzle has a unique solution reachable by row-column intersection logic.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as KakurasuMiniSettings),
  reducer,
  isTerminal,
  component: KakurasuMiniGame,
};
