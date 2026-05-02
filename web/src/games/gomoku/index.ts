import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { GomokuState, GomokuAction, GomokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Gomoku } from "./Game.js";

const settings = {
  boardSize: {
    kind: "enum" as const,
    label: "Board Size",
    options: ["9", "13", "15"] as const,
    default: "15" as const,
  },
} as const;

export const gomokuPlugin: GamePlugin<GomokuState, GomokuAction, typeof settings> = {
  id: "gomoku",
  title: "Gomoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place stones until one player has five in a row. Classic Go-board alternative.",
  howToPlay: `Gomoku (Five in a Row) is a strategy board game played on a grid of intersections. You play as Black and always go first; the bot plays as White. The goal is to place five of your stones in an unbroken row — horizontally, vertically, or diagonally — before your opponent does.

Click any empty intersection to place a Black stone. The bot immediately responds with a White stone. Continue alternating until one player achieves five in a row or the board fills completely (draw). The winning five-stone line is highlighted in gold when the game ends.

Board size can be set to 9×9 (small, fast games), 13×13 (medium), or 15×15 (standard, recommended). On larger boards there are far more possible lines, giving the game much greater depth than Tic-Tac-Toe.

The bot uses minimax search at depth 3 with alpha-beta pruning. It evaluates positions based on open-ended sequences of 2, 3, and 4 stones, and slightly prioritizes blocking your threats over building its own. Candidates are restricted to cells within 2 squares of existing stones.

Strategy tip: build threats in multiple directions simultaneously. A double-open three (three in a row with both ends open) is nearly impossible to block and often leads to a forced win.`,
  settings,
  initialState: (seed: number, s: GomokuSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state: GomokuState): HintTarget | null => {
    if (state.winner !== null) return null;
    if (state.turn !== "B") return null;
    const grid = state.grid;
    const size = grid.rows;
    const dirs: ReadonlyArray<readonly [number, number]> = [[0, 1], [1, 0], [1, 1], [1, -1]];

    // Count consecutive same-stones in a direction starting from a cell that
    // we have just placed. Returns total run length (incl. center) and open-end count.
    function evaluatePlacement(r: number, c: number, stone: "B" | "W"): { maxRun: number; openEnds: number } {
      let bestRun = 1;
      let bestOpens = 0;
      for (const [dr, dc] of dirs) {
        let run = 1;
        let opens = 0;
        // forward
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < size && nc >= 0 && nc < size && grid.get({ row: nr, col: nc }) === stone) {
          run++;
          nr += dr; nc += dc;
        }
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid.get({ row: nr, col: nc }) === null) opens++;
        // backward
        nr = r - dr; nc = c - dc;
        while (nr >= 0 && nr < size && nc >= 0 && nc < size && grid.get({ row: nr, col: nc }) === stone) {
          run++;
          nr -= dr; nc -= dc;
        }
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid.get({ row: nr, col: nc }) === null) opens++;

        if (run > bestRun || (run === bestRun && opens > bestOpens)) {
          bestRun = run;
          bestOpens = opens;
        }
      }
      return { maxRun: bestRun, openEnds: bestOpens };
    }

    const empties: Array<{ row: number; col: number }> = [];
    for (const c of grid.coords()) {
      if (grid.get(c) === null) empties.push({ row: c.row, col: c.col });
    }
    if (empties.length === 0) return null;

    // 1. Win move (creates 5 in a row)
    for (const e of empties) {
      const { maxRun } = evaluatePlacement(e.row, e.col, "B");
      if (maxRun >= 5) return { selector: `[data-testid="gomoku-${e.row}-${e.col}"]`, pulses: 3 };
    }
    // 2. Block opponent win
    for (const e of empties) {
      const { maxRun } = evaluatePlacement(e.row, e.col, "W");
      if (maxRun >= 5) return { selector: `[data-testid="gomoku-${e.row}-${e.col}"]`, pulses: 3 };
    }
    // 3. Make own open-3
    for (const e of empties) {
      const { maxRun, openEnds } = evaluatePlacement(e.row, e.col, "B");
      if (maxRun >= 3 && openEnds >= 2) return { selector: `[data-testid="gomoku-${e.row}-${e.col}"]`, pulses: 3 };
    }
    // 4. Block opponent open-3
    for (const e of empties) {
      const { maxRun, openEnds } = evaluatePlacement(e.row, e.col, "W");
      if (maxRun >= 3 && openEnds >= 2) return { selector: `[data-testid="gomoku-${e.row}-${e.col}"]`, pulses: 3 };
    }
    // 5. Default: center
    const center = Math.floor(size / 2);
    if (grid.get({ row: center, col: center }) === null) {
      return { selector: `[data-testid="gomoku-${center}-${center}"]`, pulses: 3 };
    }
    const e0 = empties[0]!;
    return { selector: `[data-testid="gomoku-${e0.row}-${e0.col}"]`, pulses: 3 };
  },
  component: Gomoku,
};
