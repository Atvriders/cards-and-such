/** Quixo: 5×5 grid, edge-push game. Player = X, Bot = O. */

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuixoSettings {
  botStrength: "easy" | "hard";
}

export type Cell = "X" | "O" | null;
export type Dir = "right" | "left" | "up" | "down";

export interface QuixoState {
  settings: QuixoSettings;
  rngSeed: number;
  grid: Cell[]; // 5×5 flat, row-major
  turn: "X" | "O";
  winner: "X" | "O" | null;
  winningLine: number[] | null;
  gameOver: boolean;
  selected: number | null; // index of selected edge cell
}

export type QuixoAction =
  | { type: "select"; idx: number }
  | { type: "push"; dir: Dir }
  | { type: "restart" };

const SIZE = 5;

function idx(row: number, col: number): number { return row * SIZE + col; }
function row(i: number): number { return Math.floor(i / SIZE); }
function col(i: number): number { return i % SIZE; }

/** Edge cells that can be picked by a player */
function edgeCells(): number[] {
  const cells: number[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (r === 0 || r === SIZE - 1 || c === 0 || c === SIZE - 1) {
        cells.push(idx(r, c));
      }
    }
  }
  return cells;
}

function canSelect(grid: Cell[], cellIdx: number, player: "X" | "O"): boolean {
  const cell = grid[cellIdx];
  return cell === null || cell === player;
}

/** Valid push directions for a given edge cell index */
function validDirs(cellIdx: number): Dir[] {
  const r = row(cellIdx);
  const c = col(cellIdx);
  const dirs: Dir[] = [];
  if (c > 0) dirs.push("left");
  if (c < SIZE - 1) dirs.push("right");
  if (r > 0) dirs.push("up");
  if (r < SIZE - 1) dirs.push("down");
  return dirs;
}

/** Slide a row or column: remove cell at `from`, insert at `to`, shift others */
function applyPush(grid: Cell[], cellIdx: number, dir: Dir, mark: "X" | "O"): Cell[] {
  const r = row(cellIdx);
  const c = col(cellIdx);
  const next = [...grid];

  if (dir === "right") {
    // Row r: take from col c, insert at col SIZE-1, shift cols c+1..SIZE-1 left by 1
    for (let cc = c; cc < SIZE - 1; cc++) {
      next[idx(r, cc)] = next[idx(r, cc + 1)]!;
    }
    next[idx(r, SIZE - 1)] = mark;
  } else if (dir === "left") {
    for (let cc = c; cc > 0; cc--) {
      next[idx(r, cc)] = next[idx(r, cc - 1)]!;
    }
    next[idx(r, 0)] = mark;
  } else if (dir === "down") {
    for (let rr = r; rr < SIZE - 1; rr++) {
      next[idx(rr, c)] = next[idx(rr + 1, c)]!;
    }
    next[idx(SIZE - 1, c)] = mark;
  } else {
    // up
    for (let rr = r; rr > 0; rr--) {
      next[idx(rr, c)] = next[idx(rr - 1, c)]!;
    }
    next[idx(0, c)] = mark;
  }

  return next;
}

function checkWinner(grid: Cell[]): { winner: "X" | "O" | null; line: number[] | null } {
  // Check rows
  for (let r = 0; r < SIZE; r++) {
    const val = grid[idx(r, 0)];
    if (val && [1, 2, 3, 4].every((c) => grid[idx(r, c)] === val)) {
      return { winner: val, line: [0, 1, 2, 3, 4].map((c) => idx(r, c)) };
    }
  }
  // Check cols
  for (let c = 0; c < SIZE; c++) {
    const val = grid[idx(0, c)];
    if (val && [1, 2, 3, 4].every((r) => grid[idx(r, c)] === val)) {
      return { winner: val, line: [0, 1, 2, 3, 4].map((r) => idx(r, c)) };
    }
  }
  // Diagonals
  const d1val = grid[idx(0, 0)];
  if (d1val && [1, 2, 3, 4].every((i) => grid[idx(i, i)] === d1val)) {
    return { winner: d1val, line: [0, 1, 2, 3, 4].map((i) => idx(i, i)) };
  }
  const d2val = grid[idx(0, SIZE - 1)];
  if (d2val && [1, 2, 3, 4].every((i) => grid[idx(i, SIZE - 1 - i)] === d2val)) {
    return { winner: d2val, line: [0, 1, 2, 3, 4].map((i) => idx(i, SIZE - 1 - i)) };
  }
  return { winner: null, line: null };
}

