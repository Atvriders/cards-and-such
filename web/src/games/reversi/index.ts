import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReversiState, ReversiAction } from "./state.js";
import { initialState, reducer, isTerminal, legalMoves, flipsFor } from "./state.js";
const Reversi = /* @__PURE__ */ lazy(() => import("./Reversi.js").then((mod) => ({ default: mod.Reversi as unknown as React.ComponentType<unknown> })));
export const reversiSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bot",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type ReversiSettingsType = SettingsOf<typeof reversiSettings>;

export const reversiPlugin: GamePlugin<ReversiState, ReversiAction, typeof reversiSettings> = {
  id: "reversi",
  title: "Reversi",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flank opponent discs to flip them. Most discs wins.",
  howToPlay: `Finish the game with more discs on the 8×8 board than your opponent. You play as Black (seat 0) and always move first; the bot plays as White.

Click any highlighted empty cell to place your disc there. A move is only legal if it flanks at least one straight line of opponent discs — horizontally, vertically, or diagonally — with your own disc on both ends. All flanked discs flip to your colour immediately. The bot responds automatically after each of your moves. If you have no legal move you must pass (a Pass button appears); if neither player has a legal move the game ends. The game also ends when the board is full. The player with more discs at the end wins.

Bot difficulty: Easy plays randomly; Medium uses minimax at depth 3 with a disc-count and corners heuristic; Hard uses minimax at depth 5 with enhanced corner and mobility weighting.

Scoring: win = 100 + (your discs − opponent discs) × 5; draw = 50; loss = max(0, your discs − 10).

Tips: corners are extremely valuable — once taken they can never be flipped. Avoid placing next to an empty corner as it hands the bot an easy corner grab.`,
  settings: reversiSettings,
  initialState: (seed: number, settings: ReversiSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: ReversiState): HintTarget | null => {
    if (state.winner !== null) return null;
    if (state.turn !== 0) return null;
    const legal = legalMoves(state.grid, 0);
    if (legal.length === 0) return null;
    const CORNERS: ReadonlyArray<readonly [number, number]> = [
      [0, 0], [0, 7], [7, 0], [7, 7],
    ];
    // Prefer a corner if legal
    for (const [r, c] of CORNERS) {
      if (legal.some((m) => m.row === r && m.col === c)) {
        return { selector: `[data-testid="cell-${r}-${c}"]`, pulses: 3 };
      }
    }
    // Otherwise pick the move that flips most discs
    let best = legal[0]!;
    let bestFlips = -1;
    for (const m of legal) {
      const flips = flipsFor(state.grid, 0, m.row, m.col).length;
      if (flips > bestFlips) {
        bestFlips = flips;
        best = m;
      }
    }
    return { selector: `[data-testid="cell-${best.row}-${best.col}"]`, pulses: 3 };
  },
  component: Reversi,
};
