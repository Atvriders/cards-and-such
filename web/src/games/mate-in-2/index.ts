import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Game as unknown as React.ComponentType<unknown> })));
export const mateIn2Plugin = {
  id: "mate-in-2",
  title: "Mate in Two",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "10 chess puzzles where you must find the two-move combination that forces checkmate.",
  howToPlay: `Mate in Two challenges you with 10 carefully crafted chess positions. You play White and must find a two-move sequence that guarantees checkmate regardless of how Black responds.

The puzzle works in phases: first you make White's key move, then the computer automatically plays the best Black reply, and finally you must deliver the final checkmate. If your first move is wrong, you can retry the position from the start.

Each puzzle features a different tactical theme: Anastasia's mate (rook + knight cornering), ladder mates with two rooks, smothered mate (knight delivers checkmate to a smothered king), back-rank combinations, and queen maneuvers that cut off escape squares.

To select a piece click it — green dots show legal destinations. Click a highlighted square to move. Think ahead: the key to these puzzles is finding a forcing first move that puts Black in a zugzwang or forced-reply situation, after which checkmate is inevitable. Good luck!`,
  settings: {} as const,
  initialState: () => initialState(),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".cp-btn", pulses: 3 }; },
  component: Game,
} as unknown as GamePlugin;
