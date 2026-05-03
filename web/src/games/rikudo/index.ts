import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RikudoState, RikudoAction, RikudoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Rikudo } from "./Rikudo.js";

export const rikudoSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium"] as const,
    default: "easy",
  },
} as const;

type RikudoSettingsType = SettingsOf<typeof rikudoSettings>;

export const rikudoPlugin: GamePlugin<RikudoState, RikudoAction, typeof rikudoSettings> = {
  id: "rikudo",
  title: "Rikudo",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill a grid with 1–N so every pair of consecutive numbers occupies adjacent cells.",
  howToPlay: `Rikudo is a number-path logic puzzle played on a rectangular grid. Your goal is to place every integer from 1 to N (where N equals the total number of cells) so that consecutive numbers always sit in orthogonally adjacent cells — up, down, left, or right. When you are done, the numbers trace a single continuous path that visits every cell exactly once.

Some cells are pre-filled as clues (shown in blue). These anchor the path and cannot be changed. Your job is to deduce where the remaining numbers belong.

To play: click an empty cell to select it (it turns yellow), then press a number button below the grid to enter your guess. Click "Clear" to erase a wrong entry. Cells shown in red are in conflict — either a number appears twice or two consecutive numbers are not touching. Fix all red cells to solve the puzzle.

Strategy: follow the forced moves first. If only one empty neighbor is available for the next consecutive number, you must place it there. Clue numbers near corners or edges dramatically limit where the path can go — use them to anchor your reasoning. Work forward from 1 and backward from N simultaneously, meeting in the middle.`,
  settings: rikudoSettings,
  initialState: (seed: number, settings: RikudoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-rikudo-action"]', pulses: 3 }; },
  component: Rikudo,
};
