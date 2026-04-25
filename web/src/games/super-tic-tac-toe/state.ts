import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Super Tic-Tac-Toe (Ultimate): 9 local boards inside a global board
// Winner of a local board claims that cell in the global board

export type Cell = "X" | "O" | null;
export type Phase = "playing" | "done";

export interface SuperTTTState {
  rngSeed: number;
  // 9 local boards, each 9 cells
  boards: Cell[][];
  // claimed local boards: "X" | "O" | "D" (draw) | null
  claimed: (Cell | "D")[];
  globalBoard: (Cell | "D")[];
  // which local board must next move go to (-1 = any free)
  nextBoard: number;
  current: "X" | "O";
  winner: Cell | "D" | null;
  phase: Phase;
  moves: number;
}

function emptyBoard(): Cell[] {
  return Array(9).fill(null);
}

export function initialState(seed: number): SuperTTTState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    boards: Array(9).fill(null).map(() => emptyBoard()),
    claimed: Array(9).fill(null),
    globalBoard: Array(9).fill(null),
    nextBoard: -1,
    current: "X",
    winner: null,
    phase: "playing",
    moves: 0,
  };
}

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function checkWinner(cells: (Cell | "D")[]): Cell | "D" | null {
  for (const line of LINES) {
    const a = line[0] ?? 0;
    const b = line[1] ?? 0;
    const c = line[2] ?? 0;
    const ca = cells[a];
    const cb = cells[b];
    const cc = cells[c];
    if (ca && ca !== "D" && ca === cb && cb === cc) {
      return ca as Cell;
    }
  }
  if (cells.every(c => c !== null)) return "D";
  return null;
}

export type SuperAction =
  | { type: "move"; boardIndex: number; cellIndex: number }
  | { type: "reset"; seed: number };

export function reducer(state: SuperTTTState, action: SuperAction): SuperTTTState {
  if (action.type === "reset") return initialState(action.seed);
  if (state.phase === "done") return state;

  const { boardIndex, cellIndex } = action;

  // validate board target
  if (state.nextBoard !== -1 && state.nextBoard !== boardIndex) return state;
  if (state.claimed[boardIndex] !== null) return state;
  const currentBoard = state.boards[boardIndex];
  if (!currentBoard || currentBoard[cellIndex] !== null) return state;

  const newBoards = state.boards.map((b, i) => i === boardIndex ? [...b] : b);
  const targetBoard = newBoards[boardIndex];
  if (targetBoard) targetBoard[cellIndex] = state.current;

  // check if local board now won
  const newClaimed = [...state.claimed] as (Cell | "D")[];
  const localWinner = checkWinner((newBoards[boardIndex] ?? []) as (Cell | "D")[]);
  if (localWinner !== null) {
    newClaimed[boardIndex] = localWinner;
  }

  const newGlobal = newClaimed;
  const globalWinner = checkWinner(newGlobal);

  // determine next board: the cell index tells which board to go to
  let nextBoard: number;
  if (newClaimed[cellIndex] !== null) {
    nextBoard = -1; // that board is done, play anywhere
  } else {
    nextBoard = cellIndex;
  }

  const phase: Phase = globalWinner !== null ? "done" : "playing";

  return {
    ...state,
    boards: newBoards,
    claimed: newClaimed,
    globalBoard: newGlobal,
    nextBoard,
    current: state.current === "X" ? "O" : "X",
    winner: globalWinner,
    phase,
    moves: state.moves + 1,
  };
}

export function isTerminal(state: SuperTTTState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.winner === "X" ? 100 : state.winner === "D" ? 50 : 10 };
}
