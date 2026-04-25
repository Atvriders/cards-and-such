import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Chess960State, Chess960Action } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Chess960Game } from "./Game.js";

export const chess960Settings = {
  opponent: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium",
  },
} as const;

type Chess960SettingsType = SettingsOf<typeof chess960Settings>;

export const chess960Plugin: GamePlugin<Chess960State, Chess960Action, typeof chess960Settings> = {
  id: "chess960",
  title: "Chess960",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fischer Random Chess: standard rules but with a randomized back rank for each game, preventing opening memorization.",
  howToPlay: `Chess960 (also called Fischer Random Chess) plays exactly like standard chess — same pieces, same moves, same checkmate objective — but with one twist: the back rank is randomly shuffled at the start of each game. Constraints ensure bishops always start on opposite-colored squares, and the king begins between the two rooks (enabling castling).

All standard chess rules apply: pawns move forward and capture diagonally, knights leap in L-shapes, bishops slide diagonally, rooks slide in straight lines, queens combine both, and kings step one square. En passant and pawn promotion work as normal.

Castling is still legal: the king always moves to the g-file (kingside) or c-file (queenside), and the rook moves to f (kingside) or d (queenside), regardless of their starting positions. No pieces may be in the way, and the king may not pass through check.

The key appeal of Chess960 is that it eliminates prepared opening theory — every game demands creative play from move one. The 960 possible starting positions each create a fresh strategic landscape.

Click a piece to select it, then click a highlighted square to move. You play White; the bot plays Black. Easy = depth 2, Medium = depth 3, Hard = depth 4.`,
  settings: chess960Settings,
  initialState: (seed: number, settings: Chess960SettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Chess960Game,
};
