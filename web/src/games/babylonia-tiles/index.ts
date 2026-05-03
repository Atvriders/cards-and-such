import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { BabyloniaTilesState, BabyloniaTilesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BabyloniaTiles = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BabyloniaTiles as unknown as React.ComponentType<unknown> })));
const settings = {
  mode: { kind: "enum" as const, label: "Mode", options: ["easy"] as const, default: "easy" as const },
} as const;

export const babyloniaTilesPlugin: GamePlugin<BabyloniaTilesState, BabyloniaTilesAction, typeof settings> = {
  id: "babylonia-tiles",
  title: "Babylonia Tiles",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place tiles to score cities and ziggurats.",
  howToPlay: "Babylonia Tiles is a quick abstract board game on a 3x3 grid against a simple CPU opponent. Place tiles to score cities and ziggurats. You and the CPU alternate placing tiles on empty cells.\n\nSpecial rule: 3x3 grid; each tile placed adjacent to existing scores 1; unique columns score 2.\n\nClick any empty cell to place your tile (X). The CPU then immediately places its tile (O) on a random empty cell. Continue until all 9 cells are filled. The board is then scored by the variant's rule — typically counting matching neighbours, completed rows, or set adjacencies.\n\nYour final score is your tile count plus any bonus from completed lines. The CPU's score is calculated the same way and shown for comparison. Beat the CPU to claim victory; tie if scores match.\n\nThe CPU is intentionally simple (random placement) to keep games quick — winning is achievable with a bit of pattern thinking. Strategy is in placing tiles where they form maximum adjacency bonuses while denying the CPU lines. A perfect 30-second abstract round, fully deterministic when seeded.",
  settings,
  initialState: (seed, _s) => initialState(seed, { mode: "easy" }),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".g-grid")) ? { selector: ".g-grid", pulses: 3 } : null,
  component: BabyloniaTiles,
};
