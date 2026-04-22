import { Grid, neighbors4 } from "../../engines/grid/index.js";
import { minimax } from "../../engines/grid/minimax.js";
import type { Coord } from "../../engines/grid/index.js";

export type Cell = "B" | "W" | null;

export interface AtariGoSettings {
  opponent: "bot" | "hot-seat";
}

export interface AtariGoState {
  settings: AtariGoSettings;
  rngSeed: number;
  grid: Grid<Cell>;
  turn: "B" | "W";
  capturedB: number;
  capturedW: number;
  winner: "B" | "W" | null;
}

export type AtariGoAction =
  | { type: "place"; at: Coord };

export function initialState(seed: number, settings: AtariGoSettings): AtariGoState {
  return {
    settings,
    rngSeed: seed,
    grid: Grid.filled<Cell>(9, 9, null),
    turn: "B",
    capturedB: 0,
    capturedW: 0,
    winner: null,
  };
}

function key(c: Coord): string { return `${c.row},${c.col}`; }

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
      if (grid.get(n) === color) { visited.add(key(n)); queue.push(n); }
    }
  }
  return group;
}

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

function isLegalPlacement(state: AtariGoState, at: Coord): boolean {
  if (!state.grid.inBounds(at)) return false;
  if (state.grid.get(at) !== null) return false;
  const g = state.grid.set(at, state.turn);
  const { grid: g2 } = applyCaptures(g, at, state.turn);
  const group = getGroup(g2, at);
  if (group.length === 0) return false;
  return liberties(g2, group) > 0;
}

function evaluate(state: AtariGoState): number {
  // Bot is W (maximizer). Minimize B liberties, maximize W liberties.
  let bLib = 0, wLib = 0;
  const visited = new Set<string>();
  for (const c of state.grid.coords()) {
    if (visited.has(key(c))) continue;
    const v = state.grid.get(c);
    if (!v) continue;
    const group = getGroup(state.grid, c);
    for (const gc of group) visited.add(key(gc));
    const lib = liberties(state.grid, group);
    if (v === "B") bLib += lib;
    else wLib += lib;
  }
  return wLib - bLib;
}

function applyAction(state: AtariGoState, action: AtariGoAction): AtariGoState {
  if (!isLegalPlacement(state, action.at)) return state;
  const g = state.grid.set(action.at, state.turn);
  const { grid: g2, captured } = applyCaptures(g, action.at, state.turn);
  const newCapturedB = state.turn === "W" ? state.capturedB + captured : state.capturedB;
  const newCapturedW = state.turn === "B" ? state.capturedW + captured : state.capturedW;
  const winner = captured > 0 ? state.turn : null; // First capture wins
  return {
    ...state,
    grid: g2,
    turn: state.turn === "B" ? "W" : "B",
    capturedB: newCapturedB,
    capturedW: newCapturedW,
    winner,
  };
}

function botMove(state: AtariGoState): AtariGoState {
  const candidates = [...state.grid.coords()].filter(c => isLegalPlacement(state, c)).slice(0, 20);
  const result = minimax(state, {
    depth: 3,
    moves: (s) => [...s.grid.coords()].filter(c => isLegalPlacement(s, c)).slice(0, 15).map(c => ({ type: "place" as const, at: c })),
    apply: (s, a) => applyAction(s, a),
    isTerminal: (s) => s.winner !== null,
    evaluate: (s) => {
      if (s.winner === "W") return 100000;
      if (s.winner === "B") return -100000;
      return evaluate(s);
    },
    maximizing: (s) => s.turn === "W",
  });
  if (!result.move && candidates.length > 0) {
    return applyAction(state, { type: "place", at: candidates[0]! });
  }
  if (!result.move) return state;
  return applyAction(state, result.move);
}

export function reducer(state: AtariGoState, action: AtariGoAction): AtariGoState {
  if (state.winner) return state;
  const next = applyAction(state, action);
  if (!next.winner && state.settings.opponent === "bot" && next.turn === "W") {
    return botMove(next);
  }
  return next;
}

export function isTerminal(state: AtariGoState): { score: number } | null {
  if (!state.winner) return null;
  return { score: state.winner === "B" ? 100 : 0 };
}
