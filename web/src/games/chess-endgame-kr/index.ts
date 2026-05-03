import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Game as unknown as React.ComponentType<unknown> })));
export const chessEndgameKrPlugin = {
  id: "chess-endgame-kr",
  title: "Rook Endgame",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "12 King and Rook vs King endgame puzzles — find the mating move.",
  howToPlay: `Rook Endgame teaches you the most common fundamental endgame: King and Rook versus lone King. This ending arises frequently in real games and every player must know how to convert it.

Each of the 12 puzzles presents a King + Rook vs King position. You play White and must find the single best move — usually the mating blow or the decisive rook placement.

The key principles for this endgame: use your king actively to support the rook and cut off the enemy king. Force the enemy king toward the edge of the board. The rook delivers check along a rank or file while your king controls escape squares. The final mating position typically has the rook on the back rank while your king stands on the sixth rank to block escape.

Click a white piece (king or rook) to select it, then click a highlighted square to move. If you choose wrong, press Try Again to reset the position. Progress through all 12 positions to master rook endgame technique!`,
  settings: {} as const,
  initialState: () => initialState(),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".cp-btn", pulses: 3 }; },
  component: Game,
} as unknown as GamePlugin;
