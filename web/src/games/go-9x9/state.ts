import { Grid, neighbors4 } from "../../engines/grid/index.js";
import { minimax } from "../../engines/grid/minimax.js";
import type { Coord } from "../../engines/grid/index.js";

export type Cell = "B" | "W" | null;

export interface Go9x9Settings {
  opponent: "bot" | "hot-seat";
}

export interface Go9x9State {
  settings: Go9x9Settings;
  rngSeed: number;
  grid: Grid<Cell>;
  turn: "B" | "W";
  consecutivePasses: number;
  capturedB: number; // Black stones captured
  capturedW: number; // White stones captured
  winner: "B" | "W" | "draw" | null;
  scores: { B: number; W: number } | null;
}

export type Go9x9Action =
  | { type: "place"; at: Coord }
  | { type: "pass" };

export function initialState(seed: number, settings: Go9x9Settings): Go9x9State {
  return {
    settings,
    rngSeed: seed,
    grid: Grid.filled<Cell>(9, 9, null),
    turn: "B",
    consecutivePasses: 0,
    capturedB: 0,
    capturedW: 0,
    winner: null,
    scores: null,
  };
}

function key(c: Coord): string { return `${c.row},${c.col}`; }

/** Get all stones in the group containing coord (BFS) */
function getGroup(grid: Grid<Cell>, coord: Coord): Coord[] {
  const color = grid.get(coord);
  if (!color) return [];
  const visited = new Set<string>([key(coord)]);
  const queue = [coord];
  const group: Coord[] = [];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    group.push(cur);
    for (const n of neighbors4(cur)) {
      if (!grid.inBounds(n)) continue;
      if (visited.has(key(n))) continue;
      if (grid.get(n) === color) {
        visited.add(key(n));
        queue.push(n);
      }
    }
  }
  return group;
}

/** Count liberties (adjacent empty cells) of a group */
function liberties(grid: Grid<Cell>, group: Coord[]): number {
  const libSet = new Set<string>();
  for (const c of group) {
    for (const n of neighbors4(c)) {
      if (!grid.inBounds(n)) continue;
      if (grid.get(n) === null) libSet.add(key(n));
    }
  }
  return libSet.size;
}

/** Remove captured stones of `opp` after placing at coord. Returns {newGrid, captured}. */
function applyCaptures(grid: Grid<Cell>, justPlaced: Coord, placedColor: "B" | "W"): { grid: Grid<Cell>; captured: number } {
  const opp = placedColor === "B" ? "W" : "B";
  let g = grid;
  let captured = 0;
  const checked = new Set<string>();

  for (const n of neighbors4(justPlaced)) {
    if (!g.inBounds(n)) continue;
    if (g.get(n) !== opp) continue;
    if (checked.has(key(n))) continue;
    const group = getGroup(g, n);
    for (const c of group) checked.add(key(c));
    if (liberties(g, group) === 0) {
      captured += group.length;
      for (const c of group) g = g.set(c, null);
    }
  }
  return { grid: g, captured };
}

function isLegalPlacement(state: Go9x9State, at: Coord): boolean {
  if (!state.grid.inBounds(at)) return false;
  if (state.grid.get(at) !== null) return false;

  // Tentatively place
  let g = state.grid.set(at, state.turn);
  const { grid: g2 } = applyCaptures(g, at, state.turn);

  // Check suicide: the placed group must have at least 1 liberty
  const group = getGroup(g2, at);
  if (group.length === 0) return false; // shouldn't happen after capture
  return liberties(g2, group) > 0;
}

function emptyRegions(grid: Grid<Cell>): { color: "B" | "W" | null; cells: Coord[] }[] {
  const visited = new Set<string>();
  const regions: { color: "B" | "W" | null; cells: Coord[] }[] = [];

  for (const start of grid.coords()) {
    if (grid.get(start) !== null) continue;
    if (visited.has(key(start))) continue;

    // BFS to find connected empty region
    const queue = [start];
    visited.add(key(start));
    const cells: Coord[] = [];
    const borders = new Set<Cell>();

    while (queue.length > 0) {
      const cur = queue.shift()!;
      cells.push(cur);
      for (const n of neighbors4(cur)) {
        if (!grid.inBounds(n)) continue;
        const nv = grid.get(n);
        if (nv === null) {
          if (!visited.has(key(n))) {
            visited.add(key(n));
            queue.push(n);
          }
        } else {
          borders.add(nv);
        }
      }
    }

    let territory: "B" | "W" | null = null;
    if (borders.size === 1) {
      territory = borders.has("B") ? "B" : "W";
    }
    regions.push({ color: territory, cells });
  }
  return regions;
}

