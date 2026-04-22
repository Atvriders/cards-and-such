import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Parcheesi (simplified) — 4-player, 4 pawns each, 52-square track
// Player 0 = human (seats 0-3, bots fill the rest based on settings)
// Track: 0-51 (square 0 = entry for player 0), each player enters at offset
// Safe squares: 0, 13, 26, 39 (start squares) and 8, 21, 34, 47
// Home = square 52 (off-board)

export const TRACK_SIZE = 52;
export const HOME_SQUARE = 52;
export const NUM_PAWNS = 4;
export const YARD = -1; // not yet on board

// Each player's starting entry square on the track
const ENTRY: Record<number, number> = { 0: 0, 1: 13, 2: 26, 3: 39 };

// Safe squares (no captures here)
const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export interface ParcheesiSettings {
  opponents: "1" | "2" | "3";
}

export interface ParcheesiState {
  settings: ParcheesiSettings;
  rngSeed: number;
  // pawns[player][pawn] = position on track, YARD (-1) = home base, HOME_SQUARE = finished
  pawns: readonly (readonly number[])[];
  dice: readonly number[]; // current dice roll [d1, d2]
  usedDice: readonly boolean[]; // which dice have been used this turn
  turn: number; // which player (0-3)
  numPlayers: number;
  winner: number | null;
  phase: "rolling" | "moving";
}

export type ParcheesiAction =
  | { type: "roll" }
  | { type: "move"; pawn: number; dieIndex: number };

function numPlayers(settings: ParcheesiSettings): number {
  return 1 + parseInt(settings.opponents);
}

export function initialState(seed: number, settings: ParcheesiSettings): ParcheesiState {
  const np = numPlayers(settings);
  const pawns: number[][] = [];
  for (let i = 0; i < np; i++) {
    pawns.push([YARD, YARD, YARD, YARD]);
  }
  return {
    settings,
    rngSeed: seed,
    pawns,
    dice: [],
    usedDice: [],
    turn: 0,
    numPlayers: np,
    winner: null,
    phase: "rolling",
  };
}

function rollDie(rng: () => number): number {
  return Math.floor(rng() * 6) + 1;
}

// Convert a player-relative position to absolute track position
function toAbsolute(player: number, relPos: number): number {
  if (relPos === YARD || relPos === HOME_SQUARE) return relPos;
  return (ENTRY[player]! + relPos) % TRACK_SIZE;
}

// Check if absolute position is safe
function isSafe(absPos: number): boolean {
  return SAFE_SQUARES.has(absPos);
}

// Get relative position for a pawn (relative to the player's perspective)
function getRelPos(pawns: readonly (readonly number[])[], player: number, pawn: number): number {
  return pawns[player]![pawn]!;
}

// Validate if a move is legal: pawn at relPos + dieVal
function canMove(
  pawns: readonly (readonly number[])[],
  player: number,
  pawnIdx: number,
  dieVal: number,
): boolean {
  const relPos = getRelPos(pawns, player, pawnIdx);
  if (relPos === HOME_SQUARE) return false; // already home
  if (relPos === YARD) {
    // Need exact 5 or doubles (not implemented here – simplified: need die=5 to enter)
    return dieVal === 5;
  }
  const newRel = relPos + dieVal;
  return newRel <= HOME_SQUARE;
}

function applyMove(
  pawns: readonly (readonly number[])[],
  player: number,
  pawnIdx: number,
  dieVal: number,
  numPlayers: number,
): readonly (readonly number[])[] {
  const relPos = getRelPos(pawns, player, pawnIdx);
  let newRel: number;
  if (relPos === YARD) {
    newRel = 0; // enter at start
  } else {
    newRel = relPos + dieVal;
  }

  // Copy pawns
  const newPawns = pawns.map((pp) => [...pp]);
  newPawns[player]![pawnIdx] = newRel;

  if (newRel === HOME_SQUARE) {
    return newPawns;
  }

  // Check captures: if landing on an opponent's non-safe square
  const absPos = toAbsolute(player, newRel);
  if (!isSafe(absPos)) {
    for (let opp = 0; opp < numPlayers; opp++) {
      if (opp === player) continue;
      for (let op = 0; op < NUM_PAWNS; op++) {
        const oppRel = newPawns[opp]![op]!;
        if (oppRel === YARD || oppRel === HOME_SQUARE) continue;
        const oppAbs = toAbsolute(opp, oppRel);
        if (oppAbs === absPos) {
          newPawns[opp]![op] = YARD; // send home
        }
      }
    }
  }

  return newPawns;
}

function checkWinner(pawns: readonly (readonly number[])[], numPlayers: number): number | null {
  for (let p = 0; p < numPlayers; p++) {
    if (pawns[p]!.every((pos) => pos === HOME_SQUARE)) return p;
  }
  return null;
}

function hasAnyLegalMove(
  pawns: readonly (readonly number[])[],
  player: number,
  dice: readonly number[],
  usedDice: readonly boolean[],
): boolean {
  for (let di = 0; di < dice.length; di++) {
    if (usedDice[di]) continue;
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      if (canMove(pawns, player, pi, dice[di]!)) return true;
    }
  }
  return false;
}

