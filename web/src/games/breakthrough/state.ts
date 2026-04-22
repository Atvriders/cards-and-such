import { Grid } from "../../engines/grid/index.js";
import { minimax } from "../../engines/grid/minimax.js";
import type { Coord } from "../../engines/grid/index.js";

export type Cell = "W" | "B" | null; // W = player (white, bottom), B = bot (black, top)

export interface BreakthroughSettings {
  opponent: "bot" | "hot-seat";
}

export interface BreakthroughState {
  settings: BreakthroughSettings;
  rngSeed: number;
  grid: Grid<Cell>;
  turn: "W" | "B";
  selected: Coord | null;
  winner: "W" | "B" | null;
}

export type BreakthroughAction =
  | { type: "select"; at: Coord }
  | { type: "move"; from: Coord; to: Coord };

export function initialState(seed: number, settings: BreakthroughSettings): BreakthroughState {
  const cells: Cell[] = new Array(64).fill(null);
  // Black (bot) in rows 0-1
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 8; c++)
      cells[r * 8 + c] = "B";
  // White (player) in rows 6-7
  for (let r = 6; r < 8; r++)
    for (let c = 0; c < 8; c++)
      cells[r * 8 + c] = "W";
  return {
    settings,
    rngSeed: seed,
    grid: new Grid<Cell>(8, 8, cells),
    turn: "W",
    selected: null,
    winner: null,
  };
}

export function getMoves(grid: Grid<Cell>, color: "W" | "B"): Array<{ from: Coord; to: Coord }> {
  const dr = color === "W" ? -1 : 1; // White moves up, Black moves down
  const moves: Array<{ from: Coord; to: Coord }> = [];
  for (const c of grid.coords()) {
    if (grid.get(c) !== color) continue;
    // Forward and forward-diagonal
    for (const dc of [-1, 0, 1]) {
      const to = { row: c.row + dr, col: c.col + dc };
      if (!grid.inBounds(to)) continue;
      const dest = grid.get(to);
      if (dc === 0 && dest !== null) continue; // forward blocked
      if (dc !== 0 && dest === color) continue; // can't capture own
      moves.push({ from: c, to });
    }
  }
  return moves;
}

function applyMove(grid: Grid<Cell>, from: Coord, to: Coord): Grid<Cell> {
  const piece = grid.get(from);
  return grid.set(from, null).set(to, piece);
}

function checkWinner(grid: Grid<Cell>, lastMove: { from: Coord; to: Coord }): "W" | "B" | null {
  const { to } = lastMove;
  const piece = grid.get(to);
  if (piece === "W" && to.row === 0) return "W";
  if (piece === "B" && to.row === 7) return "B";
  // Check if opponent has any pieces left
  const wCount = [...grid.coords()].filter(c => grid.get(c) === "W").length;
  const bCount = [...grid.coords()].filter(c => grid.get(c) === "B").length;
  if (wCount === 0) return "B";
  if (bCount === 0) return "W";
  return null;
}

function evaluate(grid: Grid<Cell>): number {
  // Bot is B (maximizer). Positive = B winning.
  let score = 0;
  for (const c of grid.coords()) {
    const v = grid.get(c);
    if (v === "B") score += 10 + c.row; // Black advances downward
    if (v === "W") score -= 10 + (7 - c.row); // White advances upward
  }
  return score;
}

function botMove(state: BreakthroughState): BreakthroughState {
  type BotMove = { from: Coord; to: Coord };
  const result = minimax<BreakthroughState, BotMove>(state, {
    depth: 3,
    moves: (s) => getMoves(s.grid, s.turn),
    apply: (s, m) => {
      const newGrid = applyMove(s.grid, m.from, m.to);
      const winner = checkWinner(newGrid, m);
      const turn: "W" | "B" = s.turn === "W" ? "B" : "W";
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
  const winner = checkWinner(newGrid, result.move);
  return { ...state, grid: newGrid, turn: "W", winner, selected: null };
}

export function reducer(state: BreakthroughState, action: BreakthroughAction): BreakthroughState {
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
    const winner = checkWinner(newGrid, action);
    const next: BreakthroughState = { ...state, grid: newGrid, turn: state.turn === "W" ? "B" : "W", winner, selected: null };
    if (!winner && state.settings.opponent === "bot" && next.turn === "B") {
      return botMove(next);
    }
    return next;
  }

  return state;
}

export function isTerminal(state: BreakthroughState): { score: number } | null {
  if (state.winner === "W") return { score: 100 };
  if (state.winner === "B") return { score: 0 };
  if (getMoves(state.grid, state.turn).length === 0) return { score: state.turn === "W" ? 0 : 100 };
  return null;
}
