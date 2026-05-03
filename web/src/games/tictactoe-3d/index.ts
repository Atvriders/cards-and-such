import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type TTT3DState, type TTT3DAction } from "./state.js";
const TicTacToe3D = /* @__PURE__ */ lazy(() => import("./TicTacToe3D.js").then((mod) => ({ default: mod.TicTacToe3D as unknown as React.ComponentType<unknown> })));
export const ttt3dSettings = {
  botStrength: { kind: "enum" as const, label: "Bot Strength", options: ["easy", "hard"] as const, default: "hard" as const },
} as const;

export const ticTacToe3DPlugin: GamePlugin<TTT3DState, TTT3DAction, typeof ttt3dSettings> = {
  id: "tictactoe-3d",
  title: "3D Tic-Tac-Toe",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-dimensional tic-tac-toe on a 4×4×4 cube. Watch for lines through layers.",
  howToPlay: `3D Tic-Tac-Toe expands the classic game onto a 4×4×4 cube. You play as X, the bot plays as O. The first to place four of their marks in a straight line — in any direction — wins.

The board is displayed as four layers side by side. Each layer is a 4×4 grid. Click any empty cell to place your X. The bot responds immediately.

Lines can run in any of these directions:
• Horizontally within a layer (a row)
• Vertically within a layer (a column)
• Diagonally within a layer
• Straight through the layers (same row and column, different layers)
• Diagonally across layers (moving through layers and shifting row or column each step)
• Space diagonals (moving through all four dimensions simultaneously)

There are 76 winning lines in total. The bot uses minimax with threat detection to make strong plays. On Hard difficulty it searches 3 moves deep and prioritizes blocking your threats.

Tips: the center cells have the most lines running through them — contest the center early. Watch for bot threats across layers that can be easy to miss visually.`,
  settings: ttt3dSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".ttt3d-grid")) ? { selector: ".ttt3d-grid", pulses: 3 } : null,
  component: TicTacToe3D,
};
