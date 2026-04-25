import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Morabaraba — South African 12 Men's Morris
// 24 positions (same topology as Nine Men's Morris but 12 pieces each)
// Cows (pieces) form mills (3 in a line) = remove opponent piece
// Phases: place (12 each), move (slide to adjacent), fly (if 3 left)

export const NUM_PIECES = 12;
export const NUM_POSITIONS = 24;

// Adjacency (same as Nine Men's Morris)
export const ADJACENCY: ReadonlyArray<readonly number[]> = [
  [1, 7], [0, 2, 9], [1, 3], [2, 4, 11], [3, 5], [4, 6, 13], [5, 7], [6, 0, 15],
  [9, 15], [8, 10, 1, 17], [9, 11], [10, 12, 3, 19], [11, 13], [12, 14, 5, 21],
  [13, 15], [14, 8, 7, 23], [17, 23], [16, 18, 9], [17, 19], [18, 20, 11],
  [19, 21], [20, 22, 13], [21, 23], [22, 16, 15],
];

// Mills: sets of 3 positions that form a line
export const MILLS: ReadonlyArray<readonly [number, number, number]> = [
  [0,1,2],[2,3,4],[4,5,6],[6,7,0],
  [8,9,10],[10,11,12],[12,13,14],[14,15,8],
  [16,17,18],[18,19,20],[20,21,22],[22,23,16],
  [1,9,17],[3,11,19],[5,13,21],[7,15,23],
];

export type Cell = "P" | "B" | null;
export type Phase = "place" | "move" | "over";

export interface MorabarabaSettings {
  dummy?: string;
}

export interface MorabarabaState {
  board: Cell[];
  pHand: number;  // pieces left to place
  bHand: number;
  turn: "P" | "B";
  phase: Phase;
  pendingRemove: boolean; // formed a mill, must remove opponent piece
  selected: number | null; // selected piece for move
  winner: "P" | "B" | null;
  rngSeed: number;
  settings: MorabarabaSettings;
}

export type MorabarabaAction =
  | { type: "place"; pos: number }
  | { type: "select"; pos: number }
  | { type: "moveTo"; pos: number }
  | { type: "remove"; pos: number };

function rng(seed: number) { return mulberry32(seed); }

export function initialState(seed: number, settings: MorabarabaSettings): MorabarabaState {
  return {
    board: new Array(NUM_POSITIONS).fill(null),
    pHand: NUM_PIECES,
    bHand: NUM_PIECES,
    turn: "P",
    phase: "place",
    pendingRemove: false,
    selected: null,
    winner: null,
    rngSeed: seed,
    settings,
  };
}

export function formsMill(board: Cell[], pos: number, player: Cell): boolean {
  for (const mill of MILLS) {
    if (mill.includes(pos) && mill.every((p) => board[p] === player)) return true;
  }
  return false;
}

function allInMills(board: Cell[], player: Cell): boolean {
  return board.every((c, i) => c !== player || formsMill(board, i, player));
}

export function canRemove(board: Cell[], pos: number, remover: Cell): boolean {
  const target = remover === "P" ? "B" : "P";
  if (board[pos] !== target) return false;
  // Cannot remove a piece in a mill unless all opponent pieces are in mills
  if (formsMill(board, pos, target) && !allInMills(board, target)) return false;
  return true;
}

function countPieces(board: Cell[], player: Cell): number {
  return board.filter((c) => c === player).length;
}

function getLegalPlaces(board: Cell[]): number[] {
  return board.map((c, i) => (c === null ? i : -1)).filter((i) => i >= 0);
}

function getLegalMoves(board: Cell[], player: Cell): Array<[number, number]> {
  const moves: Array<[number, number]> = [];
  const canFly = countPieces(board, player) === 3;
  for (let from = 0; from < NUM_POSITIONS; from++) {
    if (board[from] !== player) continue;
    const dests = canFly
      ? board.map((c, i) => (c === null ? i : -1)).filter((i) => i >= 0)
      : ADJACENCY[from]!.filter((to) => board[to] === null);
    for (const to of dests) moves.push([from, to]);
  }
  return moves;
}

// ----- Bot AI -----

interface BotState {
  board: Cell[];
  pHand: number;
  bHand: number;
  turn: "P" | "B";
  phase: Phase;
}

function evaluate(s: BotState): number {
  const bCount = countPieces(s.board, "B");
  const pCount = countPieces(s.board, "P");
  let bMills = 0, pMills = 0;
  for (const mill of MILLS) {
    if (mill.every((p) => s.board[p] === "B")) bMills++;
    if (mill.every((p) => s.board[p] === "P")) pMills++;
  }
  return (bCount - pCount) * 10 + (bMills - pMills) * 5;
}

type BotMove =
  | { kind: "place"; pos: number }
  | { kind: "move"; from: number; to: number };

function getBotMoves(s: BotState): BotMove[] {
  if (s.phase === "place") {
    return getLegalPlaces(s.board).map((pos) => ({ kind: "place" as const, pos }));
  }
  return getLegalMoves(s.board, s.turn).map(([from, to]) => ({ kind: "move" as const, from, to }));
}

