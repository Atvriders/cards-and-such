import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Minichess4x4Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Minichess4x4Game as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const minichess4x4Plugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "minichess-4x4",
  title: "Minichess 4x4",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tiny 4x4 chess — capture the CPU king. Place pieces vs random CPU.",
  howToPlay: "Minichess 4x4 is the smallest serious chess variant, played on a 4x4 board with simplified piece movement. In this placement-style adaptation, both sides drop pieces onto the empty board over the course of the game rather than starting in formal opening positions.\n\nClick any empty cell to place a P piece. If you place adjacent (orthogonally or diagonally) to a C piece, you capture and remove it — simulating chess king-style threats. After your turn, the CPU places a C piece on a random empty cell, capturing any adjacent P pieces.\n\nGameplay continues for up to 12 moves or until the board fills. You earn 100 points for ending with more P pieces than C pieces, 25 for a tie, 0 for fewer P pieces, plus 5 points per surviving P piece. Despite the tiny board, the king-like adjacency captures create cascading threats — a corner placement is safer because it has fewer adjacent attackers, while center placements both threaten and are threatened by more squares. Play tight defensive lines.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".mc4-board")) ? { selector: ".mc4-board", pulses: 3 } : null,
  component: Minichess4x4Game,
};
