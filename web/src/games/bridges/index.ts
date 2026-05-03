import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BridgesState, BridgesAction, BridgesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Bridges = /* @__PURE__ */ lazy(() => import("./Bridges.js").then((mod) => ({ default: mod.Bridges as unknown as React.ComponentType<unknown> })));
export const bridgesSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

type BridgesSettingsType = SettingsOf<typeof bridgesSettings>;

export const bridgesPlugin: GamePlugin<BridgesState, BridgesAction, typeof bridgesSettings> = {
  id: "bridges",
  title: "Bridges",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connect numbered islands with bridges so each island's bridge count matches its number.",
  howToPlay: `Bridges (Hashiwokakero) is a Japanese logic puzzle played on a grid of numbered islands. Each island is a circle containing a number (1–8). Your goal is to draw bridges between islands so that every island's total bridge count equals its number.

Rules: bridges run horizontally or vertically between orthogonally aligned islands. A pair of islands may share at most two bridges (a double bridge). Bridges may not cross each other. When solved, all islands must form a single connected network — no isolated clusters.

To draw a bridge, drag from one island to another in the same row or column. The first drag creates one bridge; dragging the same pair again upgrades it to a double bridge; a third drag removes it entirely.

Strategy: islands showing 1 on the edge of the grid have only one neighbor — place their bridge immediately. Islands showing 8 must have two bridges to each of their four neighbors. Use these anchor points to propagate constraints outward. Avoid creating isolated sub-networks early — always leave a path for future bridges to reconnect.

The puzzle is solved when every island's bridge count is satisfied and the whole grid forms one connected component.`,
  settings: bridgesSettings,
  initialState: (seed: number, settings: BridgesSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-bridges-action"]', pulses: 3 }; },
  component: Bridges,
};
