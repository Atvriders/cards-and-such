import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import {
  COLS,
  dropRow,
  findWinningLine,
  initialState,
  isTerminal,
  reducer,
  type CFFAction,
  type CFFSettings,
  type CFFState,
  type Difficulty,
} from "./state.js";

const ConnectFourFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((m) => ({
    default: m.ConnectFourFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  difficulty: {
    kind: "enum" as const,
    label: "CPU Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type Schema = typeof settings;
type Resolved = { difficulty: Difficulty };

export const connectFourFullPlugin: GamePlugin<CFFState, CFFAction, Schema> = {
  id: "connect-four-full",
  title: "Connect Four (Tournament)",
  category: "board",
  players: { min: 1, max: 2, multiplayer: false },
  description:
    "Drop discs to align four; play vs. a solved-game AI that scales from 'lets you win' to unbeatable.",
  howToPlay: `Connect Four — tournament edition. The board is 7 columns by 6 rows. On each turn you drop a Red disc into any non-full column; it falls to the lowest empty row. The CPU plays Yellow.
The first player to align four discs of their colour — horizontally, vertically, or on either diagonal — wins. If the board fills with no winner, the result is a draw.

CPU difficulty:
  • Easy — half-random play with occasional blocking; great for learning.
  • Medium — full minimax search to depth 5 with alpha-beta pruning, center-column move ordering, and a transposition table.
  • Hard — minimax search to depth 7 with the same enhancements; expects to punish every weak move you make.

Scoring rewards faster wins. Base 100 plus a speed bonus that decays with each move played past the minimum (7). A difficulty multiplier is applied: medium ×1.2, hard ×1.5. Draws score a smaller value on medium/hard; losses score 0.

Tip: control the centre column — it sits on more 4-in-a-row lines than any other column.`,
  settings,
  initialState: (seed: number, s: Resolved) =>
    initialState(seed, s as CFFSettings),
  reducer: (state: CFFState, action: CFFAction) => reducer(state, action),
  isTerminal,
  hint: (state: CFFState): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.phase !== "playing" || state.turn !== 0) return null;
    // 1) Winning move for human.
    for (let c = 0; c < COLS; c++) {
      const r = dropRow(state.board, c);
      if (r < 0) continue;
      const probe = state.board.slice();
      probe[r * COLS + c] = 0;
      if (findWinningLine(probe, r, c)) {
        return { selector: `[data-testid="cff-drop-${c}"]`, pulses: 3 };
      }
    }
    // 2) Block CPU win.
    for (let c = 0; c < COLS; c++) {
      const r = dropRow(state.board, c);
      if (r < 0) continue;
      const probe = state.board.slice();
      probe[r * COLS + c] = 1;
      if (findWinningLine(probe, r, c)) {
        return { selector: `[data-testid="cff-drop-${c}"]`, pulses: 3 };
      }
    }
    // 3) Prefer center column.
    const center = Math.floor(COLS / 2);
    const order: number[] = [center];
    for (let off = 1; off <= center; off++) {
      if (center - off >= 0) order.push(center - off);
      if (center + off < COLS) order.push(center + off);
    }
    for (const c of order) {
      if (dropRow(state.board, c) >= 0) {
        return { selector: `[data-testid="cff-drop-${c}"]`, pulses: 3 };
      }
    }
    return null;
  },
  component: ConnectFourFullGame,
};
