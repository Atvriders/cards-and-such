import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PegSolitairePlusState, PegSolitairePlusAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PegSolitairePlusGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PegSolitairePlusGame as unknown as React.ComponentType<unknown> })));
const pegSolitairePlusSettings = {
  variant: {
    kind: "enum" as const,
    label: "Board shape",
    options: ["diamond", "plus"] as const,
    default: "diamond" as const,
  },
} as const;

type S = SettingsOf<typeof pegSolitairePlusSettings>;

export const pegSolitairePlusPlugin: GamePlugin<PegSolitairePlusState, PegSolitairePlusAction, typeof pegSolitairePlusSettings> = {
  id: "peg-solitaire-plus",
  title: "Peg Solitaire",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic peg-jumping puzzle — leave exactly one peg on the board.",
  howToPlay: `Peg Solitaire is a classic solo puzzle. The board starts filled with pegs and one empty hole in the centre. Your goal is to remove pegs until only one remains.

A move consists of selecting a peg, then jumping it over an adjacent peg into the hole directly beyond — that jumped-over peg is then removed. Jumps can only be made horizontally or vertically, not diagonally, and you must jump over exactly one peg into an immediately empty hole.

Click a peg to select it (it glows orange). Then click a valid destination hole two steps away. If no valid destination exists for the selected peg, click another peg to reselect. The game ends when you leave exactly one peg (you win, scoring 1000) or when no legal moves remain with more than one peg left.

Two board shapes are available: Diamond arranges pegs in a rotated square pattern (41 pegs); Plus uses a thick cross shape (21 pegs). Both start with the centre hole empty.

Score: a perfect solve scores 1000. If you get stuck, score is based on how few pegs remain. Finishing with 2 pegs scores 100; more pegs score less.

Tip: Work inward from the edges. Avoid leaving isolated pegs in corners — they cannot be jumped and will end the game prematurely.`,
  settings: pegSolitairePlusSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  hint: (state: PegSolitairePlusState): HintTarget | null => {
    if (state.won || state.stuck) return null;
    const { board, boardSize } = state;
    for (let i = 0; i < board.length; i++) {
      if (board[i] !== 1) continue;
      const r = Math.floor(i / boardSize), c = i % boardSize;
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]) {
        const mr = r + dr, mc = c + dc;
        const er = r + 2*dr, ec = c + 2*dc;
        if (mr < 0 || mr >= boardSize || mc < 0 || mc >= boardSize) continue;
        if (er < 0 || er >= boardSize || ec < 0 || ec >= boardSize) continue;
        const midIdx = mr * boardSize + mc;
        const endIdx = er * boardSize + ec;
        if (board[midIdx] === 1 && board[endIdx] === 2) {
          return { selector: `[data-testid="hint-target-peg-solitaire-plus-${i}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  reducer,
  isTerminal,
  component: PegSolitairePlusGame,
};
