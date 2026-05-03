import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LinesOfActionState, LinesOfActionAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LinesOfAction = /* @__PURE__ */ lazy(() => import("./LinesOfAction.js").then((mod) => ({ default: mod.LinesOfAction as unknown as React.ComponentType<unknown> })));
export const linesOfActionSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot", "hot-seat"] as const,
    default: "bot",
  },
} as const;

type LinesOfActionSettingsType = SettingsOf<typeof linesOfActionSettings>;

export const linesOfActionPlugin: GamePlugin<LinesOfActionState, LinesOfActionAction, typeof linesOfActionSettings> = {
  id: "lines-of-action",
  title: "Lines of Action",
  category: "board",
  players: { min: 1, max: 2, multiplayer: false },
  description: "Connect all your pieces into one group by moving along lines.",
  howToPlay: `Lines of Action (LOA) is a two-player strategy game. Black starts with 12 pieces on the top and bottom rows (columns 1–6); White starts with 12 pieces on the left and right columns (rows 1–6). You play as White.

A piece moves exactly as many squares as there are pieces (of either colour) on the same line of movement — horizontal, vertical, or diagonal. A piece may jump over friendly pieces but not enemy ones. Landing on an enemy square captures it.

The goal is to connect all your remaining pieces into one orthogonally or diagonally adjacent group. If you capture so many enemy pieces that the survivor is already unified, your opponent wins immediately on their next check.

Strategy: balance advancing your own cohesion with disrupting your opponent's group. Spreading your pieces forces long moves; clustering them allows short precise moves.

Click a white piece to select it, then click a green target square to move. Legal moves are shown automatically. The bot searches two moves ahead.`,
  settings: linesOfActionSettings,
  initialState: (seed: number, settings: LinesOfActionSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".loa-grid")) ? { selector: ".loa-grid", pulses: 3 } : null,
  component: LinesOfAction,
};
