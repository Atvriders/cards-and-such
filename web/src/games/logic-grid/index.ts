import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LogicGridState, LogicGridAction, LogicGridSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LogicGrid = /* @__PURE__ */ lazy(() => import("./LogicGrid.js").then((mod) => ({ default: mod.LogicGrid as unknown as React.ComponentType<unknown> })));
export const logicGridSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

type LogicGridSettingsType = SettingsOf<typeof logicGridSettings>;

export const logicGridPlugin: GamePlugin<LogicGridState, LogicGridAction, typeof logicGridSettings> = {
  id: "logic-grid",
  title: "Logic Grid",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic 5×5 deduction puzzles — use clues to match each person to all their attributes.",
  howToPlay: `Logic Grid (also called Logic Puzzles or Einstein Puzzles) challenges you to match five people (or entities) to five sets of attributes using a series of clues. Each person has exactly one value from each attribute category, and no two people share a value.

The game displays a grid of cells — rows are the five people, and columns are grouped by attribute. Each cell represents whether a specific person has a specific attribute value. Click a cell once to mark it ✓ (yes), again for ✗ (no), and a third time to clear it.

Use the clues in the panel on the right to fill in what you know. For example, if a clue says "Alice has a Cat," mark Alice / Cat as ✓ and all other people / Cat cells as ✗. Also mark Alice's other pet cells as ✗ since each person has exactly one pet.

Work systematically — every confirmed ✓ unlocks several ✗ marks across the same row and column of that attribute group. Cross-reference clues to narrow down unknowns. The puzzle is solved when every cell is correctly marked ✓ or ✗, forming a unique valid assignment.

Start with the most specific clues (direct assignments) before tackling relational clues. The puzzle always has exactly one solution reachable through pure deduction.`,
  settings: logicGridSettings,
  initialState: (seed: number, settings: LogicGridSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-logic-grid-action"]', pulses: 3 }; },
  component: LogicGrid,
};
