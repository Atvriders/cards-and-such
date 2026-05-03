import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KropkiState, KropkiAction, KropkiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Kropki } from "./Kropki.js";

export const kropkiSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

type KropkiSettingsType = SettingsOf<typeof kropkiSettings>;

export const kropkiPlugin: GamePlugin<KropkiState, KropkiAction, typeof kropkiSettings> = {
  id: "kropki",
  title: "Kropki",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill a Latin square — white dots mean adjacent cells differ by 1, black dots mean 2:1 ratio.",
  howToPlay: `Kropki is a Latin square puzzle with extra dot constraints. Your goal is to fill an N×N grid so that each row and each column contains each number from 1 to N exactly once — just like Sudoku without boxes.

Two types of dots appear between adjacent cells. A white dot between two cells means their values differ by exactly 1 (e.g., 2 and 3, or 4 and 5). A black dot means one value is exactly double the other (e.g., 2 and 4, or 1 and 2). When no dot appears between two adjacent cells, neither constraint applies — the values do not differ by 1 and are not in a 2:1 ratio.

Click any unfilled cell to cycle through values 1 to N, then back to empty. Blue-highlighted cells are pre-filled givens that cannot be changed. Red cells have a conflict (duplicate in row or column).

Strategy: dots on the border of the grid are very constraining — only a few number pairs satisfy each dot rule. Start with clusters of dots, especially chains. The 1-2 pair satisfies both a white dot (diff=1) and a black dot (2:1), so distinguish carefully. Work through rows and columns as you would in a Latin square, cross-referencing the dot constraints to eliminate candidates.`,
  settings: kropkiSettings,
  initialState: (seed: number, settings: KropkiSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-kropki-action"]', pulses: 3 }; },
  component: Kropki,
};
