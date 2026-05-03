import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const chessEndgameKqkPlugin = {
  id: "chess-endgame-kqk",
  title: "Queen vs King",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "12 Queen and King versus lone King puzzles — find the checkmate.",
  howToPlay: `Queen vs King is the most fundamental winning endgame in chess. With a queen and king against a lone king, checkmate is always achievable within a small number of moves if you apply the correct technique.

Each of the 12 puzzles gives you a King + Queen against lone Black King position. Your task is to find the single move that delivers checkmate.

Key principles for queen vs king: the queen alone can force the enemy king to the edge of the board, but mate requires the assistance of your own king to control escape squares. The queen delivers check while the king covers adjacent squares. Watch out for stalemate — if you put the enemy king in a position with no legal moves but not in check, it is a draw! Always verify your mating move is check.

Common mating patterns involve the queen on an edge or corner square with the attacking king two squares away. Click a white piece to select, click a green dot to move. Use Try Again if your move is wrong.`,
  settings: {} as const,
  initialState: () => initialState(),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".cp-btn", pulses: 3 }; },
  component: Game,
} as unknown as GamePlugin;
