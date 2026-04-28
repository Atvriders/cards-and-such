import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TakuzuMiniState, TakuzuMiniAction, TakuzuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TakuzuMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const takuzuMiniPlugin: GamePlugin<TakuzuMiniState, TakuzuMiniAction, typeof settings> = {
  id: "takuzu-mini",
  title: "Takuzu Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "French-named Binairo: fill grid with 0s and 1s, equal counts per row/column, no three-in-a-row, no two identical rows or columns.",
  howToPlay: "Takuzu Mini is the French name for Binairo with one extra constraint: no two rows in the grid may be identical, and no two columns may be identical. Combined with the standard Binairo rules — equal counts of 0 and 1 per row/column, no three consecutive same digits — Takuzu adds a layer of \"everything must be unique.\"\n\nIn small grids that uniqueness rule has bite. Two rows that look interchangeable mid-solve must end up different by the final move, which often forces specific cells.\n\nEach puzzle shows a partial grid. A target cell is highlighted with candidate values 0 and 1 plus distractors. Reason about row/column counts, the no-triple rule, and uniqueness to pick the correct digit.\n\nSix puzzles per round; 100 points per correct answer plus a speed bonus. Wrong picks reveal the correct value. Takuzu is a delightful step up from plain Binairo — small puzzles still feel surprising thanks to that extra uniqueness twist.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as TakuzuMiniSettings),
  reducer,
  isTerminal,
  component: TakuzuMiniGame,
};
