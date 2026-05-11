import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KillerSudokuState, KillerSudokuAction, KillerSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KillerSudoku } from "./KillerSudoku.js";

const KillerSudokuGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.KillerSudokuGame as unknown as React.ComponentType<unknown> })));
export const killerSudokuSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium"] as const,
    default: "easy" as const,
  },
} as const;

type KillerSudokuSettingsType = SettingsOf<typeof killerSudokuSettings>;

export const killerSudokuPlugin: GamePlugin<KillerSudokuState, KillerSudokuAction, typeof killerSudokuSettings> = {
  id: "killer-sudoku",
  title: "Killer Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sudoku with cage constraints — groups of cells must sum to a given total.",
  howToPlay: `Killer Sudoku combines classic Sudoku logic with arithmetic cage constraints. The 9×9 grid is divided into outlined "cages." Each cage shows a small number in its top-left corner — that is the required sum of all digits in that cage. Fill every cell with a digit 1–9 so that each row, each column, and each 3×3 box contains every digit exactly once (standard Sudoku rules), AND so that the digits in every cage sum to the cage's target number. Digits may NOT repeat within a cage, even if the standard Sudoku rules would allow it.

Click any cell to select it (it highlights blue), then click a digit button or press a key (1–9) to enter that number. Press 0, Backspace, or Delete to erase. Conflicting cells are highlighted in red — this catches both Sudoku duplicates and cage violations (repeats within a cage, or a fully filled cage that does not sum correctly).

Score: max(100, 1000 − moves × 5). Fewer moves earn a higher score. Tip: start with cages that have only one possible combination given their sum and size — for example, a 2-cell cage summing to 3 must be {1, 2}.`,
  settings: killerSudokuSettings,
  initialState: (seed: number, settings: KillerSudokuSettingsType) => initialState(seed, settings as unknown as KillerSudokuSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".killercrimescene-num", pulses: 3 }; },
  component: KillerSudokuGame,
};