// Bot heuristic: pick the move that advances the furthest pawn
function botPickMove(
  pawns: readonly (readonly number[])[],
  player: number,
  dice: readonly number[],
  usedDice: readonly boolean[],
): { pawn: number; dieIndex: number } | null {
  let bestPawn = -1;
  let bestDie = -1;
  let bestPos = -1;

  for (let di = 0; di < dice.length; di++) {
    if (usedDice[di]) continue;
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      if (!canMove(pawns, player, pi, dice[di]!)) continue;
      const relPos = getRelPos(pawns, player, pi);
      const newPos = relPos === YARD ? 0 : relPos + dice[di]!;
      // Prefer finishing, else prefer advancing furthest pawn
      const score = newPos === HOME_SQUARE ? 1000 : newPos;
      if (score > bestPos) {
        bestPos = score;
        bestPawn = pi;
        bestDie = di;
      }
    }
  }

  if (bestPawn === -1) return null;
  return { pawn: bestPawn, dieIndex: bestDie };
}

function advanceBots(state: ParcheesiState): ParcheesiState {
  let s = state;
  let iterations = 0;
  const maxIter = 100;
  while (s.winner === null && s.turn !== 0 && iterations++ < maxIter) {
    if (s.phase === "rolling") {
      // Roll for bot
      const rng = mulberry32(s.rngSeed);
      const d1 = rollDie(rng);
      const d2 = rollDie(rng);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      s = { ...s, rngSeed: nextSeed, dice: [d1, d2], usedDice: [false, false], phase: "moving" };
    } else {
      // Moving phase for bot
      const move = botPickMove(s.pawns, s.turn, s.dice, s.usedDice);
      if (move === null) {
        // No moves: end turn
        const nextTurn = (s.turn + 1) % s.numPlayers;
        s = { ...s, turn: nextTurn, phase: "rolling", dice: [], usedDice: [] };
      } else {
        const newPawns = applyMove(s.pawns, s.turn, move.pawn, s.dice[move.dieIndex]!, s.numPlayers);
        const newUsed = s.usedDice.map((u, i) => i === move.dieIndex ? true : u);
        const w = checkWinner(newPawns, s.numPlayers);
        if (w !== null) {
          s = { ...s, pawns: newPawns, usedDice: newUsed, winner: w };
          break;
        }
        // Check if more dice remain
        if (newUsed.every(Boolean) || !hasAnyLegalMove(newPawns, s.turn, s.dice, newUsed)) {
          const nextTurn = (s.turn + 1) % s.numPlayers;
          s = { ...s, pawns: newPawns, turn: nextTurn, phase: "rolling", dice: [], usedDice: [] };
        } else {
          s = { ...s, pawns: newPawns, usedDice: newUsed };
        }
      }
    }
  }
  return s;
}

export function reducer(state: ParcheesiState, action: ParcheesiAction): ParcheesiState {
  if (state.winner !== null) return state;

  if (action.type === "roll") {
    if (state.phase !== "rolling" || state.turn !== 0) return state;
    const rng = mulberry32(state.rngSeed);
    const d1 = rollDie(rng);
    const d2 = rollDie(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let next: ParcheesiState = {
      ...state,
      rngSeed: nextSeed,
      dice: [d1, d2],
      usedDice: [false, false],
      phase: "moving",
    };
    // If no legal moves, skip turn
    if (!hasAnyLegalMove(next.pawns, 0, next.dice, next.usedDice)) {
      const nextTurn = (0 + 1) % state.numPlayers;
      next = { ...next, turn: nextTurn, phase: "rolling", dice: [], usedDice: [] };
      return advanceBots(next);
    }
    return next;
  }

  if (action.type === "move") {
    if (state.phase !== "moving" || state.turn !== 0) return state;
    const { pawn, dieIndex } = action;
    if (state.usedDice[dieIndex]) return state;
    if (!canMove(state.pawns, 0, pawn, state.dice[dieIndex]!)) return state;

    const newPawns = applyMove(state.pawns, 0, pawn, state.dice[dieIndex]!, state.numPlayers);
    const newUsed = state.usedDice.map((u, i) => i === dieIndex ? true : u);
    const w = checkWinner(newPawns, state.numPlayers);
    if (w !== null) {
      return { ...state, pawns: newPawns, usedDice: newUsed, winner: w };
    }

    if (newUsed.every(Boolean) || !hasAnyLegalMove(newPawns, 0, state.dice, newUsed)) {
      const nextTurn = (0 + 1) % state.numPlayers;
      const next: ParcheesiState = {
        ...state,
        pawns: newPawns,
        turn: nextTurn,
        phase: "rolling",
        dice: [],
        usedDice: [],
      };
      return advanceBots(next);
    }

    return { ...state, pawns: newPawns, usedDice: newUsed };
  }

  return state;
}

export function isTerminal(state: ParcheesiState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  return { score: 0 };
}
