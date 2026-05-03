import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StitchState, StitchAction, StitchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Stitches = /* @__PURE__ */ lazy(() => import("./Stitches.js").then((mod) => ({ default: mod.Stitches as unknown as React.ComponentType<unknown> })));
export const stitchesSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium"] as const,
    default: "easy",
  },
} as const;

type StitchSettingsType = SettingsOf<typeof stitchesSettings>;

export const stitchesPlugin: GamePlugin<StitchState, StitchAction, typeof stitchesSettings> = {
  id: "stitches",
  title: "Stitches",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connect colored regions with exactly the right number of stitches per row and column.",
  howToPlay: `Stitches is a logic puzzle played on a grid divided into colored regions. Your task is to place "stitches" — connections between pairs of orthogonally adjacent cells that belong to different regions — so that every row and every column contains exactly as many stitch endpoints as its clue number specifies.

Each stitch always connects exactly two cells in adjacent, different regions. It contributes one stitch endpoint to each cell's row and column. A single stitch therefore adds one to two row clue counts (same row) or two column clue counts (same column) depending on whether it is horizontal or vertical.

To play: click a cell that sits on a boundary between two different regions to toggle a stitch along that boundary. Active stitches appear as red connectors between cells. Row and column clue numbers turn green when their count is satisfied.

Important constraint: the number of stitches per region pair is not restricted — what matters is that each row and column total matches its clue.

Strategy: rows or columns with clue 0 must have no stitches at all; eliminate all boundary candidates there first. Then look for rows or columns whose clue tightly constrains which region borders must carry a stitch. Work from the most constrained lines outward, cross-checking row and column totals as you go.`,
  settings: stitchesSettings,
  initialState: (seed: number, settings: StitchSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-stitches-action"]', pulses: 3 }; },
  component: Stitches,
};
