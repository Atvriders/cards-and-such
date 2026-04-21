import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TTT3DSettings {
  botStrength: "easy" | "hard";
}

export type Cell = "X" | "O" | null;
export type Coord3D = [number, number, number]; // [layer, row, col], all 0-3

export interface TTT3DState {
  settings: TTT3DSettings;
  rngSeed: number;
  board: Cell[][][]; // [4][4][4]
  turn: "X" | "O";
  winner: "X" | "O" | "draw" | null;
  winningLine: Coord3D[] | null;
}

export type TTT3DAction = { type: "place"; at: Coord3D };

function emptyBoard(): Cell[][][] {
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => null as Cell)
    )
  );
}

function getCell(board: Cell[][][], [l, r, c]: Coord3D): Cell {
  return board[l]?.[r]?.[c] ?? null;
}

function setCell(board: Cell[][][], [l, r, c]: Coord3D, val: Cell): Cell[][][] {
  const next = board.map((layer, li) =>
    li === l ? layer.map((row, ri) =>
      ri === r ? row.map((cell, ci) => ci === c ? val : cell) : row
    ) : layer
  );
  return next;
}

/** Generate all 76 winning lines in 4x4x4 */
function allLines(): Coord3D[][] {
  const lines: Coord3D[][] = [];

  // Helper to add 4-in-a-row line given start + direction
  function addLine(start: Coord3D, dl: number, dr: number, dc: number) {
    const line: Coord3D[] = [];
    for (let i = 0; i < 4; i++) {
      line.push([start[0] + dl * i, start[1] + dr * i, start[2] + dc * i]);
    }
    if (line.every(([l, r, c]) => l >= 0 && l < 4 && r >= 0 && r < 4 && c >= 0 && c < 4)) {
      lines.push(line);
    }
  }

  // Within each layer: rows, cols, diagonals
  for (let l = 0; l < 4; l++) {
    for (let r = 0; r < 4; r++) addLine([l, r, 0], 0, 0, 1);
    for (let c = 0; c < 4; c++) addLine([l, 0, c], 0, 1, 0);
    addLine([l, 0, 0], 0, 1, 1);
    addLine([l, 0, 3], 0, 1, -1);
  }

  // Through layers: vertical columns, diagonals through layers
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) addLine([0, r, c], 1, 0, 0);

  // Diagonals through layers in each "plane"
  for (let r = 0; r < 4; r++) {
    addLine([0, r, 0], 1, 0, 1);
    addLine([0, r, 3], 1, 0, -1);
  }
  for (let c = 0; c < 4; c++) {
    addLine([0, 0, c], 1, 1, 0);
    addLine([0, 3, c], 1, -1, 0);
  }

  // Space diagonals (4 main)
  addLine([0, 0, 0], 1, 1, 1);
  addLine([0, 0, 3], 1, 1, -1);
  addLine([0, 3, 0], 1, -1, 1);
  addLine([0, 3, 3], 1, -1, -1);

  return lines;
}

const WINNING_LINES = allLines();

function checkWinner(board: Cell[][][]): { winner: "X" | "O" | "draw" | null; winningLine: Coord3D[] | null } {
  for (const line of WINNING_LINES) {
    const vals = line.map((coord) => getCell(board, coord));
    if (vals[0] !== null && vals.every((v) => v === vals[0])) {
      return { winner: vals[0] as "X" | "O", winningLine: line };
    }
  }
  // Check draw
  const full = board.every((layer) => layer.every((row) => row.every((cell) => cell !== null)));
  if (full) return { winner: "draw", winningLine: null };
  return { winner: null, winningLine: null };
}

function emptyCells(board: Cell[][][]): Coord3D[] {
  const cells: Coord3D[] = [];
  for (let l = 0; l < 4; l++) for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    if (board[l]![r]![c] === null) cells.push([l, r, c]);
  }
  return cells;
}

/** Simple threat-detection heuristic eval for minimax */
function evaluate(board: Cell[][][], turn: "X" | "O"): number {
  const { winner } = checkWinner(board);
  if (winner === "O") return 10000;
  if (winner === "X") return -10000;
  if (winner === "draw") return 0;

  let score = 0;
  for (const line of WINNING_LINES) {
    const vals = line.map((coord) => getCell(board, coord));
    const oCount = vals.filter((v) => v === "O").length;
    const xCount = vals.filter((v) => v === "X").length;
    if (oCount > 0 && xCount > 0) continue; // blocked
    if (oCount > 0) score += oCount * oCount;
    if (xCount > 0) score -= xCount * xCount;
  }
  return score;
}

function minimax(board: Cell[][][], turn: "X" | "O", depth: number, alpha: number, beta: number): number {
  const { winner } = checkWinner(board);
  if (winner === "O") return 10000 + depth;
  if (winner === "X") return -(10000 + depth);
  if (winner === "draw") return 0;
  if (depth === 0) return evaluate(board, turn);

  const cells = emptyCells(board);
  if (turn === "O") {
    let best = -Infinity;
    for (const coord of cells) {
      const next = setCell(board, coord, "O");
      best = Math.max(best, minimax(next, "X", depth - 1, alpha, beta));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const coord of cells) {
      const next = setCell(board, coord, "X");
      best = Math.min(best, minimax(next, "O", depth - 1, alpha, beta));
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function botMove(board: Cell[][][], rng: () => number, strength: "easy" | "hard"): Coord3D | null {
  const cells = emptyCells(board);
  if (cells.length === 0) return null;

  if (strength === "easy") {
    return cells[Math.floor(rng() * cells.length)]!;
  }

  // Hard: depth-3 minimax
  let bestVal = -Infinity;
  let bestMove: Coord3D = cells[0]!;
  for (const coord of cells) {
    const next = setCell(board, coord, "O");
    const val = minimax(next, "X", 3, -Infinity, Infinity);
    if (val > bestVal) { bestVal = val; bestMove = coord; }
  }
  return bestMove;
}

export function initialState(seed: number, settings: TTT3DSettings): TTT3DState {
  return {
    settings,
    rngSeed: seed >>> 0,
    board: emptyBoard(),
    turn: "X",
    winner: null,
    winningLine: null,
  };
}

export function reducer(state: TTT3DState, action: TTT3DAction): TTT3DState {
  if (action.type !== "place") return state;
  if (state.winner !== null) return state;
  if (state.turn !== "X") return state;

  const [l, r, c] = action.at;
  if (l < 0 || l > 3 || r < 0 || r > 3 || c < 0 || c > 3) return state;
  if (getCell(state.board, action.at) !== null) return state;

  const board1 = setCell(state.board, action.at, "X");
  const { winner: w1, winningLine: wl1 } = checkWinner(board1);

  if (w1 !== null) {
    return { ...state, board: board1, turn: "O", winner: w1, winningLine: wl1 };
  }

  // Bot move
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;
  const at2 = botMove(board1, mulberry32(nextSeed), state.settings.botStrength);

  if (!at2) {
    return { ...state, board: board1, turn: "O", winner: "draw", winningLine: null };
  }

  const board2 = setCell(board1, at2, "O");
  const { winner: w2, winningLine: wl2 } = checkWinner(board2);

  return {
    ...state,
    rngSeed: nextSeed,
    board: board2,
    turn: "X",
    winner: w2,
    winningLine: wl2,
  };
}

export function isTerminal(state: TTT3DState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === "X") return { score: 1000 };
  if (state.winner === "draw") return { score: 200 };
  return { score: 0 };
}
