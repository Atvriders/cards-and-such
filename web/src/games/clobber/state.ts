import { Grid, neighbors4 } from "../../engines/grid/index.js";
import { minimax } from "../../engines/grid/minimax.js";
import type { Coord } from "../../engines/grid/index.js";

export type Cell = "W" | "B" | null;

export interface ClobberSettings {
  opponent: "bot" | "hot-seat";
}

export interface ClobberState {
  settings: ClobberSettings;
  rngSeed: number;
  grid: Grid<Cell>;
  turn: "W" | "B";
  selected: Coord | null;
  winner: "W" | "B" | null;
}

export type ClobberAction =
  | { type: "select"; at: Coord }
  | { type: "move"; from: Coord; to: Coord };

export function initialState(seed: number, settings: ClobberSettings): ClobberState {
  const cells: Cell[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      // Alternating: (r+c) even => W, (r+c) odd => B
      cells.push((r + c) % 2 === 0 ? "W" : "B");
    }
  }
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
  const opp = color === "W" ? "B" : "W";
  const moves: Array<{ from: Coord; to: Coord }> = [];
  for (const c of grid.coords()) {
    if (grid.get(c) !== color) continue;
    for (const n of neighbors4(c)) {
      if (!grid.inBounds(n)) continue;
      if (grid.get(n) === opp) moves.push({ from: c, to: n });
    }
  }
  return moves;
}

function applyMove(grid: Grid<Cell>, from: Coord, to: Coord): Grid<Cell> {
  const piece = grid.get(from);
  return grid.set(from, null).set(to, piece);
}

function countPieces(grid: Grid<Cell>, color: Cell): number {
  return [...grid.coords()].filter(c => grid.get(c) === color).length;
}

function botMoveInternal(state: ClobberState): ClobberState {
  const result = minimax(state, {
    depth: 3,
    moves: (s) => getMoves(s.grid, s.turn),
    apply: (s, m) => {
      const newGrid = applyMove(s.grid, m.from, m.to);
      const nextTurn: "W" | "B" = s.turn === "W" ? "B" : "W";
      const noMoves = getMoves(newGrid, nextTurn).length === 0;
      return {
        ...s,
        grid: newGrid,
        turn: nextTurn,
        winner: noMoves ? s.turn : null,
        selected: null,
      };
    },
    isTerminal: (s) => s.winner !== null || getMoves(s.grid, s.turn).length === 0,
    evaluate: (s) => {
      if (s.winner === "B") return 100000;
      if (s.winner === "W") return -100000;
      // Bot is B. More W pieces means more targets for B, but B wants W to have no moves.
      return countPieces(s.grid, "W") - countPieces(s.grid, "B");
    },
    maximizing: (s) => s.turn === "B",
  });
  if (!result.move) return state;
  const newGrid = applyMove(state.grid, result.move.from, result.move.to);
  const nextTurn: "W" | "B" = "W";
  const noMoves = getMoves(newGrid, nextTurn).length === 0;
  return { ...state, grid: newGrid, turn: nextTurn, winner: noMoves ? "B" : null, selected: null };
}

export function reducer(state: ClobberState, action: ClobberAction): ClobberState {
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
    const nextTurn: "W" | "B" = state.turn === "W" ? "B" : "W";
    const noMoves = getMoves(newGrid, nextTurn).length === 0;
    const winner = noMoves ? state.turn : null;
    const next: ClobberState = { ...state, grid: newGrid, turn: nextTurn, winner, selected: null };
    if (!winner && state.settings.opponent === "bot" && next.turn === "B") {
      return botMoveInternal(next);
    }
    return next;
  }

  return state;
}

export function isTerminal(state: ClobberState): { score: number } | null {
  if (state.winner === "W") return { score: 100 };
  if (state.winner === "B") return { score: 0 };
  if (getMoves(state.grid, state.turn).length === 0) {
    // Current player can't move — last player to move wins, i.e. current player loses
    return { score: state.turn === "W" ? 0 : 100 };
  }
  return null;
}
