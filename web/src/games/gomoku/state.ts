import { Grid, findWinningLine } from "../../engines/grid/index.js";
import { minimax } from "../../engines/grid/minimax.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { Coord } from "../../engines/grid/index.js";

export type Cell = "B" | "W" | null; // Black = player, White = bot

export interface GomokuSettings {
  boardSize: "9" | "13" | "15";
}

export interface GomokuState {
  settings: GomokuSettings;
  grid: Grid<Cell>;
  turn: "B" | "W";
  winner: "B" | "W" | "draw" | null;
  winningLine: Coord[] | null;
  rngSeed: number;
}

export type GomokuAction = { type: "place"; at: Coord };

export function initialState(seed: number, settings: GomokuSettings): GomokuState {
  const size = parseInt(settings.boardSize, 10);
  return {
    settings,
    grid: Grid.filled<Cell>(size, size, null),
    turn: "B",
    winner: null,
    winningLine: null,
    rngSeed: seed,
  };
}

function checkWinner(grid: Grid<Cell>): { winner: "B" | "W" | "draw" | null; winningLine: Coord[] | null } {
  const line = findWinningLine<Cell>(grid, 5, (v) => v !== null, (a, b) => a === b);
  if (line) {
    const val = grid.get(line[0]!);
    return { winner: val as "B" | "W", winningLine: line };
  }
  const full = [...grid.coords()].every((c) => grid.get(c) !== null);
  if (full) return { winner: "draw", winningLine: null };
  return { winner: null, winningLine: null };
}

function emptyCells(grid: Grid<Cell>): Coord[] {
  return [...grid.coords()].filter((c) => grid.get(c) === null);
}

// Evaluate threats for a given player
function countOpenSequences(grid: Grid<Cell>, stone: Cell, len: number): number {
  let count = 0;
  const dirs = [[0,1],[1,0],[1,1],[1,-1]] as const;

  for (const c of grid.coords()) {
    if (grid.get(c) !== null) continue; // only start from empty
    for (const [dr, dc] of dirs) {
      let consecutive = 0;
      let openEnds = 0;
      // check backward open end
      const back = { row: c.row - dr, col: c.col - dc };
      if (grid.inBounds(back) && grid.get(back) === null) openEnds++;
      // count consecutive stones
      let nr = c.row, nc = c.col;
      for (let i = 0; i < len; i++) {
        if (!grid.inBounds({ row: nr, col: nc }) || grid.get({ row: nr, col: nc }) !== stone) break;
        consecutive++;
        nr += dr;
        nc += dc;
      }
      // check forward open end
      if (grid.inBounds({ row: nr, col: nc }) && grid.get({ row: nr, col: nc }) === null) openEnds++;
      if (consecutive >= len && openEnds > 0) count++;
    }
  }
  return count;
}

function evaluateBoard(grid: Grid<Cell>): number {
  // Bot is W (maximizer)
  const { winner } = checkWinner(grid);
  if (winner === "W") return 100000;
  if (winner === "B") return -100000;
  if (winner === "draw") return 0;

  let score = 0;
  score += countOpenSequences(grid, "W", 4) * 1000;
  score += countOpenSequences(grid, "W", 3) * 100;
  score += countOpenSequences(grid, "W", 2) * 10;
  score -= countOpenSequences(grid, "B", 4) * 1200; // slightly prioritize blocking
  score -= countOpenSequences(grid, "B", 3) * 120;
  score -= countOpenSequences(grid, "B", 2) * 12;
  return score;
}

// Limit candidate moves to cells near existing stones for speed
function candidateMoves(grid: Grid<Cell>): Coord[] {
  const stones = [...grid.coords()].filter((c) => grid.get(c) !== null);
  if (stones.length === 0) {
    // Opening: center
    return [{ row: Math.floor(grid.rows / 2), col: Math.floor(grid.cols / 2) }];
  }

  const candidates = new Set<string>();
  const range = 2;
  for (const s of stones) {
    for (let dr = -range; dr <= range; dr++) {
      for (let dc = -range; dc <= range; dc++) {
        const c = { row: s.row + dr, col: s.col + dc };
        if (grid.inBounds(c) && grid.get(c) === null) {
          candidates.add(`${c.row},${c.col}`);
        }
      }
    }
  }
  return [...candidates].map((k) => {
    const [r, c] = k.split(",").map(Number);
    return { row: r!, col: c! };
  });
}

interface BotSearchState {
  grid: Grid<Cell>;
  turn: "B" | "W";
}

function getBotMove(state: GomokuState): Coord | null {
  const result = minimax<BotSearchState, Coord>(
    { grid: state.grid, turn: state.turn },
    {
      depth: 3,
      moves(s) {
        if (checkWinner(s.grid).winner !== null) return [];
        return candidateMoves(s.grid);
      },
      apply(s, move) {
        return { grid: s.grid.set(move, s.turn), turn: s.turn === "B" ? "W" : "B" };
      },
      isTerminal(s) { return checkWinner(s.grid).winner !== null; },
      evaluate(s) { return evaluateBoard(s.grid); },
      maximizing(s) { return s.turn === "W"; },
    }
  );
  return result.move;
}

export function reducer(state: GomokuState, action: GomokuAction): GomokuState {
  if (action.type !== "place") return state;
  if (state.winner !== null) return state;
  if (!state.grid.inBounds(action.at)) return state;
  if (state.grid.get(action.at) !== null) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  // Player places Black
  const nextGrid = state.grid.set(action.at, state.turn);
  const { winner, winningLine } = checkWinner(nextGrid);
  let next: GomokuState = { ...state, rngSeed: nextSeed, grid: nextGrid, turn: "W", winner, winningLine };

  if (winner !== null) return next;

  // Bot places White
  const botMove = getBotMove(next);
  if (botMove) {
    const botGrid = next.grid.set(botMove, "W");
    const { winner: bw, winningLine: bwl } = checkWinner(botGrid);
    next = { ...next, grid: botGrid, turn: "B", winner: bw, winningLine: bwl };
  } else {
    // No moves = draw
    next = { ...next, winner: "draw" };
  }

  return next;
}

export function isTerminal(state: GomokuState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === "B") return { score: 100 };
  if (state.winner === "draw") return { score: 50 };
  return { score: 0 };
}

export { emptyCells };
