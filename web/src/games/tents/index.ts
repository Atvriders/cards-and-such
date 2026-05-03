import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TentsState, TentsAction, TentsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Tents } from "./Game.js";

export const tentsSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["6", "8", "10"] as const,
    default: "6",
  },
} as const;

export const tentsPlugin: GamePlugin<TentsState, TentsAction, typeof tentsSettings> = {
  id: "tents",
  title: "Tents",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place tents beside trees so each tree has exactly one adjacent tent, no tents touch, and row/column counts match.",
  howToPlay: `Tents is a logic puzzle played on a grid that contains some trees (🌲). Numbers along the right side of each row and the bottom of each column tell you how many tents belong in that row or column.

Your goal is to place tents in empty cells following three rules: every tree must have exactly one tent placed in an orthogonally adjacent cell (up, down, left, or right); no two tents may touch each other — not even diagonally; and the tent count in every row and column must match the corresponding clue number.

Click an empty cell once to place a tent (⛺), click again to mark it with × (definitely not a tent), and click once more to clear it back to empty. Trees cannot be clicked. Use the Reset button to start over.

The numbers shown in green have the correct tent count for their row or column; red means you've placed too many. Tents marked × are just reminders for yourself — they don't count toward the solution. Only tents count.

Strategy tip: rows or columns with a clue of 0 can be immediately marked — no tents go there. Start with trees that have only one valid orthogonal neighbour, since that cell must contain the tent.`,
  settings: tentsSettings,
  initialState: (seed: number, settings: TentsSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-tents-action"]', pulses: 3 }; },
  component: Tents,
};
