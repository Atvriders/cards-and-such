import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SuicideState, SuicideAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SuicideChess } from "./SuicideChess.js";

export const suicideChessSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium",
  },
} as const;

type SuicideChessSettingsType = SettingsOf<typeof suicideChessSettings>;

export const suicideChessPlugin: GamePlugin<SuicideState, SuicideAction, typeof suicideChessSettings> = {
  id: "suicide-chess",
  title: "Suicide Chess",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Antichess: captures are mandatory, and the goal is to LOSE all your pieces first. The king is just a normal piece.",
  howToPlay: `Suicide Chess (also called Antichess or Losing Chess) flips the objective of standard chess: your goal is to lose all your pieces, or be left with no legal moves (stalemate). The first player to have no pieces remaining wins!

The most important rule: if you can capture an opponent's piece, you MUST do so. Captures are mandatory. If multiple captures are available, you may choose which one to take. Squares highlighted in red indicate pieces that have mandatory captures available.

Piece movement follows standard chess rules (pawns, knights, bishops, rooks, queens move the same way), with two key differences: there is no check or checkmate — the king is just another piece you want to lose — and there is no castling.

Pawns still promote when they reach the far rank; choose any piece (picking a weaker piece can be strategically superior since you want to lose it).

Strategy: try to force your opponent to capture your pieces by offering chains of exchanges. Avoid moves that protect your pieces. Sacrifice aggressively — giving up your queen or other powerful pieces can be a winning tactic.

You play White; the bot plays Black. Easy = depth 2, Medium = depth 3, Hard = depth 4.`,
  settings: suicideChessSettings,
  initialState: (seed: number, settings: SuicideChessSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: SuicideChess,
};
