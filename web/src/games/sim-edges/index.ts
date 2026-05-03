import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SimEdgesGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SimEdgesGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const simEdgesPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "sim-edges",
  title: "Sim",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw edges between dots; first to form a mono-color triangle LOSES. Edge vs random CPU.",
  howToPlay: "Sim is a graph-theory pencil-and-paper game where two players take turns drawing edges between 6 dots arranged in a circle. The first player to complete a triangle of their own color (where all three edges connect the same vertex set) LOSES. By Ramsey theory, no draws are possible — every complete K6 graph contains a monochromatic triangle. In this 5x5 grid adaptation, the edge-drawing concept becomes cell-claiming with triangle-trio detection.\n\nClick any empty cell to claim it as P. Triangle-trios are predefined cell triples; if claiming the cell completes a P-trio, you LOSE immediately. After your turn, a random CPU claims a random empty cell as C; if it completes a C-trio, the CPU loses.\n\nGameplay continues for up to 16 moves or until one side completes a forbidden trio. You earn 100 points if the CPU completes a trio first, 25 for a board-full draw, 0 if you slip up, plus 4 bonus per surviving safe move. The Ramsey-theoretic guarantee means every game ends with a loser — strategic avoidance is the entire skill.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".sim-board")) ? { selector: ".sim-board", pulses: 3 } : null,
  component: SimEdgesGame,
};
