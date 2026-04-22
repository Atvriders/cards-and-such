import { minimax } from "../../engines/grid/minimax.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pentago: 6×6 board, 4 quadrants of 3×3.
// Turn: place a marble, then rotate one quadrant 90° CW or CCW.
// Win: 5 in a row (horizontal, vertical, diagonal).

export type Cell = 0 | 1 | null; // 0 = player (black), 1 = bot (white)

export interface PentagoSettings {
  dummy?: string;
}

export interface PentagoState {
  settings: PentagoSettings;
  board: readonly Cell[]; // 36 cells, row-major
  turn: 0 | 1;
  winner: 0 | 1 | "draw" | null;
  movesMade: number;
  rngSeed: number;
  // Phase: "place" -> "rotate" (for human), bot does both atomically
  phase: "place" | "rotate";
  lastPlaced: number | null; // position of last placed marble
}

export type RotateDir = "cw" | "ccw";

export type PentagoAction =
  | { type: "place"; pos: number }
  | { type: "rotate"; quadrant: 0 | 1 | 2 | 3; dir: RotateDir };

const SIZE = 6;

// Quadrant top-left corners: q0=top-left, q1=top-right, q2=bottom-left, q3=bottom-right
const QUAD_OFFSETS = [
  { row: 0, col: 0 }, // q0
  { row: 0, col: 3 }, // q1
  { row: 3, col: 0 }, // q2
  { row: 3, col: 3 }, // q3
] as const;

export function posToRC(pos: number): { row: number; col: number } {
  return { row: Math.floor(pos / SIZE), col: pos % SIZE };
}
export function rcToPos(row: number, col: number): number {
  return row * SIZE + col;
}

// Rotate a 3×3 quadrant CW or CCW
function rotateQuadrant(board: readonly Cell[], quadrant: 0 | 1 | 2 | 3, dir: RotateDir): Cell[] {
  const next = [...board] as Cell[];
  const { row: qr, col: qc } = QUAD_OFFSETS[quadrant];
  // Extract 3×3
  const q: Cell[][] = Array.from({ length: 3 }, (_, r) =>
    Array.from({ length: 3 }, (_, c) => board[rcToPos(qr + r, qc + c)] as Cell)
  );
  // Rotate
  const rot: Cell[][] = Array.from({ length: 3 }, () => new Array(3).fill(null));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (dir === "cw") {
        rot[c]![2 - r] = q[r]![c]!;
      } else {
        rot[2 - c]![r] = q[r]![c]!;
      }
    }
  }
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      next[rcToPos(qr + r, qc + c)] = rot[r]![c]!;
    }
  }
  return next;
}

const DIRECTIONS = [
  [0, 1], [1, 0], [1, 1], [1, -1],
] as const;

function checkFiveInRow(board: readonly Cell[]): 0 | 1 | "draw" | null {
  let winner: 0 | 1 | null = null;
  for (const [dr, dc] of DIRECTIONS) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const v = board[rcToPos(r, c)];
        if (v === null) continue;
        let count = 1;
        for (let i = 1; i < 5; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;
          if (board[rcToPos(nr, nc)] !== v) break;
          count++;
        }
        if (count >= 5) {
          const vSeat = v as 0 | 1;
          if (winner !== null && winner !== vSeat) return "draw"; // both win simultaneously
          winner = vSeat;
        }
      }
    }
  }
  if (winner !== null) return winner;
  if (board.every((c) => c !== null)) return "draw";
  return null;
}

// Count open sequences of given length for evaluation
function countThreats(board: readonly Cell[], seat: Cell, len: number): number {
  let count = 0;
  for (const [dr, dc] of DIRECTIONS) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        let match = 0;
        let blocked = 0;
        for (let i = 0; i < len; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) { blocked++; break; }
          const v = board[rcToPos(nr, nc)];
          if (v === seat) match++;
          else if (v !== null) { blocked++; break; }
        }
        if (match >= len && blocked === 0) count++;
      }
    }
  }
  return count;
}

interface BotSearchMove {
  pos: number;
  quadrant: 0 | 1 | 2 | 3;
  dir: RotateDir;
}

interface BotSearchState {
  board: readonly Cell[];
  turn: 0 | 1;
}

