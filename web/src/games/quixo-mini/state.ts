/** Quixo Mini: 4×4 edge-push board. Player = X, Bot = O. 4 in a row wins. */

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const SIZE = 4;
export const TARGET = 4;

export type Cell = "X" | "O" | null;
export type Dir = "right" | "left" | "up" | "down";

export interface QuixoMiniSettings {
  botStrength: "easy" | "hard";
}

export interface QuixoMiniState {
  settings: QuixoMiniSettings;
  rngSeed: number;
  grid: Cell[];
  turn: "X" | "O";
  winner: "X" | "O" | null;
  winningLine: number[] | null;
  gameOver: boolean;
  selected: number | null;
}

export type QuixoMiniAction =
  | { type: "select"; idx: number }
  | { type: "push"; dir: Dir }
  | { type: "restart" };

function idx(r: number, c: number): number { return r * SIZE + c; }
function row(i: number): number { return Math.floor(i / SIZE); }
function col(i: number): number { return i % SIZE; }

export function edgeCells(): number[] {
  const out: number[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (r === 0 || r === SIZE - 1 || c === 0 || c === SIZE - 1) {
        out.push(idx(r, c));
      }
    }
  }
  return out;
}

export function canSelect(grid: Cell[], cellIdx: number, player: "X" | "O"): boolean {
  const cell = grid[cellIdx];
  return cell === null || cell === player;
}

export function validDirs(cellIdx: number): Dir[] {
  const r = row(cellIdx), c = col(cellIdx);
  const dirs: Dir[] = [];
  if (c > 0) dirs.push("left");
  if (c < SIZE - 1) dirs.push("right");
  if (r > 0) dirs.push("up");
  if (r < SIZE - 1) dirs.push("down");
  return dirs;
}

export function applyPush(grid: Cell[], cellIdx: number, dir: Dir, mark: "X" | "O"): Cell[] {
  const r = row(cellIdx), c = col(cellIdx);
  const next = [...grid];
  if (dir === "right") {
    for (let cc = c; cc < SIZE - 1; cc++) next[idx(r, cc)] = next[idx(r, cc + 1)]!;
    next[idx(r, SIZE - 1)] = mark;
  } else if (dir === "left") {
    for (let cc = c; cc > 0; cc--) next[idx(r, cc)] = next[idx(r, cc - 1)]!;
    next[idx(r, 0)] = mark;
  } else if (dir === "down") {
    for (let rr = r; rr < SIZE - 1; rr++) next[idx(rr, c)] = next[idx(rr + 1, c)]!;
    next[idx(SIZE - 1, c)] = mark;
  } else {
    for (let rr = r; rr > 0; rr--) next[idx(rr, c)] = next[idx(rr - 1, c)]!;
    next[idx(0, c)] = mark;
  }
  return next;
}

export function checkWinner(grid: Cell[]): { winner: "X" | "O" | null; line: number[] | null } {
  for (let r = 0; r < SIZE; r++) {
    const v = grid[idx(r, 0)];
    if (v && [1, 2, 3].every((c) => grid[idx(r, c)] === v)) {
      return { winner: v, line: [0, 1, 2, 3].map((c) => idx(r, c)) };
    }
  }
  for (let c = 0; c < SIZE; c++) {
    const v = grid[idx(0, c)];
    if (v && [1, 2, 3].every((r) => grid[idx(r, c)] === v)) {
      return { winner: v, line: [0, 1, 2, 3].map((r) => idx(r, c)) };
    }
  }
  const d1 = grid[idx(0, 0)];
  if (d1 && [1, 2, 3].every((i) => grid[idx(i, i)] === d1)) {
    return { winner: d1, line: [0, 1, 2, 3].map((i) => idx(i, i)) };
  }
  const d2 = grid[idx(0, SIZE - 1)];
  if (d2 && [1, 2, 3].every((i) => grid[idx(i, SIZE - 1 - i)] === d2)) {
    return { winner: d2, line: [0, 1, 2, 3].map((i) => idx(i, SIZE - 1 - i)) };
  }
  return { winner: null, line: null };
}

