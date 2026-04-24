import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PegSolitairePlusSettings {
  variant: "diamond" | "plus";
}

export interface PegSolitairePlusState {
  settings: PegSolitairePlusSettings;
  board: readonly number[]; // 0=invalid, 1=peg, 2=empty hole
  boardSize: number;
  selected: number | null;
  pegsLeft: number;
  movesMade: number;
  won: boolean;
  stuck: boolean;
}

export type PegSolitairePlusAction =
  | { type: "select"; index: number }
  | { type: "move"; index: number };

// Diamond board: rotate square 45° — all cells within Manhattan distance 4 of center (4,4) in 9x9
function makeDiamond(): number[] {
  const size = 9;
  const b = new Array<number>(size * size).fill(0);
  const cx = 4, cy = 4;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (Math.abs(r - cy) + Math.abs(c - cx) <= 4) {
        b[r * size + c] = 1;
      }
    }
  }
  b[cy * size + cx] = 2; // center hole
  return b;
}

// Plus board: 5-wide cross in 9x9
function makePlus(): number[] {
  const size = 9;
  const b = new Array<number>(size * size).fill(0);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (r >= 3 && r <= 5) b[r * size + c] = 1;
      else if (c >= 3 && c <= 5) b[r * size + c] = 1;
    }
  }
  b[4 * size + 4] = 2; // center hole
  return b;
}

function countPegs(board: readonly number[]): number {
  return board.filter((v) => v === 1).length;
}

function getLegalMoves(board: readonly number[], size: number): Array<[number, number]> {
  const moves: Array<[number, number]> = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== 1) continue;
    const r = Math.floor(i / size), c = i % size;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as [number,number][]) {
      const mr = r + dr, mc = c + dc;
      const er = r + 2 * dr, ec = c + 2 * dc;
      if (mr < 0 || mr >= size || mc < 0 || mc >= size) continue;
      if (er < 0 || er >= size || ec < 0 || ec >= size) continue;
      const midIdx = mr * size + mc;
      const endIdx = er * size + ec;
      if (board[midIdx] === 1 && board[endIdx] === 2) moves.push([i, endIdx]);
    }
  }
  return moves;
}

export function initialState(seed: number, settings: PegSolitairePlusSettings): PegSolitairePlusState {
  void mulberry32(seed);
  const board = settings.variant === "diamond" ? makeDiamond() : makePlus();
  return {
    settings,
    board,
    boardSize: 9,
    selected: null,
    pegsLeft: countPegs(board),
    movesMade: 0,
    won: false,
    stuck: false,
  };
}

export function reducer(state: PegSolitairePlusState, action: PegSolitairePlusAction): PegSolitairePlusState {
  if (state.won || state.stuck) return state;
  const { board, boardSize } = state;

  if (action.type === "select") {
    const { index } = action;
    if (index < 0 || index >= board.length) return state;
    if (board[index] !== 1) return { ...state, selected: null };
    return { ...state, selected: index };
  }

  if (action.type === "move") {
    if (state.selected === null) return state;
    const from = state.selected;
    const to = action.index;
    if (board[to] !== 2) return { ...state, selected: to === from ? null : state.selected };

    const fr = Math.floor(from / boardSize), fc = from % boardSize;
    const tr = Math.floor(to / boardSize), tc = to % boardSize;
    const dr = tr - fr, dc = tc - fc;
    if ((Math.abs(dr) !== 2 || dc !== 0) && (Math.abs(dc) !== 2 || dr !== 0)) return state;
    const mr = fr + dr / 2, mc = fc + dc / 2;
    const midIdx = mr * boardSize + mc;
    if (board[midIdx] !== 1) return state;

    const newBoard = board.slice() as number[];
    newBoard[from] = 2;
    newBoard[midIdx] = 2;
    newBoard[to] = 1;

    const pegsLeft = countPegs(newBoard);
    const won = pegsLeft === 1;
    const stuck = !won && getLegalMoves(newBoard, boardSize).length === 0;

    return { ...state, board: newBoard, selected: null, pegsLeft, won, stuck, movesMade: state.movesMade + 1 };
  }

  return state;
}

export function isTerminal(state: PegSolitairePlusState): { score: number } | null {
  if (state.won) return { score: 1000 };
  if (state.stuck) return { score: Math.max(0, Math.floor((1 / state.pegsLeft) * 200)) };
  return null;
}
