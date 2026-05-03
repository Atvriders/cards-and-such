import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { DotsAndBoxesState, DotsAndBoxesAction, DotsAndBoxesSettings } from "./state.js";
import { initialState, reducer, isTerminal, getAllMoves, boxSides, hIdx, vIdx } from "./state.js";
const DotsAndBoxes = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DotsAndBoxes as unknown as React.ComponentType<unknown> })));
const settings = {
  boardSize: {
    kind: "enum" as const,
    label: "Dots per Side",
    options: ["3", "5", "7"] as const,
    default: "5" as const,
  },
} as const;

export const dotsAndBoxesPlugin: GamePlugin<DotsAndBoxesState, DotsAndBoxesAction, typeof settings> = {
  id: "dots-and-boxes",
  title: "Dots and Boxes",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connect dots with lines. Complete the 4th side of a box to score it and go again.",
  howToPlay: `Dots and Boxes is played on a grid of dots. Players take turns drawing a single line segment connecting two adjacent dots (horizontally or vertically). When you draw the fourth and final side of a 1×1 square box, you claim that box and immediately take another turn — you keep going until you draw a line that doesn't complete any box.

The game ends when all possible line segments have been drawn. The player who claimed more boxes wins. You play as Blue; the bot plays as Red.

Board size can be 3×3 dots (2×2 boxes, quick games), 5×5 dots (4×4 boxes, standard), or 7×7 dots (6×6 boxes, longer games). Click any undrawn edge between two dots to draw your line.

The bot uses a heuristic strategy. It will always take a free box if one is available (completing a fourth side). Otherwise, it tries to make safe moves — moves that don't leave a box with three sides drawn (which would gift you a capture next turn). When forced to give up a chain, it picks a random move.

Strategy tip: think several moves ahead. A "double cross" — sacrificing a short chain to preserve control of a longer chain — is a key advanced technique in Dots and Boxes.`,
  settings,
  initialState: (seed: number, s: DotsAndBoxesSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state: DotsAndBoxesState): HintTarget | null => {
    if (state.winner !== null) return null;
    if (state.turn !== 0) return null;
    const moves = getAllMoves(state);
    if (moves.length === 0) return null;

    // Helper: simulate edge & count boxes that would be completed.
    function completedCount(edge: "h" | "v", row: number, col: number): number {
      const newH = [...state.hEdges];
      const newV = [...state.vEdges];
      if (edge === "h") newH[hIdx(state, row, col)] = true;
      else newV[vIdx(state, row, col)] = true;
      const temp = { rows: state.rows, cols: state.cols, hEdges: newH, vEdges: newV };
      const cands: Array<[number, number]> = [];
      if (edge === "h") {
        if (row > 0) cands.push([row - 1, col]);
        if (row < state.rows) cands.push([row, col]);
      } else {
        if (col > 0) cands.push([row, col - 1]);
        if (col < state.cols) cands.push([row, col]);
      }
      let n = 0;
      for (const [br, bc] of cands) {
        if (br >= 0 && br < state.rows && bc >= 0 && bc < state.cols && boxSides(temp, br, bc) === 4) n++;
      }
      return n;
    }
    function createsThree(edge: "h" | "v", row: number, col: number): boolean {
      const newH = [...state.hEdges];
      const newV = [...state.vEdges];
      if (edge === "h") newH[hIdx(state, row, col)] = true;
      else newV[vIdx(state, row, col)] = true;
      const temp = { rows: state.rows, cols: state.cols, hEdges: newH, vEdges: newV };
      const cands: Array<[number, number]> = [];
      if (edge === "h") {
        if (row > 0) cands.push([row - 1, col]);
        if (row < state.rows) cands.push([row, col]);
      } else {
        if (col > 0) cands.push([row, col - 1]);
        if (col < state.cols) cands.push([row, col]);
      }
      return cands.some(([br, bc]) =>
        br >= 0 && br < state.rows && bc >= 0 && bc < state.cols && boxSides(temp, br, bc) === 3
      );
    }

    // 1. Box-completing move
    for (const m of moves) {
      if (completedCount(m.edge, m.row, m.col) > 0) {
        return { selector: `[data-testid="${m.edge}-${m.row}-${m.col}"]`, pulses: 3 };
      }
    }
    // 2. Safe move (does not give opp a 3-sided box)
    for (const m of moves) {
      if (!createsThree(m.edge, m.row, m.col)) {
        return { selector: `[data-testid="${m.edge}-${m.row}-${m.col}"]`, pulses: 3 };
      }
    }
    // 3. Forced — first move
    const m0 = moves[0]!;
    return { selector: `[data-testid="${m0.edge}-${m0.row}-${m0.col}"]`, pulses: 3 };
  },
  component: DotsAndBoxes,
};