function scoreGrid(grid: Cell[], mark: "X" | "O"): number {
  const opp: Cell = mark === "X" ? "O" : "X";
  let score = 0;
  const lines: number[][] = [];
  for (let r = 0; r < SIZE; r++) lines.push([0, 1, 2, 3].map((c) => idx(r, c)));
  for (let c = 0; c < SIZE; c++) lines.push([0, 1, 2, 3].map((r) => idx(r, c)));
  lines.push([0, 1, 2, 3].map((i) => idx(i, i)));
  lines.push([0, 1, 2, 3].map((i) => idx(i, SIZE - 1 - i)));
  for (const line of lines) {
    const me = line.filter((i) => grid[i] === mark).length;
    const them = line.filter((i) => grid[i] === opp).length;
    if (them === 0) score += me * me;
    if (me === 0) score -= them * them;
  }
  return score;
}

function botMove(grid: Cell[], strength: "easy" | "hard", rng: () => number): { cellIdx: number; dir: Dir } {
  const edges = edgeCells().filter((i) => canSelect(grid, i, "O"));
  // Win-now
  for (const ci of edges) {
    for (const d of validDirs(ci)) {
      const next = applyPush(grid, ci, d, "O");
      if (checkWinner(next).winner === "O") return { cellIdx: ci, dir: d };
    }
  }
  if (strength === "easy") {
    const ci = edges[Math.floor(rng() * edges.length)] ?? edges[0]!;
    const dirs = validDirs(ci);
    return { cellIdx: ci, dir: dirs[Math.floor(rng() * dirs.length)]! };
  }
  let best: { cellIdx: number; dir: Dir } = { cellIdx: edges[0]!, dir: validDirs(edges[0]!)[0]! };
  let bs = -Infinity;
  for (const ci of edges) {
    for (const d of validDirs(ci)) {
      const next = applyPush(grid, ci, d, "O");
      // skip if it lets X win immediately
      const xEdges = edgeCells().filter((i) => canSelect(next, i, "X"));
      let xCanWin = false;
      for (const xi of xEdges) {
        for (const xd of validDirs(xi)) {
          const xNext = applyPush(next, xi, xd, "X");
          if (checkWinner(xNext).winner === "X") { xCanWin = true; break; }
        }
        if (xCanWin) break;
      }
      const s = (xCanWin ? -10000 : 0) + scoreGrid(next, "O") + rng() * 0.001;
      if (s > bs) { bs = s; best = { cellIdx: ci, dir: d }; }
    }
  }
  return best;
}

export function initialState(seed: number, settings: QuixoMiniSettings): QuixoMiniState {
  return {
    settings,
    rngSeed: seed,
    grid: Array(SIZE * SIZE).fill(null) as Cell[],
    turn: "X",
    winner: null,
    winningLine: null,
    gameOver: false,
    selected: null,
  };
}

export function reducer(state: QuixoMiniState, action: QuixoMiniAction): QuixoMiniState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);
  if (state.gameOver || state.turn !== "X") return state;

  if (action.type === "select") {
    const { idx: ci } = action;
    if (!edgeCells().includes(ci)) return state;
    if (!canSelect(state.grid, ci, "X")) return state;
    return { ...state, selected: state.selected === ci ? null : ci };
  }

  if (action.type === "push") {
    if (state.selected === null) return state;
    if (!validDirs(state.selected).includes(action.dir)) return state;
    const newGrid = applyPush(state.grid, state.selected, action.dir, "X");
    const { winner, line } = checkWinner(newGrid);
    if (winner !== null) {
      return { ...state, grid: newGrid, winner, winningLine: line, gameOver: true, turn: "O", selected: null };
    }
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const bm = botMove(newGrid, state.settings.botStrength, rng);
    const botGrid = applyPush(newGrid, bm.cellIdx, bm.dir, "O");
    const { winner: bw, line: bl } = checkWinner(botGrid);
    return {
      ...state,
      rngSeed: nextSeed,
      grid: botGrid,
      turn: "X",
      winner: bw,
      winningLine: bl,
      gameOver: bw !== null,
      selected: null,
    };
  }

  return state;
}

export function isTerminal(state: QuixoMiniState): { score: number } | null {
  if (!state.gameOver) return null;
  if (state.winner === "X") return { score: 100 };
  return { score: 0 };
}
