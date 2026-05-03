import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const pawnPromotionPuzzlePlugin = {
  id: "pawn-promotion-puzzle",
  title: "Pawn Promotion Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "12 pawn promotion puzzles — advance a pawn to the eighth rank and choose your promotion piece.",
  howToPlay: `Pawn Promotion Puzzle focuses on one of chess's most exciting moments: queening a pawn. When a pawn reaches the far end of the board it transforms into any piece you choose — usually a queen for maximum power.

Each of the 12 puzzles presents a position where White has a pawn ready to promote. Your job is to advance the pawn (or capture diagonally onto the promotion square) and then select the right promotion piece. In most cases promoting to a queen is correct, but occasionally a rook, bishop, or knight promotion is needed — for example to avoid stalemate or because a knight promotion gives immediate checkmate.

Click the pawn to select it, then click the highlighted promotion square to move it. A promotion menu will appear — choose Queen, Rook, Bishop, or Knight. The puzzle evaluates both your destination square and your piece choice.

Helpful hint: always check whether a queen promotion causes stalemate (no legal moves for Black but not in check). If it does, try an underpromotion! Work through all 12 puzzles to practice this essential skill.`,
  settings: {} as const,
  initialState: () => initialState(),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".cp-board")) ? { selector: ".cp-board", pulses: 3 } : null,
  component: Game,
} as unknown as GamePlugin;
