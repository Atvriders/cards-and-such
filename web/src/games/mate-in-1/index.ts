import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Game as unknown as React.ComponentType<unknown> })));
export const mateIn1Plugin = {
  id: "mate-in-1",
  title: "Mate in One",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "12 hand-curated chess puzzles: find the single move that delivers checkmate.",
  howToPlay: `Mate in One presents you with 12 hand-selected chess positions. In each puzzle you play White and must find the single move that immediately checkmates the Black king.

Click a white piece to select it — legal destination squares light up in green. Click a highlighted square to make your move. If you choose the correct mating move, the board updates and a success message appears. If your move does not deliver checkmate, you'll see an error message and can click Try Again to reset the position and try once more.

Each puzzle tests a different mating pattern: back-rank mate, smothered mate, queen fork, rook on the back rank, and more. Study the position carefully before moving — look for undefended squares near the Black king, open files for rooks and queens, and knight jumps that cover escape routes.

Once you solve a puzzle, click Next Puzzle to advance to the following position. After clearing all 12 puzzles your game is complete. There is no time pressure — take as long as you need to find the winning move. Good luck!`,
  settings: {} as const,
  initialState: () => initialState(),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".cp-btn", pulses: 3 }; },
  component: Game,
} as unknown as GamePlugin;