function computeScores(state: Go9x9State): { B: number; W: number } {
  const grid = state.grid;
  let bStones = 0, wStones = 0;
  for (const c of grid.coords()) {
    if (grid.get(c) === "B") bStones++;
    if (grid.get(c) === "W") wStones++;
  }

  let bTerritory = 0, wTerritory = 0;
  for (const region of emptyRegions(grid)) {
    if (region.color === "B") bTerritory += region.cells.length;
    if (region.color === "W") wTerritory += region.cells.length;
  }

  return {
    B: bStones + bTerritory - state.capturedB,
    W: wStones + wTerritory - state.capturedW + 6.5, // komi
  };
}

function evaluate(state: Go9x9State): number {
  // Bot is W (maximizer). Positive = W winning.
  const scores = computeScores(state);
  return scores.W - scores.B;
}

function botMove(state: Go9x9State): Go9x9State {
  const candidateMoves = [...state.grid.coords()]
    .filter(c => isLegalPlacement(state, c));

  // Limit candidates for performance
  const limited = candidateMoves.length > 20 ? candidateMoves.slice(0, 20) : candidateMoves;

  const allActions: Go9x9Action[] = [...limited.map(c => ({ type: "place" as const, at: c })), { type: "pass" }];

  const result = minimax(state, {
    depth: 2,
    moves: (s) => {
      if (s.consecutivePasses >= 2) return [];
      const places = [...s.grid.coords()]
        .filter(c => isLegalPlacement(s, c))
        .slice(0, 15)
        .map(c => ({ type: "place" as const, at: c }));
      return [...places, { type: "pass" as const }];
    },
    apply: (s, a) => applyAction(s, a),
    isTerminal: (s) => s.winner !== null,
    evaluate: (s) => {
      if (s.winner === "W") return 100000;
      if (s.winner === "B") return -100000;
      return evaluate(s);
    },
    maximizing: (s) => s.turn === "W",
  });

  // If minimax found no move among our limited candidates, pick first legal or pass
  let action: Go9x9Action = { type: "pass" };
  if (result.move) {
    action = result.move;
  } else if (allActions.length > 0) {
    action = allActions[0]!;
  }

  return applyAction(state, action);
}

function applyAction(state: Go9x9State, action: Go9x9Action): Go9x9State {
  if (action.type === "pass") {
    const passes = state.consecutivePasses + 1;
    if (passes >= 2) {
      const scores = computeScores({ ...state, consecutivePasses: passes });
      const winner = scores.B > scores.W ? "B" : scores.W > scores.B ? "W" : "draw";
      return { ...state, consecutivePasses: passes, winner, scores };
    }
    return { ...state, consecutivePasses: passes, turn: state.turn === "B" ? "W" : "B" };
  }

  if (action.type === "place") {
    if (!isLegalPlacement(state, action.at)) return state;
    let g = state.grid.set(action.at, state.turn);
    const { grid: g2, captured } = applyCaptures(g, action.at, state.turn);
    const newCapturedB = state.turn === "W" ? state.capturedB + captured : state.capturedB;
    const newCapturedW = state.turn === "B" ? state.capturedW + captured : state.capturedW;
    return {
      ...state,
      grid: g2,
      turn: state.turn === "B" ? "W" : "B",
      consecutivePasses: 0,
      capturedB: newCapturedB,
      capturedW: newCapturedW,
    };
  }

  return state;
}

export function reducer(state: Go9x9State, action: Go9x9Action): Go9x9State {
  if (state.winner) return state;

  const next = applyAction(state, action);

  // After player move, check if bot should play
  if (!next.winner && state.settings.opponent === "bot" && next.turn === "W") {
    return botMove(next);
  }

  return next;
}

export function isTerminal(state: Go9x9State): { score: number } | null {
  if (!state.winner) return null;
  if (state.winner === "B") return { score: 100 };
  if (state.winner === "W") return { score: 0 };
  return { score: 50 }; // draw
}
