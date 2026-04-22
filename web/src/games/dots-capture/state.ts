import { Grid, neighbors4 } from "../../engines/grid/index.js";
import { minimax } from "../../engines/grid/minimax.js";
import type { Coord } from "../../engines/grid/index.js";

// Dots Capture: 7×7 grid, 20-turn limit.
// Players alternate placing dots. After all turns, score by:
// - Each isolated dot (fully orthogonally surrounded by opponent dots or edge) = 0 pts to owner, 1 pt to opponent.
// - Otherwise count each player's dots directly.
// Simpler scoring: count connected components. Larger components are safer.
// Even simpler: at game end, count dots that are fully surrounded (all 4 neighbors occupied by opp or OOB) = captured.
// Score = own dots - captured + captures.

export type Cell = "W" | "B" | null;

export interface DotsCaptureSettings {
  opponent: "bot" | "hot-seat";
}

export interface DotsCaptureState {
  settings: DotsCaptureSettings;
  rngSeed: number;
  grid: Grid<Cell>;
  turn: "W" | "B";
  turnsLeft: number;
  winner: "W" | "B" | "draw" | null;
  finalScore: { W: number; B: number } | null;
}

export type DotsCaptureAction = { type: "place"; at: Coord };

const ROWS = 7, COLS = 7, TOTAL_TURNS = 20;

export function initialState(seed: number, settings: DotsCaptureSettings): DotsCaptureState {
  return {
    settings,
    rngSeed: seed,
    grid: Grid.filled<Cell>(ROWS, COLS, null),
    turn: "W",
    turnsLeft: TOTAL_TURNS,
    winner: null,
    finalScore: null,
  };
}

function key(c: Coord): string { return `${c.row},${c.col}`; }

/** A dot is "captured" if all 4 orthogonal neighbors are filled with opponent or out-of-bounds */
function countCaptured(grid: Grid<Cell>, color: Cell): number {
  const opp: Cell = color === "W" ? "B" : "W";
  let captured = 0;
  for (const c of grid.coords()) {
    if (grid.get(c) !== color) continue;
    const ns = neighbors4(c);
    const surrounded = ns.every(n => !grid.inBounds(n) || grid.get(n) === opp);
    if (surrounded) captured++;
  }
  return captured;
}

function countDots(grid: Grid<Cell>, color: Cell): number {
  return [...grid.coords()].filter(c => grid.get(c) === color).length;
}

/** Compute score: own dots - own captured + opponent captured */
function computeScores(grid: Grid<Cell>): { W: number; B: number } {
  const wDots = countDots(grid, "W");
  const bDots = countDots(grid, "B");
  const wCaptured = countCaptured(grid, "W");
  const bCaptured = countCaptured(grid, "B");
  return {
    W: wDots - wCaptured + bCaptured,
    B: bDots - bCaptured + wCaptured,
  };
}

function evaluate(state: DotsCaptureState): number {
  // Bot is B (maximizer)
  const scores = computeScores(state.grid);
  return scores.B - scores.W;
}

function botMove(state: DotsCaptureState): DotsCaptureState {
  const candidates = [...state.grid.coords()].filter(c => state.grid.get(c) === null);
  if (candidates.length === 0) return state;

  const result = minimax(state, {
    depth: 3,
    moves: (s) => [...s.grid.coords()].filter(c => s.grid.get(c) === null).map(c => ({ type: "place" as const, at: c })),
    apply: (s, a) => applyPlace(s, a.at),
    isTerminal: (s) => s.winner !== null || s.turnsLeft === 0,
    evaluate: (s) => {
      if (s.winner === "B") return 100000;
      if (s.winner === "W") return -100000;
      return evaluate(s);
    },
    maximizing: (s) => s.turn === "B",
  });

  if (!result.move) return applyPlace(state, candidates[0]!);
  return applyPlace(state, result.move.at);
}

function applyPlace(state: DotsCaptureState, at: Coord): DotsCaptureState {
  if (!state.grid.inBounds(at) || state.grid.get(at) !== null) return state;
  const newGrid = state.grid.set(at, state.turn);
  const newTurnsLeft = state.turnsLeft - 1;
  const nextTurn: "W" | "B" = state.turn === "W" ? "B" : "W";

  if (newTurnsLeft <= 0) {
    const scores = computeScores(newGrid);
    const winner: "W" | "B" | "draw" = scores.W > scores.B ? "W" : scores.B > scores.W ? "B" : "draw";
    return { ...state, grid: newGrid, turnsLeft: 0, winner, finalScore: scores, turn: nextTurn };
  }

  return { ...state, grid: newGrid, turnsLeft: newTurnsLeft, turn: nextTurn };
}

export function reducer(state: DotsCaptureState, action: DotsCaptureAction): DotsCaptureState {
  if (state.winner || state.turnsLeft <= 0) return state;

  const next = applyPlace(state, action.at);
  if (next === state) return state; // invalid move

  if (!next.winner && state.settings.opponent === "bot" && next.turn === "B") {
    return botMove(next);
  }

  return next;
}

export function isTerminal(state: DotsCaptureState): { score: number } | null {
  if (!state.winner) return null;
  if (state.winner === "W") return { score: 100 };
  if (state.winner === "B") return { score: 0 };
  return { score: 50 };
}

export { countCaptured, countDots };
