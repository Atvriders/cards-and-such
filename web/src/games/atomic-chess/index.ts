import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AtomicState, AtomicAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AtomicChess } from "./AtomicChess.js";

export const atomicChessSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium",
  },
} as const;

type AtomicChessSettingsType = SettingsOf<typeof atomicChessSettings>;

export const atomicChessPlugin: GamePlugin<AtomicState, AtomicAction, typeof atomicChessSettings> = {
  id: "atomic-chess",
  title: "Atomic Chess",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Chess variant where captures trigger explosions, destroying all non-pawn pieces in a 3×3 radius.",
  howToPlay: `Atomic Chess is a thrilling chess variant where every capture triggers an explosion. When a piece captures another, both the capturing piece AND all non-pawn pieces on the 8 surrounding squares are instantly removed from the board. Pawns survive explosions (they're too small to catch fire!) unless directly captured.

The goal is to explode your opponent's king — blow it up with a capture nearby. Standard checkmate is replaced by king destruction. If a capture would destroy your own king in the blast, that move is illegal.

All standard chess piece movements apply: pawns, knights, bishops, rooks, queens, and kings move exactly as in regular chess. Castling, en passant, and pawn promotion are all possible (though promotion during a capture is moot, as the pawn explodes). You cannot make a non-capture move that leaves your king in check.

Strategy changes dramatically: avoid unnecessary exchanges, as losing a rook or queen to an explosion hurts. Sacrificial attacks near the opponent's king can be decisive — a knight leap near the king can wipe out multiple pieces. Pawns become precious since they survive explosions.

Click a piece to select it, then click a highlighted square to move. Explosions are shown with orange flashes. You play White; the bot plays Black. Easy = depth 2, Medium = depth 3, Hard = depth 4.`,
  settings: atomicChessSettings,
  initialState: (seed: number, settings: AtomicChessSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".atomic-promotion-btn", pulses: 3 }; },
  component: AtomicChess,
};
