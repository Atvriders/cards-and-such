import { lazy } from "react";
import type * as React from "react";
import type {
  GamePlugin,
  SettingsOf,
} from "../../platform/game-plugin/types.js";
import type {
  ChessFullClockState,
  ChessFullClockAction,
} from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const ChessFullClock = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.ChessFullClock as unknown as React.ComponentType<unknown>,
  })),
);

export const chessFullClockSettings = {
  timeControl: {
    kind: "enum" as const,
    label: "Time Control",
    options: ["blitz-5", "rapid-15", "classical-30"] as const,
    default: "rapid-15",
  },
  flipBoardForBlack: {
    kind: "boolean" as const,
    label: "Flip Board",
    default: false,
  },
} as const;

type ChessFullClockSettingsType = SettingsOf<typeof chessFullClockSettings>;

export const chessFullClockPlugin: GamePlugin<
  ChessFullClockState,
  ChessFullClockAction,
  typeof chessFullClockSettings
> = {
  id: "chess-full-clock",
  title: "Chess (Full FIDE w/ Clock)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Tournament-grade FIDE chess: time controls (rapid/blitz/classical), draw offers, PGN history, Stockfish ladder.",
  howToPlay: `Full FIDE-rule chess with a clock. Pick your time control before the game starts (Blitz 5 min, Rapid 15 min, or Classical 30 min per side).

You play White; the CPU plays Black. White moves first. Click a piece, then click a highlighted destination square to move. The bot uses an alpha-beta minimax search at depth 4 with piece-square tables, mobility evaluation, and king-safety heuristics — strong enough to punish blunders.

All standard FIDE rules are in force: castling (kingside + queenside, with the king-not-in-check, doesn't-pass-through-check, doesn't-land-in-check, and neither-piece-moved checks), en passant (one-move window after a pawn double-step), pawn promotion (you choose Queen / Rook / Bishop / Knight), the 50-move rule, threefold-repetition draws, insufficient-material draws (K vs K, K+B/N vs K, K+B vs K+B same color), check, checkmate, and stalemate.

A side that runs out of clock time loses on time. You can offer the bot a draw or resign via the buttons under the board. The full game is logged in standard algebraic notation (SAN) and shown beside the board as a running PGN move list.`,
  settings: chessFullClockSettings,
  initialState: (seed: number, settings: ChessFullClockSettingsType) =>
    initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s) => {
    const st = s as ChessFullClockState;
    if (isTerminal(st)) return null;
    if (st.promotionPending)
      return { selector: ".cfc-promotion-btn", pulses: 3 };
    return { selector: ".cfc-square", pulses: 3 };
  },
  component: ChessFullClock,
};
