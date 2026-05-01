import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pentago Mini: 4×4 board made of 4 quadrants of 2×2.
// Place a marble, then rotate any quadrant 90° (CW or CCW). 4-in-a-row wins.

export const SIZE = 4;
export const TARGET = 4;

export type Cell = 0 | 1 | null; // 0 = player (black), 1 = bot (white)

export interface PentagoMiniSettings {
  botStrength: "easy" | "hard";
}

export interface PentagoMiniState {
  settings: PentagoMiniSettings;
  board: readonly Cell[];
  turn: 0 | 1;
  phase: "place" | "rotate";
  lastPlaced: number | null;
  winner: 0 | 1 | "draw" | null;
  movesMade: number;
  rngSeed: number;
}

export type RotateDir = "cw" | "ccw";

export type PentagoMiniAction =
  | { type: "place"; pos: number }
  | { type: "rotate"; quadrant: 0 | 1 | 2 | 3; dir: RotateDir };

const QUAD_OFFSETS = [
  { row: 0, col: 0 },
  { row: 0, col: 2 },
  { row: 2, col: 0 },
  { row: 2, col: 2 },
] as const;

export function rcToPos(r: number, c: number): number { return r * SIZE + c; }

const DIRECTIONS = [
  [0, 1], [1, 0], [1, 1], [1, -1],
] as const;

export function rotateQuadrant(board: readonly Cell[], q: 0 | 1 | 2 | 3, dir: RotateDir): Cell[] {
  const next = [...board] as Cell[];
  const { row: qr, col: qc } = QUAD_OFFSETS[q];
  const cells: Cell[][] = [
    [board[rcToPos(qr, qc)]!, board[rcToPos(qr, qc + 1)]!],
    [board[rcToPos(qr + 1, qc)]!, board[rcToPos(qr + 1, qc + 1)]!],
  ];
  let rot: Cell[][];
  if (dir === "cw") {
    rot = [
      [cells[1]![0]!, cells[0]![0]!],
      [cells[1]![1]!, cells[0]![1]!],
    ];
  } else {
    rot = [
      [cells[0]![1]!, cells[1]![1]!],
      [cells[0]![0]!, cells[1]![0]!],
    ];
  }
  next[rcToPos(qr, qc)] = rot[0]![0]!;
  next[rcToPos(qr, qc + 1)] = rot[0]![1]!;
  next[rcToPos(qr + 1, qc)] = rot[1]![0]!;
  next[rcToPos(qr + 1, qc + 1)] = rot[1]![1]!;
  return next;
}

export function checkWin(board: readonly Cell[]): 0 | 1 | "draw" | null {
  let winner: 0 | 1 | null = null;
  for (const [dr, dc] of DIRECTIONS) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const v = board[rcToPos(r, c)];
        if (v === null) continue;
        let count = 1;
        for (let i = 1; i < TARGET; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;
          if (board[rcToPos(nr, nc)] !== v) break;
          count++;
        }
        if (count >= TARGET) {
          const ws = v as 0 | 1;
          if (winner !== null && winner !== ws) return "draw";
          winner = ws;
        }
      }
    }
  }
  if (winner !== null) return winner;
  if (board.every((c) => c !== null)) return "draw";
  return null;
}

interface BotMove {
  pos: number;
  quadrant: 0 | 1 | 2 | 3;
  dir: RotateDir;
}

function evalBoard(board: readonly Cell[], seat: 0 | 1): number {
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  const w = checkWin(board);
  if (w === seat) return 100000;
  if (w === opp) return -100000;
  if (w === "draw") return 0;
  let score = 0;
  for (const [dr, dc] of DIRECTIONS) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        let me = 0, them = 0, valid = true;
        for (let i = 0; i < TARGET; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) { valid = false; break; }
          const v = board[rcToPos(nr, nc)];
          if (v === seat) me++;
          else if (v === opp) them++;
        }
        if (!valid) continue;
        if (them === 0 && me > 0) score += me * me * 5;
        if (me === 0 && them > 0) score -= them * them * 6;
      }
    }
  }
  return score;
}

function pickBot(state: PentagoMiniState): BotMove | null {
  const moves: BotMove[] = [];
  for (let pos = 0; pos < SIZE * SIZE; pos++) {
    if (state.board[pos] !== null) continue;
    for (let q = 0; q < 4; q++) {
      for (const dir of ["cw", "ccw"] as RotateDir[]) {
        moves.push({ pos, quadrant: q as 0 | 1 | 2 | 3, dir });
      }
    }
  }
  if (moves.length === 0) return null;

  // Win-now
  for (const m of moves) {
    const b = [...state.board] as Cell[];
    b[m.pos] = 1;
    const after = rotateQuadrant(b, m.quadrant, m.dir);
    if (checkWin(after) === 1) return m;
  }

  if (state.settings.botStrength === "easy") {
    const rng = mulberry32(state.rngSeed);
    return moves[Math.floor(rng() * moves.length)]!;
  }
  let best = moves[0]!;
  let bs = -Infinity;
  for (const m of moves) {
    const b = [...state.board] as Cell[];
    b[m.pos] = 1;
    const after = rotateQuadrant(b, m.quadrant, m.dir);
    const s = evalBoard(after, 1);
    if (s > bs) { bs = s; best = m; }
  }
  return best;
}

export function initialState(seed: number, settings: PentagoMiniSettings): PentagoMiniState {
  return {
    settings,
    board: new Array(SIZE * SIZE).fill(null),
    turn: 0,
    phase: "place",
    lastPlaced: null,
    winner: null,
    movesMade: 0,
    rngSeed: seed,
  };
}

export function reducer(state: PentagoMiniState, action: PentagoMiniAction): PentagoMiniState {
  if (state.winner !== null) return state;

  if (action.type === "place") {
    if (state.turn !== 0 || state.phase !== "place") return state;
    if (action.pos < 0 || action.pos >= SIZE * SIZE) return state;
    if (state.board[action.pos] !== null) return state;
    const newBoard = [...state.board] as Cell[];
    newBoard[action.pos] = 0;
    return { ...state, board: newBoard, phase: "rotate", lastPlaced: action.pos };
  }

  if (action.type === "rotate") {
    if (state.turn !== 0 || state.phase !== "rotate") return state;
    const rotated = rotateQuadrant(state.board, action.quadrant, action.dir);
    const w = checkWin(rotated);
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    if (w !== null) {
      return {
        ...state, board: rotated, winner: w,
        movesMade: state.movesMade + 1, phase: "place", lastPlaced: null,
        rngSeed: nextSeed,
      };
    }
    const botState: PentagoMiniState = {
      ...state, board: rotated, turn: 1,
      movesMade: state.movesMade + 1, phase: "place", lastPlaced: null,
      rngSeed: nextSeed,
    };
    const bm = pickBot(botState);
    if (!bm) return { ...botState, winner: "draw" };
    const b2 = [...rotated] as Cell[];
    b2[bm.pos] = 1;
    const r2 = rotateQuadrant(b2, bm.quadrant, bm.dir);
    const w2 = checkWin(r2);
    return {
      ...botState, board: r2, turn: 0,
      movesMade: botState.movesMade + 1, winner: w2,
      rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    };
  }

  return state;
}

export function isTerminal(state: PentagoMiniState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  if (state.winner === "draw") return { score: 50 };
  return { score: 0 };
}
