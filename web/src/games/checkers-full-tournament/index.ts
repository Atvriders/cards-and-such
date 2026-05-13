import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CftState, CftAction } from "./state.js";
import { getLegalMoves, initialState, isTerminal, reducer } from "./state.js";

const CheckersFullTournamentGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.CheckersFullTournamentGame as unknown as React.ComponentType<unknown>,
  })),
);

export const checkersFullTournamentSettings = {
  botDepth: {
    kind: "enum" as const,
    label: "CPU Depth",
    options: ["2", "3", "4"] as const,
    default: "4",
  },
  ballotOpening: {
    kind: "boolean" as const,
    label: "3-Move Ballot Opening",
    default: true,
  },
  showLastMove: {
    kind: "boolean" as const,
    label: "Highlight Last Move",
    default: true,
  },
} as const;

type CftSettingsType = SettingsOf<typeof checkersFullTournamentSettings>;

export const checkersFullTournamentPlugin: GamePlugin<
  CftState,
  CftAction,
  typeof checkersFullTournamentSettings
> = {
  id: "checkers-full-tournament",
  title: "Checkers (Full Tournament)",
  category: "board",
  players: { min: 1, max: 2, multiplayer: false },
  description:
    "American Checkers Federation rules: 3-move opening ballot, 40-move draw rule, full clock.",
  howToPlay: `Tournament-rules American Checkers. You play Red (bottom); the CPU plays Black (top).

Rules implemented:
- 8×8 board, dark squares only, 12 pieces per side.
- Men move diagonally one square FORWARD. Kings move one square in any diagonal.
- JUMP-CAPTURES ARE MANDATORY: whenever any jump is available you must take one.
- MULTI-JUMP CHAINS: after a capture, if your moved piece can capture again it must.
- A man that reaches the back row is promoted to a King. (A man that crowns mid-jump stops; the chain ends.)
- 3-MOVE BALLOT OPENING: at the start, a ballot is drawn from a small list of standard ACF openings (Old Faithful, Single Corner, Bristol, Cross, Dyke, Switcher, Defiance, Souter, Edinburgh, Glasgow). The first three plies (Red, Black, Red) are auto-played from that ballot; you then take over from move 4.
- 40-MOVE DRAW RULE: if 40 plies pass with no capture AND no promotion, the game is drawn.
- WIN: opponent has zero pieces OR no legal moves on their turn.

CPU: alpha-beta minimax (default depth 4) with mobility + king-count + material heuristic. Lower the depth for a faster opponent.

Scoring (win only): 100 base + 10 per surviving red piece + 50 per surviving king. Losses and draws score 0.`,
  settings: checkersFullTournamentSettings,
  initialState: (seed: number, settings: CftSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: CftState): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.turn !== "red") return null;
    const moves = getLegalMoves(state.board, "red", state.mustContinueFrom);
    if (moves.length === 0) return null;
    // Prefer the move with the most captures; tie-break by advancing toward the back rank.
    let best = moves[0]!;
    let bestCaps = best.captures.length;
    let bestAdvance = -best.to.row; // smaller row = more advanced for red
    for (const m of moves) {
      const caps = m.captures.length;
      const adv = -m.to.row;
      if (caps > bestCaps || (caps === bestCaps && adv > bestAdvance)) {
        best = m;
        bestCaps = caps;
        bestAdvance = adv;
      }
    }
    return {
      selector: `[data-testid="cell-${best.from.row}-${best.from.col}"]`,
      pulses: 3,
    };
  },
  component: CheckersFullTournamentGame,
};
