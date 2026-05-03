import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChessState, ChessAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Chess } from "./Chess.js";

export const chessSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium",
  },
  flipBoardForBlack: {
    kind: "boolean" as const,
    label: "Flip Board",
    default: false,
  },
} as const;

type ChessSettingsType = SettingsOf<typeof chessSettings>;

export const chessPlugin: GamePlugin<ChessState, ChessAction, typeof chessSettings> = {
  id: "chess",
  title: "Chess",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Standard chess with full rules: castling, en passant, promotion, check, checkmate, stalemate, 50-move rule, and 3-fold repetition.",
  howToPlay: `Chess is a two-player strategy game played on an 8×8 board. You play White; the bot plays Black. White always moves first. The goal is to checkmate the opponent's king — threaten it with capture so it cannot escape.

Pieces move as follows: the King moves one square in any direction; the Queen moves any number of squares diagonally, horizontally, or vertically; the Rook moves horizontally or vertically; the Bishop moves diagonally; the Knight moves in an L-shape (two squares in one direction, one perpendicular) and can jump over pieces; Pawns move forward one square (two from the starting row) and capture diagonally.

Special moves: Castling lets the king and rook switch positions when neither has moved and no pieces are between them, and the king does not pass through check. En passant lets a pawn capture an adjacent enemy pawn that just moved two squares. Promotion: a pawn reaching the far rank becomes a queen, rook, bishop, or knight of your choice.

The game ends in checkmate (win/loss), stalemate (draw), 50-move rule (draw when no pawn move or capture in 50 moves), or three-fold repetition (draw when the same position occurs three times).

Click a piece to select it, then click a highlighted square to move. Easy = depth 2, Medium = depth 3, Hard = depth 4.`,
  settings: chessSettings,
  initialState: (seed: number, settings: ChessSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".chess-promotion-btn", pulses: 3 }; },
  component: Chess,
};
