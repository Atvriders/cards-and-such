import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const chessBackRankPlugin = {
  id: "chess-back-rank",
  title: "Back Rank",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "12 back-rank checkmate puzzles — exploit the enemy king trapped behind its own pawns.",
  howToPlay: `Back Rank is one of chess's most satisfying tactical themes. The back-rank mate occurs when a king is trapped on its starting rank (rank 1 for White, rank 8 for Black) by its own pawns, which have no escape squares. A rook or queen sliding along the back rank delivers instant checkmate.

In each of the 12 puzzles you play White. The Black king is stuck behind a wall of its own pawns on the eighth rank. Your rooks or queen need only find the right file to strike.

Look for open or semi-open files pointing at the Black king's back rank. A rook or queen can swoop in for checkmate in one move. Watch out for Black pieces defending the back rank — sometimes you need to capture a defender first.

This weakness is so common that experienced players always ensure their king has a "luft" (breathing room) — a pawn pushed one square to create an escape square. Once you recognize this pattern you will spot back-rank threats in your own games instantly.

Click a piece to select, then click a green dot to move. Good luck!`,
  settings: {} as const,
  initialState: () => initialState(),
  reducer,
  isTerminal,
  component: Game,
} as unknown as GamePlugin;
