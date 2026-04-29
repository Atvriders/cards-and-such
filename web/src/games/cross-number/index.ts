import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CrossNumberState, CrossNumberAction, CrossNumberSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrossNumberGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const crossNumberPlugin: GamePlugin<CrossNumberState, CrossNumberAction, typeof settings> = {
  id: "cross-number",
  title: "Cross Number",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Numeric crossword: arithmetic clues fill grid cells with digits.",
  howToPlay: "Cross Number is a numeric crossword puzzle. Instead of words, you fill cells with single digits (0-9). Clues are short arithmetic expressions: \"sum of squares of 4 and 5\", \"largest two-digit prime\", and so on. Across and down entries share digits, so each constraint helps narrow neighbors.\n\nEach puzzle shows a small grid (4x4) with a few cells pre-filled. The prompt asks for the value of a specific marked cell. Use the surrounding clues, your arithmetic, and any pre-filled neighbors to deduce the right digit.\n\nSix puzzles per round, increasing in difficulty. Scoring is 100 points per correct answer plus a 10-point time bonus per remaining second. Wrong picks reveal the right digit.\n\nCross Numbers appeared in early-20th-century puzzle magazines like \"Puzzler\" and \"GAMES\". They train basic mental arithmetic alongside cell-by-cell constraint propagation. Smaller cross numbers like these solve in under a minute once you spot the right entry to start from. Pure logic from start to finish — no guesswork required.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as CrossNumberSettings),
  reducer,
  isTerminal,
  component: CrossNumberGame,
};
