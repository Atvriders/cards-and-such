import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { IndianSummerMiniState, IndianSummerMiniAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IndianSummerMini } from "./Game.js";

const settings = {
  mode: { kind: "enum" as const, label: "Mode", options: ["easy"] as const, default: "easy" as const },
} as const;

export const indianSummerMiniPlugin: GamePlugin<IndianSummerMiniState, IndianSummerMiniAction, typeof settings> = {
  id: "indian-summer-mini",
  title: "Indian Summer Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tile-laying leaf puzzle.",
  howToPlay: "Indian Summer Mini is a quick abstract board game on a 3x3 grid against a simple CPU opponent. Tile-laying leaf puzzle. You and the CPU alternate placing tiles on empty cells.\n\nSpecial rule: Place leaves on 3x3, uncover hidden bonuses by matching colors.\n\nClick any empty cell to place your tile (X). The CPU then immediately places its tile (O) on a random empty cell. Continue until all 9 cells are filled. The board is then scored by the variant's rule — typically counting matching neighbours, completed rows, or set adjacencies.\n\nYour final score is your tile count plus any bonus from completed lines. The CPU's score is calculated the same way and shown for comparison. Beat the CPU to claim victory; tie if scores match.\n\nThe CPU is intentionally simple (random placement) to keep games quick — winning is achievable with a bit of pattern thinking. Strategy is in placing tiles where they form maximum adjacency bonuses while denying the CPU lines. A perfect 30-second abstract round, fully deterministic when seeded.",
  settings,
  initialState: (seed, _s) => initialState(seed, { mode: "easy" }),
  reducer,
  isTerminal,
  component: IndianSummerMini,
};
