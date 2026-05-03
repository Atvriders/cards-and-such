import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DominosaPuzzleState, DominosaPuzzleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Dominosa } from "./Dominosa.js";

export const dominosaSettings = {
  hint: {
    kind: "boolean" as const,
    label: "Show Hints",
    default: false,
  },
} as const;

type DominosaSettingsType = SettingsOf<typeof dominosaSettings>;

export const dominosaPlugin: GamePlugin<DominosaPuzzleState, DominosaPuzzleAction, typeof dominosaSettings> = {
  id: "dominosa",
  title: "Dominosa",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find where each unique domino is hidden in a grid of numbers. Every [a,b] pair appears exactly once.",
  howToPlay: `Dominosa is a deduction puzzle. A complete set of 28 dominoes — every pair from [0,0] up to [6,6] — has been laid on a 7×8 grid, but only the pip numbers are shown; the borders between dominoes are hidden.

Your task is to reconstruct exactly where each domino lies. Click two adjacent cells (horizontally or vertically) to claim them as a domino. The cells are highlighted green when successfully paired. Right-click a claimed cell to remove the pairing if you change your mind.

Each domino is unique. The pair [3,5] appears exactly once, and so does [0,0], [1,4], and every other combination. Use this constraint to eliminate possibilities: if you can see two cells showing 3 and 5, and you have already placed the [3,5] domino elsewhere, those two cells must belong to different dominoes.

Start by looking for numbers that only appear a few times and have limited adjacency options. Work logically — the puzzle always has a unique solution and never requires guessing. Solve all 28 dominoes to complete the puzzle.`,
  settings: dominosaSettings,
  initialState: (seed: number, settings: DominosaSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".dominosa-board")) ? { selector: ".dominosa-board", pulses: 3 } : null,
  component: Dominosa,
};