function evalBoard(board: readonly Cell[], seat: 0 | 1): number {
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  const w = checkFiveInRow(board);
  if (w === seat) return 100000;
  if (w === (opp as Cell)) return -100000;
  if (w === "draw") return 0;
  return (
    countThreats(board, seat, 4) * 500 +
    countThreats(board, seat, 3) * 50 +
    countThreats(board, seat, 2) * 5 -
    countThreats(board, opp, 4) * 600 -
    countThreats(board, opp, 3) * 60 -
    countThreats(board, opp, 2) * 6
  );
}

const DIRS: RotateDir[] = ["cw", "ccw"];

function getBotMove(state: PentagoState): BotSearchMove | null {
  const result = minimax<BotSearchState, BotSearchMove>(
    { board: state.board, turn: 1 },
    {
      depth: 2,
      moves(s) {
        if (checkFiveInRow(s.board) !== null) return [];
        const ms: BotSearchMove[] = [];
        for (let pos = 0; pos < 36; pos++) {
          if (s.board[pos] !== null) continue;
          const b = [...s.board] as Cell[];
          b[pos] = s.turn;
          for (let q = 0; q < 4; q++) {
            for (const dir of DIRS) {
              ms.push({ pos, quadrant: q as 0 | 1 | 2 | 3, dir });
            }
          }
        }
        return ms;
      },
      apply(s, m) {
        const b = [...s.board] as Cell[];
        b[m.pos] = s.turn;
        const rotated = rotateQuadrant(b, m.quadrant, m.dir);
        return { board: rotated, turn: (s.turn === 0 ? 1 : 0) as 0 | 1 };
      },
      isTerminal(s) { return checkFiveInRow(s.board) !== null; },
      evaluate(s) { return evalBoard(s.board, 1); },
      maximizing(s) { return s.turn === 1; },
    }
  );
  return result.move;
}

export function initialState(seed: number, settings: PentagoSettings): PentagoState {
  return {
    settings,
    board: new Array(36).fill(null),
    turn: 0,
    winner: null,
    movesMade: 0,
    rngSeed: seed,
    phase: "place",
    lastPlaced: null,
  };
}

export function reducer(state: PentagoState, action: PentagoAction): PentagoState {
  if (state.winner !== null) return state;

  if (action.type === "place") {
    if (state.turn !== 0 || state.phase !== "place") return state;
    if (action.pos < 0 || action.pos >= 36) return state;
    if (state.board[action.pos] !== null) return state;

    const newBoard = [...state.board] as Cell[];
    newBoard[action.pos] = 0;

    // Check win immediately (before rotation — Pentago rules say you check after rotation,
    // but we store lastPlaced and wait for rotate action)
    return {
      ...state,
      board: newBoard,
      phase: "rotate",
      lastPlaced: action.pos,
    };
  }

  if (action.type === "rotate") {
    if (state.turn !== 0 || state.phase !== "rotate") return state;
    const rotated = rotateQuadrant(state.board, action.quadrant, action.dir);
    const w = checkFiveInRow(rotated);

    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    if (w !== null) {
      return {
        ...state,
        board: rotated,
        winner: w,
        movesMade: state.movesMade + 1,
        phase: "place",
        lastPlaced: null,
        rngSeed: nextSeed,
      };
    }

    // Bot's turn
    const botState: PentagoState = {
      ...state,
      board: rotated,
      turn: 1,
      movesMade: state.movesMade + 1,
      phase: "place",
      lastPlaced: null,
      rngSeed: nextSeed,
    };

    const botMove = getBotMove(botState);
    if (!botMove) {
      return { ...botState, winner: "draw" };
    }

    const b2 = [...rotated] as Cell[];
    b2[botMove.pos] = 1;
    const rotated2 = rotateQuadrant(b2, botMove.quadrant, botMove.dir);
    const w2 = checkFiveInRow(rotated2);

    return {
      ...botState,
      board: rotated2,
      turn: 0,
      movesMade: botState.movesMade + 1,
      winner: w2,
      rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    };
  }

  return state;
}

export function isTerminal(state: PentagoState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  if (state.winner === "draw") return { score: 50 };
  return { score: 0 };
}

export { rotateQuadrant, checkFiveInRow };
