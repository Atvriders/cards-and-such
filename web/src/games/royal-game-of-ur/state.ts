import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Royal Game of Ur - 2500 BCE Mesopotamia
// Standard path: 14 safe squares + 8 shared combat squares (modern Finkel rules)
// Player P: path indices 0-13, Bot B: path indices 0-13 (shared board positions 4-11)
// Board squares: 0-3 = P private start, 4-11 = shared track, 12-13 = P private end
//   (Bot uses same path layout)
// Rosette squares (extra turn): path indices 3, 7, 13
// 4 binary dice (tetrahedral), count of marked corners = 0-4 (no re-roll for 0)
// 7 pieces each, race all off to win

export const PATH_LENGTH = 14;
export const ROSETTES = new Set([3, 7, 13]);
export const PIECES_PER_PLAYER = 7;

// Board visualization: path positions 0-13
// P:  [0,1,2,3] → [4,5,6,7,8,9,10,11] → [12,13] → exit
// B same path (shared middle track 4-11)

export type UrCell = "P" | "B" | null;

export interface UrSettings {
  dummy?: string;
}

export interface UrState {
  // Positions of pieces: -1 = waiting to enter, 0-13 = on path, 14 = escaped
  pPieces: number[]; // 7 values
  bPieces: number[]; // 7 values
  turn: "P" | "B";
  roll: number;
  mustRoll: boolean;
  lastRoll: number;
  winner: "P" | "B" | null;
  rngSeed: number;
  settings: UrSettings;
}

export type UrAction =
  | { type: "roll" }
  | { type: "move"; pieceIdx: number }; // index into pPieces

function rng(seed: number) { return mulberry32(seed); }

function rollDice(r: () => number): number {
  let count = 0;
  for (let i = 0; i < 4; i++) count += Math.floor(r() * 2);
  return count;
}

// Check if a path position is shared (combat zone)
function isShared(pos: number): boolean {
  return pos >= 4 && pos <= 11;
}

function buildBoardOccupancy(pPieces: number[], bPieces: number[]): Map<number, "P" | "B"> {
  const map = new Map<number, "P" | "B">();
  for (const p of pPieces) if (p >= 0 && p <= 13) map.set(p, "P");
  for (const b of bPieces) if (b >= 0 && b <= 13) map.set(b, "B");
  return map;
}

export function getLegalMoveIndices(
  pieces: number[],
  oppPieces: number[],
  roll: number,
  isP: boolean,
): number[] {
  if (roll === 0) return [];
  const occ = buildBoardOccupancy(isP ? pieces : oppPieces, isP ? oppPieces : pieces);
  const player = isP ? "P" : "B";
  const opp = isP ? "B" : "P";
  const result: number[] = [];

  for (let i = 0; i < pieces.length; i++) {
    const pos = pieces[i]!;
    if (pos === 14) continue; // already escaped
    const dest = pos + roll;
    if (dest > 14) continue; // overshoot
    if (dest === 14) { result.push(i); continue; } // escape
    const cellOwner = occ.get(dest);
    if (cellOwner === player) continue; // own piece there
    // Rosette 7 is safe — can't capture there
    if (cellOwner === opp && dest === 7) continue;
    result.push(i);
  }
  return result;
}

export function initialState(seed: number, settings: UrSettings): UrState {
  return {
    pPieces: new Array(PIECES_PER_PLAYER).fill(-1),
    bPieces: new Array(PIECES_PER_PLAYER).fill(-1),
    turn: "P",
    roll: 0,
    mustRoll: true,
    lastRoll: 0,
    winner: null,
    rngSeed: seed,
    settings,
  };
}

function applyMoveState(state: UrState, pieceIdx: number, isP: boolean): UrState {
  const r = rng(state.rngSeed);
  const nextSeed = Math.floor(r() * 2 ** 31);

  const pieces = isP ? [...state.pPieces] : [...state.bPieces];
  const opp = isP ? [...state.bPieces] : [...state.pPieces];
  const roll = state.roll;

  const pos = pieces[pieceIdx]!;
  const dest = pos + roll;

  // Remove opponent piece if captured (shared zone only)
  if (dest >= 4 && dest <= 11) {
    const hitIdx = opp.findIndex((p) => p === dest);
    if (hitIdx >= 0) opp[hitIdx] = -1; // send back to start
  }

  pieces[pieceIdx] = dest >= 14 ? 14 : dest;

  // Check winner
  const allEscaped = pieces.every((p) => p === 14);
  const winner: "P" | "B" | null = allEscaped ? (isP ? "P" : "B") : null;

  // Extra turn on rosette
  const extraTurn = ROSETTES.has(dest);
  const nextTurn = extraTurn ? (isP ? "P" : "B") : (isP ? "B" : "P");

  return {
    ...state,
    pPieces: isP ? pieces : opp,
    bPieces: isP ? opp : pieces,
    turn: nextTurn,
    roll: 0,
    mustRoll: true,
    lastRoll: state.lastRoll,
    winner,
    rngSeed: nextSeed,
  };
}

function botTurn(state: UrState): UrState {
  const r = rng(state.rngSeed);
  const nextSeed = Math.floor(r() * 2 ** 31);
  const roll = rollDice(r);
  const nextSeed2 = Math.floor(r() * 2 ** 31);

  const moves = getLegalMoveIndices(state.bPieces, state.pPieces, roll, false);
  if (moves.length === 0) {
    // Skip
    return { ...state, rngSeed: nextSeed2, turn: "P", roll: 0, mustRoll: true, lastRoll: roll };
  }

  // Greedy: prefer capture, then furthest piece
  let best = moves[0]!;
  let bestScore = -999;
  for (const i of moves) {
    const dest = state.bPieces[i]! + roll;
    let score = state.bPieces[i]!;
    if (dest < 14 && state.pPieces.includes(dest) && isShared(dest)) score += 100;
    if (dest === 14) score += 200;
    if (ROSETTES.has(dest)) score += 50;
    if (score > bestScore) { bestScore = score; best = i; }
  }

  const s2: UrState = { ...state, rngSeed: nextSeed2, roll, lastRoll: roll, mustRoll: false };
  return applyMoveState(s2, best, false);
}

export function reducer(state: UrState, action: UrAction): UrState {
  if (state.winner !== null) return state;

  if (action.type === "roll") {
    if (!state.mustRoll || state.turn !== "P") return state;
    const r = rng(state.rngSeed);
    const nextSeed = Math.floor(r() * 2 ** 31);
    const roll = rollDice(r);
    const nextSeed2 = Math.floor(r() * 2 ** 31);
    const moves = getLegalMoveIndices(state.pPieces, state.bPieces, roll, true);
    if (moves.length === 0) {
      return { ...state, rngSeed: nextSeed2, turn: "B", roll: 0, mustRoll: true, lastRoll: roll };
    }
    return { ...state, rngSeed: nextSeed2, roll, mustRoll: false, lastRoll: roll };
  }

  if (action.type === "move") {
    if (state.mustRoll || state.turn !== "P" || state.roll === 0) return state;
    const moves = getLegalMoveIndices(state.pPieces, state.bPieces, state.roll, true);
    if (!moves.includes(action.pieceIdx)) return state;
    let next = applyMoveState(state, action.pieceIdx, true);
    let limit = 10;
    while (next.winner === null && next.turn === "B" && limit-- > 0) {
      next = botTurn(next);
    }
    return next;
  }

  return state;
}

export function isTerminal(state: UrState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === "P") return { score: 100 };
  return { score: 0 };
}