function scoreGrid(grid: Cell[], mark: "X" | "O"): number {
  let score = 0;
  const opp: Cell = mark === "X" ? "O" : "X";
  // Count marks in each line of 5
  const lines: number[][] = [];
  for (let r = 0; r < SIZE; r++) lines.push([0, 1, 2, 3, 4].map((c) => idx(r, c)));
  for (let c = 0; c < SIZE; c++) lines.push([0, 1, 2, 3, 4].map((r) => idx(r, c)));
  lines.push([0, 1, 2, 3, 4].map((i) => idx(i, i)));
  lines.push([0, 1, 2, 3, 4].map((i) => idx(i, SIZE - 1 - i)));

  for (const line of lines) {
    const markCount = line.filter((i) => grid[i] === mark).length;
    const oppCount = line.filter((i) => grid[i] === opp).length;
    if (oppCount === 0) score += markCount * markCount;
    if (markCount === 0) score -= oppCount * oppCount;
  }
  return score;
}

function botMoveEasy(grid: Cell[], rng: () => number): { cellIdx: number; dir: Dir } {
  const edges = edgeCells().filter((i) => canSelect(grid, i, "O"));
  const cellIdx = edges[Math.floor(rng() * edges.length)] ?? edges[0]!;
  const dirs = validDirs(cellIdx);
  const dir = dirs[Math.floor(rng() * dirs.length)]!;
  return { cellIdx, dir };
}

function botMoveHard(grid: Cell[], rng: () => number): { cellIdx: number; dir: Dir } {
  // Minimax depth 2
  const edges = edgeCells().filter((i) => canSelect(grid, i, "O"));
  let bestScore = -Infinity;
  let bestMove: { cellIdx: number; dir: Dir } = botMoveEasy(grid, rng);

  for (const cellIdx of edges) {
    for (const dir of validDirs(cellIdx)) {
      const next = applyPush(grid, cellIdx, dir, "O");
      const { winner } = checkWinner(next);
      if (winner === "O") return { cellIdx, dir };

      // Depth 2: look at X responses
      let worstX = Infinity;
      const xEdges = edgeCells().filter((i) => canSelect(next, i, "X"));
      for (const xi of xEdges) {
        for (const xd of validDirs(xi)) {
          const xNext = applyPush(next, xi, xd, "X");
          const { winner: xw } = checkWinner(xNext);
          if (xw === "X") { worstX = -10000; break; }
          const s = scoreGrid(xNext, "O");
          if (s < worstX) worstX = s;
        }
        if (worstX === -10000) break;
      }

      const score = worstX === Infinity ? scoreGrid(next, "O") : worstX;
      if (score > bestScore) {
        bestScore = score;
        bestMove = { cellIdx, dir };
      }
    }
  }
  return bestMove;
}

export function initialState(seed: number, settings: QuixoSettings): QuixoState {
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

export function reducer(state: QuixoState, action: QuixoAction): QuixoState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);

  if (state.gameOver || state.turn !== "X") return state;

  if (action.type === "select") {
    const { idx: cellIdx } = action;
    if (!edgeCells().includes(cellIdx)) return state;
    if (!canSelect(state.grid, cellIdx, "X")) return state;
    return { ...state, selected: state.selected === cellIdx ? null : cellIdx };
  }

  if (action.type === "push") {
    if (state.selected === null) return state;
    const { dir } = action;
    if (!validDirs(state.selected).includes(dir)) return state;

    const newGrid = applyPush(state.grid, state.selected, dir, "X");
    const { winner, line } = checkWinner(newGrid);

    if (winner !== null) {
      return { ...state, grid: newGrid, winner, winningLine: line, gameOver: true, turn: "O", selected: null };
    }

    // Bot move
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    const botMove =
      state.settings.botStrength === "hard"
        ? botMoveHard(newGrid, rng)
        : botMoveEasy(newGrid, rng);

    const botGrid = applyPush(newGrid, botMove.cellIdx, botMove.dir, "O");
    const { winner: botWinner, line: botLine } = checkWinner(botGrid);

    return {
      ...state,
      rngSeed: nextSeed,
      grid: botGrid,
      turn: "X",
      winner: botWinner,
      winningLine: botLine,
      gameOver: botWinner !== null,
      selected: null,
    };
  }

  return state;
}

export function isTerminal(state: QuixoState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.winner === "X" ? 100 : 0 };
}

export { edgeCells, canSelect, validDirs, SIZE };
