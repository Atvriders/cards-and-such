import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { TigrisEuphratesMiniState, TigrisEuphratesMiniAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TigrisEuphratesMini } from "./Game.js";

const settings = {
  mode: { kind: "enum" as const, label: "Mode", options: ["easy"] as const, default: "easy" as const },
} as const;

export const tigrisEuphratesMiniPlugin: GamePlugin<TigrisEuphratesMiniState, TigrisEuphratesMiniAction, typeof settings> = {
  id: "tigris-euphrates-mini",
  title: "Tigris & Euphrates Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place leader tiles on a 3x3 board vs CPU.",
  howToPlay: "Tigris & Euphrates Mini is a quick abstract board game on a 3x3 grid against a simple CPU opponent. Place leader tiles on a 3x3 board vs CPU. You and the CPU alternate placing tiles on empty cells.\n\nSpecial rule: Player vs CPU on 3x3; each places color tiles; whoever has more matching neighbours wins.\n\nClick any empty cell to place your tile (X). The CPU then immediately places its tile (O) on a random empty cell. Continue until all 9 cells are filled. The board is then scored by the variant's rule — typically counting matching neighbours, completed rows, or set adjacencies.\n\nYour final score is your tile count plus any bonus from completed lines. The CPU's score is calculated the same way and shown for comparison. Beat the CPU to claim victory; tie if scores match.\n\nThe CPU is intentionally simple (random placement) to keep games quick — winning is achievable with a bit of pattern thinking. Strategy is in placing tiles where they form maximum adjacency bonuses while denying the CPU lines. A perfect 30-second abstract round, fully deterministic when seeded.",
  settings,
  initialState: (seed, _s) => initialState(seed, { mode: "easy" }),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".g-grid")) ? { selector: ".g-grid", pulses: 3 } : null,
  component: TigrisEuphratesMini,
};
