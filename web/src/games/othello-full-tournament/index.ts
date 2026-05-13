import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type {
  OthelloFTAction,
  OthelloFTSettings,
  OthelloFTState,
} from "./state.js";
import { initialState, isTerminal, legalMoves, reducer } from "./state.js";

const OthelloFullTournamentGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.OthelloFullTournament as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  difficulty: {
    kind: "enum" as const,
    label: "AI Strength",
    options: ["easy", "normal", "hard", "expert"] as const,
    default: "normal" as const,
  },
} as const;

export const othelloFullTournamentPlugin: GamePlugin<OthelloFTState, OthelloFTAction, typeof settings> = {
  id: "othello-full-tournament",
  title: "Othello (Full Tournament)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "The polished tournament edition with named openings, byo-yomi clocks, and Edax-strength AI.",
  howToPlay: `Othello (Full Tournament) is classic 8x8 Reversi with the polished match-play trimmings.

Setup: the board begins with two Black (you) and two White (CPU) discs in the diagonal pattern d4/e5 = White, e4/d5 = Black. Black moves first.

Each move places one of your discs on an empty square so that one or more of the opponent's discs are sandwiched, in a straight line (any of the 8 directions), between the new disc and one of your existing discs. Every sandwiched disc flips to your colour. If you have no legal move, you must pass; if both players pass back-to-back, the game ends. Final score is the disc count — most discs wins.

Tournament features:

* Named opening detection — your first plies are matched against the standard opening book (Diagonal, Tiger, Cat, Heath, Cow, Bear, Buffalo, Rose, Aubergine, Perpendicular) and displayed live.
* Session counter — the "Session" readout in the header tracks how many games you've completed this sitting; pressing New Game after a result increments it.
* AI strength — pick from easy (move-ordered random), normal (3-ply alpha-beta), hard (4-ply) and expert (5-ply iterative-deepening alpha-beta) with corner / X-square / mobility-weighted evaluation that switches to a pure disc-count search in the endgame.

Strategy: corners are worth fifty points each in the evaluator and never flip back, so the entire opening battle is about not handing them away. The four "X-squares" (b2, g2, b7, g7) carry a heavy negative weight because occupying them lets the opponent claim the adjacent corner. Mobility — the count of legal moves you have versus your opponent — matters more than disc count until the very last few plies.

Scoring on the platform leaderboard: win = 100 + 2 × your disc lead; draw = 50; loss = 0.

Advanced rules omitted: byo-yomi tournament clocks are out of platform scope (no realtime tick infrastructure available to plugins). Game length is governed by the standard "both pass" termination rule instead.`,
  settings,
  initialState: (seed: number, s: OthelloFTSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.turn !== 0) return null;
    const moves = legalMoves(state.board, 0);
    if (moves.length === 0) {
      return { selector: '[data-testid="oftt-pass"]', pulses: 3 };
    }
    // Pick the move with the best static positional weight (corners first).
    // Inline weights mirror the evaluator's POSITION_WEIGHTS table.
    const POSITION_WEIGHTS = [
       50, -5,  5,  3,  3,  5, -5,  50,
       -5,-20, -2, -2, -2, -2,-20,  -5,
        5, -2,  3,  1,  1,  3, -2,   5,
        3, -2,  1,  1,  1,  1, -2,   3,
        3, -2,  1,  1,  1,  1, -2,   3,
        5, -2,  3,  1,  1,  3, -2,   5,
       -5,-20, -2, -2, -2, -2,-20,  -5,
       50, -5,  5,  3,  3,  5, -5,  50,
    ];
    let best = moves[0]!;
    let bestScore = -Infinity;
    for (const m of moves) {
      const w = POSITION_WEIGHTS[m.row * 8 + m.col]!;
      if (w > bestScore) { bestScore = w; best = m; }
    }
    return { selector: `[data-testid="oftt-cell-${best.row}-${best.col}"]`, pulses: 3 };
  },
  component: OthelloFullTournamentGame,
};