function applyBotMove(s: BotState, m: BotMove): BotState {
  const board = [...s.board];
  let pHand = s.pHand, bHand = s.bHand;
  const player = s.turn;
  const opp = player === "P" ? "B" : "P";

  if (m.kind === "place") {
    board[m.pos] = player;
    if (player === "P") pHand--;
    else bHand--;
  } else {
    board[m.to] = player;
    board[m.from] = null;
  }

  // If mill formed, remove best opponent piece
  const pos = m.kind === "place" ? m.pos : m.to;
  if (formsMill(board, pos, player)) {
    const removable = board
      .map((c, i) => (canRemove(board, i, player) ? i : -1))
      .filter((i) => i >= 0);
    if (removable.length > 0) {
      // Remove piece that breaks most mills
      let bestRm = removable[0]!;
      let bestScore = -1;
      for (const rm of removable) {
        const inMills = MILLS.filter((mill) => mill.includes(rm) && mill.every((p) => board[p] === opp)).length;
        if (inMills > bestScore) { bestScore = inMills; bestRm = rm; }
      }
      board[bestRm] = null;
    }
  }

  const newPhase = pHand === 0 && bHand === 0 ? "move" : s.phase;
  return { board, pHand, bHand, turn: opp, phase: newPhase };
}

function isTerminalBot(s: BotState): boolean {
  if (s.phase === "move") {
    if (countPieces(s.board, s.turn) < 3) return true;
    if (getLegalMoves(s.board, s.turn).length === 0) return true;
  }
  return false;
}

function runBotMove(state: MorabarabaState): MorabarabaState {
  const bs: BotState = { board: state.board, pHand: state.pHand, bHand: state.bHand, turn: "B", phase: state.phase };
  const result = minimax<BotState, BotMove>(bs, {
    depth: 3,
    moves: getBotMoves,
    apply: applyBotMove,
    isTerminal: isTerminalBot,
    evaluate,
    maximizing: (s) => s.turn === "B",
  });
  if (!result.move) return state;
  const r = rng(state.rngSeed);
  const nextSeed = Math.floor(r() * 2 ** 31);
  const applied = applyBotMove(bs, result.move);
  const newPhase = applied.pHand === 0 && applied.bHand === 0 ? "move" : state.phase;

  // Check win
  let winner: "P" | "B" | null = null;
  if (countPieces(applied.board, "P") < 3 && newPhase === "move") winner = "B";
  if (newPhase === "move" && getLegalMoves(applied.board, "P").length === 0 && countPieces(applied.board, "P") >= 3) winner = "B";

  return {
    ...state,
    board: applied.board,
    pHand: applied.pHand,
    bHand: applied.bHand,
    turn: "P",
    phase: newPhase,
    pendingRemove: false,
    selected: null,
    winner,
    rngSeed: nextSeed,
  };
}

export function reducer(state: MorabarabaState, action: MorabarabaAction): MorabarabaState {
  if (state.winner !== null) return state;
  if (state.turn !== "P") return state;

  const r = rng(state.rngSeed);
  const nextSeed = Math.floor(r() * 2 ** 31);

  // Pending remove
  if (state.pendingRemove) {
    if (action.type !== "remove") return state;
    if (!canRemove(state.board, action.pos, "P")) return state;
    const board = [...state.board];
    board[action.pos] = null;
    const newPhase = state.pHand === 0 && state.bHand === 0 ? "move" : state.phase;
    let winner: "P" | "B" | null = null;
    if (countPieces(board, "B") < 3 && newPhase === "move") winner = "P";

    let next: MorabarabaState = { ...state, board, turn: "B", pendingRemove: false, selected: null, winner, rngSeed: nextSeed, phase: newPhase };
    if (!winner) next = runBotMove(next);
    return next;
  }

  // Place phase
  if (state.phase === "place") {
    if (action.type !== "place") return state;
    if (state.board[action.pos] !== null) return state;
    if (state.pHand <= 0) return state;
    const board = [...state.board];
    board[action.pos] = "P";
    const pHand = state.pHand - 1;
    const milFormed = formsMill(board, action.pos, "P");
    const newPhase = pHand === 0 && state.bHand === 0 ? "move" : state.phase;
    if (milFormed) {
      const removable = board.some((_, i) => canRemove(board, i, "P"));
      if (removable) {
        return { ...state, board, pHand, phase: newPhase, pendingRemove: true, rngSeed: nextSeed };
      }
    }
    let next: MorabarabaState = { ...state, board, pHand, turn: "B", phase: newPhase, rngSeed: nextSeed };
    next = runBotMove(next);
    return next;
  }

  // Move phase
  if (state.phase === "move") {
    if (action.type === "select") {
      if (state.board[action.pos] !== "P") return state;
      return { ...state, selected: action.pos };
    }
    if (action.type === "moveTo") {
      if (state.selected === null) return state;
      const canFly = countPieces(state.board, "P") === 3;
      const valid = canFly
        ? state.board[action.pos] === null
        : ADJACENCY[state.selected]!.includes(action.pos) && state.board[action.pos] === null;
      if (!valid) return state;
      const board = [...state.board];
      board[action.pos] = "P";
      board[state.selected] = null;
      const milFormed = formsMill(board, action.pos, "P");
      if (milFormed) {
        const removable = board.some((_, i) => canRemove(board, i, "P"));
        if (removable) {
          return { ...state, board, phase: "move", pendingRemove: true, selected: null, rngSeed: nextSeed };
        }
      }
      // Check if bot has moves
      let winner: "P" | "B" | null = null;
      const bMoves = getLegalMoves(board, "B");
      if (countPieces(board, "B") < 3) winner = "P";
      else if (bMoves.length === 0) winner = "P";

      let next: MorabarabaState = { ...state, board, turn: "B", phase: "move", selected: null, winner, rngSeed: nextSeed };
      if (!winner) next = runBotMove(next);
      return next;
    }
  }

  return state;
}

export function isTerminal(state: MorabarabaState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === "P") return { score: 100 };
  return { score: 0 };
}
