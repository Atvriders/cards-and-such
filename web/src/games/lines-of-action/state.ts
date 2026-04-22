import { Grid } from "../../engines/grid/index.js";
import { minimax } from "../../engines/grid/minimax.js";
import type { Coord } from "../../engines/grid/index.js";

export type Cell = "B" | "W" | null;

export interface LinesOfActionSettings {
  opponent: "bot" | "hot-seat";
}

export interface LinesOfActionState {
  settings: LinesOfActionSettings;
  rngSeed: number;
  grid: Grid<Cell>;
  turn: "B" | "W";
  selected: Coord | null;
  winner: "B" | "W" | null;
}

export type LinesOfActionAction =
  | { type: "select"; at: Coord }
  | { type: "move"; from: Coord; to: Coord };

export function initialState(seed: number, settings: LinesOfActionSettings): LinesOfActionState {
  // 8x8. Black: top row (row 0) cols 1-6 + bottom row (row 7) cols 1-6 = 12
  // White: left col (col 0) rows 1-6 + right col (col 7) rows 1-6 = 12
  const cells: Cell[] = new Array(64).fill(null);
  for (let c = 1; c <= 6; c++) {
    cells[0 * 8 + c] = "B";
    cells[7 * 8 + c] = "B";
  }
  for (let r = 1; r <= 6; r++) {
    cells[r * 8 + 0] = "W";
    cells[r * 8 + 7] = "W";
  }
  return {
    settings,
    rngSeed: seed,
    grid: new Grid<Cell>(8, 8, cells),
    turn: "B",
    selected: null,
    winner: null,
  };
}

const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]] as const;

/** Count pieces on a line (horizontal, vertical, diagonal) passing through coord, in direction [dr, dc] */
function lineCount(grid: Grid<Cell>, coord: Coord, dr: number, dc: number): number {
  let count = 0;
  // Traverse the full line across the board
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      // Check if this cell is on the line through coord in direction [dr, dc]
      // The line through (coord.row, coord.col) in direction [dr, dc]:
      // parametrically: (coord.row + t*dr, coord.col + t*dc)
      // A cell (r,c) is on this line if (r - coord.row) * dc === (c - coord.col) * dr
      const onLine = (r - coord.row) * dc === (c - coord.col) * dr;
      if (onLine && grid.get({ row: r, col: c }) !== null) count++;
    }
  }
  return count;
}

export function getMoves(grid: Grid<Cell>, color: "B" | "W"): Array<{ from: Coord; to: Coord }> {
  const opp = color === "B" ? "W" : "B";
  const moves: Array<{ from: Coord; to: Coord }> = [];

  for (const from of grid.coords()) {
    if (grid.get(from) !== color) continue;

    for (const [dr, dc] of DIRS) {
      const n = lineCount(grid, from, dr, dc);

      // Move exactly n squares in +[dr,dc] and -[dr,dc]
      for (const sign of [1, -1]) {
        const to = { row: from.row + sign * dr * n, col: from.col + sign * dc * n };
        if (!grid.inBounds(to)) continue;
        // Cannot land on own piece
        if (grid.get(to) === color) continue;
        // Cannot jump over opponent piece
        let blocked = false;
        for (let step = 1; step < n; step++) {
          const mid = { row: from.row + sign * dr * step, col: from.col + sign * dc * step };
          if (!grid.inBounds(mid)) { blocked = true; break; }
          if (grid.get(mid) === opp) { blocked = true; break; }
        }
        if (!blocked) moves.push({ from, to });
      }
    }
  }
  return moves;
}

function applyMove(grid: Grid<Cell>, from: Coord, to: Coord): Grid<Cell> {
  const piece = grid.get(from);
  return grid.set(from, null).set(to, piece);
}

