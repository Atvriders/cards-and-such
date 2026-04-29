import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BabyloniaTilesSettings { mode: "easy"; }

export type Cell = "" | "X" | "O";

export interface BabyloniaTilesState {
  rngSeed: number;
  board: Cell[];
  turn: "X" | "O";
  phase: "playing" | "gameover";
  result: { player: number; cpu: number } | null;
}

export type BabyloniaTilesAction = { type: "play"; index: number };

function nextRng(seed: number): { v: number; nextSeed: number } {
  const rng = mulberry32(seed);
  const v = rng();
  return { v, nextSeed: (seed + 999) >>> 0 };
}

export function initialState(seed: number, _s: BabyloniaTilesSettings): BabyloniaTilesState {
  return { rngSeed: seed >>> 0, board: ["","","","","","","","",""], turn: "X", phase: "playing", result: null };
}

export function score(board: Cell[]): { player: number; cpu: number } {
  // Each tile = 1 pt; row of 3 same = +5
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];
  let p = board.filter(c => c === "X").length;
  let c = board.filter(c => c === "O").length;
  for (const line of lines) {
    const cells = line.map(i => board[i]);
    if (cells.every(x => x === "X")) p += 5;
    else if (cells.every(x => x === "O")) c += 5;
  }
  return { player: p, cpu: c };
}

export function reducer(state: BabyloniaTilesState, action: BabyloniaTilesAction): BabyloniaTilesState {
  if (state.phase === "gameover") return state;
  if (action.type !== "play") return state;
  if (state.board[action.index] !== "") return state;
  const board = [...state.board];
  board[action.index] = "X";
  // CPU random move
  const empties: number[] = [];
  for (let i = 0; i < 9; i++) if (board[i] === "") empties.push(i);
  let nextSeed = state.rngSeed;
  if (empties.length > 0) {
    const r = nextRng(state.rngSeed);
    const idx = empties[Math.floor(r.v * empties.length)]!;
    board[idx] = "O";
    nextSeed = r.nextSeed;
  }
  const filled = board.every(c => c !== "");
  if (filled) {
    const result = score(board);
    return { ...state, board, rngSeed: nextSeed, phase: "gameover", result };
  }
  return { ...state, board, rngSeed: nextSeed };
}

export function isTerminal(state: BabyloniaTilesState): { score: number } | null {
  if (state.phase !== "gameover" || !state.result) return null;
  const { player, cpu } = state.result;
  return { score: player + (player > cpu ? 10 : 0) };
}
