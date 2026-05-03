import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { GomokuTacticState, GomokuTacticAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GomokuTactic = /* @__PURE__ */ lazy(() => import("./GomokuTactic.js").then((mod) => ({ default: mod.GomokuTactic as unknown as React.ComponentType<unknown> })));
export const gomokuTacticPlugin = {
  id: "gomoku-tactic",
  title: "Gomoku Tactic",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fast 9×9 Five-in-a-Row with a blocking AI — build your line before White does!",
  howToPlay: `Gomoku Tactic is a quick version of the classic Five-in-a-Row game played on a compact 9×9 board. You play as Black and always move first. Your goal is to place five of your stones in an unbroken row — horizontally, vertically, or diagonally — before the AI (White) does the same.

Click any empty intersection to place a black stone. The AI responds immediately with a white stone. The game ends when either player achieves five consecutive same-coloured stones, or when the board is completely full (a draw).

The AI in Gomoku Tactic uses a straightforward blocking strategy: it will immediately take any winning move if one exists, and it will block your obvious threats. It also prefers the centre area of the board. This means you need to create multiple simultaneous threats (double-open threes or fours) that the AI cannot block in a single move.

A win scores 1000 points, a draw 300, and a loss 0. The 9×9 format keeps games brisk — perfect for quick tactical play before your opponent spots your plan!`,
  settings: {} as Record<string, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".gt-board")) ? { selector: ".gt-board", pulses: 3 } : null,
  component: GomokuTactic,
} as unknown as GamePlugin;