/** BFS to find connected component size for a color */
function largestGroup(grid: Grid<Cell>, color: Cell): number {
  const visited = new Set<string>();
  let largest = 0;
  const key = (c: Coord) => `${c.row},${c.col}`;

  for (const start of grid.coords()) {
    if (grid.get(start) !== color) continue;
    if (visited.has(key(start))) continue;
    // BFS
    const queue = [start];
    visited.add(key(start));
    let size = 0;
    while (queue.length > 0) {
      const cur = queue.shift()!;
      size++;
      for (const dr of [-1, 0, 1]) {
        for (const dc of [-1, 0, 1]) {
          if (dr === 0 && dc === 0) continue;
          const n = { row: cur.row + dr, col: cur.col + dc };
          if (!grid.inBounds(n)) continue;
          if (visited.has(key(n))) continue;
          if (grid.get(n) === color) {
            visited.add(key(n));
            queue.push(n);
          }
        }
      }
    }
    if (size > largest) largest = size;
  }
  return largest;
}

function totalPieces(grid: Grid<Cell>, color: Cell): number {
  return [...grid.coords()].filter(c => grid.get(c) === color).length;
}

function checkWinner(grid: Grid<Cell>): "B" | "W" | null {
  const bTotal = totalPieces(grid, "B");
  const wTotal = totalPieces(grid, "W");
  if (bTotal === 0) return "W";
  if (wTotal === 0) return "B";
  if (bTotal > 0 && largestGroup(grid, "B") === bTotal) return "B";
  if (wTotal > 0 && largestGroup(grid, "W") === wTotal) return "W";
  return null;
}

function evaluate(grid: Grid<Cell>): number {
  // Bot is B (maximizer)
  const bTotal = totalPieces(grid, "B");
  const wTotal = totalPieces(grid, "W");
  const bGroup = largestGroup(grid, "B");
  const wGroup = largestGroup(grid, "W");
  return (bGroup / Math.max(1, bTotal) - wGroup / Math.max(1, wTotal)) * 100;
}

function botMove(state: LinesOfActionState): LinesOfActionState {
  type LOAMove = { from: Coord; to: Coord };
  const result = minimax<LinesOfActionState, LOAMove>(state, {
    depth: 2,
    moves: (s) => getMoves(s.grid, s.turn),
    apply: (s, m) => {
      const newGrid = applyMove(s.grid, m.from, m.to);
      const winner = checkWinner(newGrid);
      const turn: "B" | "W" = s.turn === "B" ? "W" : "B";
      return { ...s, grid: newGrid, turn, winner, selected: null };
    },
    isTerminal: (s) => s.winner !== null || getMoves(s.grid, s.turn).length === 0,
    evaluate: (s) => {
      if (s.winner === "B") return 100000;
      if (s.winner === "W") return -100000;
      return evaluate(s.grid);
    },
    maximizing: (s) => s.turn === "B",
  });
  if (!result.move) return state;
  const newGrid = applyMove(state.grid, result.move.from, result.move.to);
  const winner = checkWinner(newGrid);
  return { ...state, grid: newGrid, turn: "W", winner, selected: null };
}

export function reducer(state: LinesOfActionState, action: LinesOfActionAction): LinesOfActionState {
  if (state.winner) return state;

  if (action.type === "select") {
    if (state.settings.opponent !== "hot-seat" && state.turn !== "W") return state;
    if (state.grid.get(action.at) !== state.turn) return state;
    return { ...state, selected: action.at };
  }

  if (action.type === "move") {
    const legal = getMoves(state.grid, state.turn);
    const isLegal = legal.some(
      m => m.from.row === action.from.row && m.from.col === action.from.col &&
           m.to.row === action.to.row && m.to.col === action.to.col
    );
    if (!isLegal) return state;
    const newGrid = applyMove(state.grid, action.from, action.to);
    const winner = checkWinner(newGrid);
    const next: LinesOfActionState = {
      ...state,
      grid: newGrid,
      turn: state.turn === "B" ? "W" : "B",
      winner,
      selected: null,
    };
    if (!winner && state.settings.opponent === "bot" && next.turn === "B") {
      return botMove(next);
    }
    return next;
  }

  return state;
}

export function isTerminal(state: LinesOfActionState): { score: number } | null {
  if (state.winner === "W") return { score: 100 };
  if (state.winner === "B") return { score: 0 };
  if (getMoves(state.grid, state.turn).length === 0) return { score: state.turn === "W" ? 0 : 100 };
  return null;
}
