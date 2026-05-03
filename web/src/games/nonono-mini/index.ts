import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { NononoMiniState, NononoMiniAction, NononoMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NononoMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NononoMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const nononoMiniPlugin: GamePlugin<NononoMiniState, NononoMiniAction, typeof settings> = {
  id: "nonono-mini",
  title: "Nonono Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Diagonal-shading nonogram variant. Predict cell value from clues.",
  howToPlay: "Nonono is a Nonogram cousin where clues describe diagonal shading groups. Where classic Nonograms list horizontal-row and vertical-column groups, Nonono lists groups along the two diagonal directions (NE-SW and NW-SE).\n\nIn this mini version each puzzle shows a small grid with diagonal clues and some cells filled. The prompt asks which cell must be shaded next given the diagonal constraints.\n\nDiagonal clues read just like row/column clues: a clue of \"2 1\" along one diagonal means a group of 2 shaded cells, then a gap, then a group of 1. Where the diagonal hits boundaries, the diagonal length itself constrains possible groupings.\n\nSix puzzles per round, scoring 100 points each plus a 10-point time bonus per remaining second. Wrong picks reveal the right cell.\n\nNonono challenges your spatial reasoning along diagonals — most solvers never train this skill. Start with the longest diagonals (which carry the most clue information) and the shortest (which often have one or zero shaded cells). The grid quickly fills as you cross-reference both diagonal directions.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as NononoMiniSettings),
  reducer,
  isTerminal,
  
  hint: (state: NononoMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-nonono-mini-answer-0"]', pulses: 3 } : null,component: NononoMiniGame,
};
