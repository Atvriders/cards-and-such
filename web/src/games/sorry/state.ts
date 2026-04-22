import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Sorry! (simplified) — card-based race, 45-square track
// Cards: 1,2,3,4,5,6,7,8,10,11,12 (numbered) + "Sorry!" + "Swap"
// Simplified rules:
//   1  = move 1 OR bring out of start (instead of normal entry)
//   2  = move 2 (and draw again)
//   4  = move back 4
//   7  = move 7 (or split? — simplified: just move 7)
//   10 = move 10 or back 1
//   11 = move 11 or swap with opponent
//   Sorry! = send opponent's pawn home
//   Swap   = exchange positions with any opponent pawn on board
//   Others = move forward that many spaces
// Home = square 45

export const TRACK_SIZE = 45;
export const HOME_SQ = 45;
export const YARD = -1;
export const NUM_PAWNS = 4;

// Entry square
const ENTRY: Record<number, number> = { 0: 0, 1: 12, 2: 24, 3: 36 };
const SAFE_ABS = new Set([0, 12, 24, 36]);

export type SorryCard =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 11 | 12
  | "Sorry" | "Swap";

export interface SorrySettings {
  opponents: "1" | "2" | "3";
}

export interface SorryState {
  settings: SorrySettings;
  rngSeed: number;
  pawns: readonly (readonly number[])[];
  deck: readonly SorryCard[];
  currentCard: SorryCard | null;
  turn: number;
  numPlayers: number;
  winner: number | null;
  phase: "drawing" | "choosing";
  // For 10: player can go +10 or -1
  // For 11: player can go +11 or swap
  // For 7: just move 7 (simplified)
  altMode: boolean; // true = use alternate move for 10 (-1) or 11 (swap)
}

export type SorryAction =
  | { type: "draw" }
  | { type: "move"; pawn: number; alt?: boolean }  // alt = use alternate action
  | { type: "sorry"; targetPlayer: number; targetPawn: number }  // for Sorry! card
  | { type: "swap"; myPawn: number; targetPlayer: number; targetPawn: number };

function numPlayers(settings: SorrySettings): number {
  return 1 + parseInt(settings.opponents);
}

const DECK_BASE: SorryCard[] = [
  1, 1, 1, 1,
  2, 2, 2, 2,
  3, 3, 3, 3,
  4, 4, 4, 4,
  5, 5, 5, 5,
  6, 6, 6, 6,
  7, 7, 7, 7,
  8, 8, 8, 8,
  10, 10, 10,
  11, 11, 11,
  12, 12, 12,
  "Sorry", "Sorry", "Sorry",
  "Swap", "Swap",
];

function shuffleDeck(rng: () => number): SorryCard[] {
  const deck = [...DECK_BASE];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

export function initialState(seed: number, settings: SorrySettings): SorryState {
  const np = numPlayers(settings);
  const rng = mulberry32(seed);
  const deck = shuffleDeck(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const pawns: number[][] = [];
  for (let i = 0; i < np; i++) pawns.push([YARD, YARD, YARD, YARD]);
  return {
    settings,
    rngSeed: nextSeed,
    pawns,
    deck,
    currentCard: null,
    turn: 0,
    numPlayers: np,
    winner: null,
    phase: "drawing",
    altMode: false,
  };
}

function toAbs(player: number, rel: number): number {
  if (rel === YARD || rel === HOME_SQ) return rel;
  return (ENTRY[player]! + rel) % TRACK_SIZE;
}

function isSafe(abs: number): boolean {
  return SAFE_ABS.has(abs);
}

function checkWinner(pawns: readonly (readonly number[])[], numPlayers: number): number | null {
  for (let p = 0; p < numPlayers; p++) {
    if (pawns[p]!.every((pos) => pos === HOME_SQ)) return p;
  }
  return null;
}

function movePawn(
  pawns: readonly (readonly number[])[],
  player: number,
  pawnIdx: number,
  delta: number,
  numPlayers: number,
): readonly (readonly number[])[] {
  const pos = pawns[player]![pawnIdx]!;
  let newPos: number;
  if (pos === YARD) {
    if (delta === 1) newPos = 0; // enter at start
    else return pawns; // can't move
  } else {
    newPos = pos + delta;
    if (newPos < 0) newPos = 0; // can't go before start
  }
  if (newPos >= HOME_SQ) newPos = HOME_SQ;

  const newPawns = pawns.map((pp) => [...pp]);
  newPawns[player]![pawnIdx] = newPos;

  // Capture on non-safe square
  if (newPos !== HOME_SQ) {
    const absPos = toAbs(player, newPos);
    if (!isSafe(absPos)) {
      for (let opp = 0; opp < numPlayers; opp++) {
        if (opp === player) continue;
        for (let op = 0; op < NUM_PAWNS; op++) {
          const oppPos = newPawns[opp]![op]!;
          if (oppPos === YARD || oppPos === HOME_SQ) continue;
          if (toAbs(opp, oppPos) === absPos) {
            newPawns[opp]![op] = YARD;
          }
        }
      }
    }
  }
  return newPawns;
}

function canMoveCard(
  pawns: readonly (readonly number[])[],
  player: number,
  card: SorryCard,
  numPlayers: number,
): boolean {
  if (card === "Sorry") {
    // Need an opponent pawn on the board
    for (let opp = 0; opp < numPlayers; opp++) {
      if (opp === player) continue;
      if (pawns[opp]!.some((p) => p !== YARD && p !== HOME_SQ)) return true;
    }
    return false;
  }
  if (card === "Swap") {
    const myOnBoard = pawns[player]!.some((p) => p !== YARD && p !== HOME_SQ);
    if (!myOnBoard) return false;
    for (let opp = 0; opp < numPlayers; opp++) {
      if (opp === player) continue;
      if (pawns[opp]!.some((p) => p !== YARD && p !== HOME_SQ)) return true;
    }
    return false;
  }
  const delta = typeof card === "number" ? card : 0;
  for (let pi = 0; pi < NUM_PAWNS; pi++) {
    const pos = pawns[player]![pi]!;
    if (pos === HOME_SQ) continue;
    if (pos === YARD && delta === 1) return true;
    if (pos !== YARD) {
      if (card === 4 && pos > 0) return true;
      if (card === 10 && (pos + 10 <= HOME_SQ || pos > 0)) return true;
      if (card === 11 && pos + 11 <= HOME_SQ) return true;
      if (typeof card === "number" && card > 0 && card !== 4 && card !== 10 && card !== 11) {
        if (pos + card <= HOME_SQ) return true;
      }
    }
  }
  return false;
}

function refillDeck(state: SorryState, rng: () => number): SorryCard[] {
  if (state.deck.length > 0) return [...state.deck];
  return shuffleDeck(rng);
}

function drawCard(state: SorryState): { card: SorryCard; deck: SorryCard[]; seed: number } {
  const rng = mulberry32(state.rngSeed);
  let deck = refillDeck(state, rng);
  if (deck.length === 0) deck = shuffleDeck(rng);
  const idx = Math.floor(rng() * deck.length);
  const card = deck[idx]!;
  const newDeck = [...deck.slice(0, idx), ...deck.slice(idx + 1)];
  const seed = Math.floor(rng() * 2 ** 31);
  return { card, deck: newDeck, seed };
}

function nextTurn(state: SorryState, pawns: readonly (readonly number[])[], seed: number, deck: readonly SorryCard[]): SorryState {
  const w = checkWinner(pawns, state.numPlayers);
  if (w !== null) return { ...state, pawns, winner: w, rngSeed: seed, deck };
  const nt = (state.turn + 1) % state.numPlayers;
  return { ...state, pawns, turn: nt, phase: "drawing", currentCard: null, rngSeed: seed, deck, altMode: false };
}

function botMove(state: SorryState, card: SorryCard): SorryState {
  const player = state.turn;
  const np = state.numPlayers;

  if (card === "Sorry") {
    // Pick first opponent pawn on board
    for (let opp = 0; opp < np; opp++) {
      if (opp === player) continue;
      for (let op = 0; op < NUM_PAWNS; op++) {
        if (state.pawns[opp]![op]! !== YARD && state.pawns[opp]![op]! !== HOME_SQ) {
          const newPawns = state.pawns.map((pp) => [...pp]);
          newPawns[opp]![op] = YARD;
          return nextTurn(state, newPawns, state.rngSeed, state.deck);
        }
      }
    }
    return nextTurn(state, state.pawns, state.rngSeed, state.deck);
  }

  if (card === "Swap") {
    // Find bot's on-board pawn and swap with an opponent's on-board pawn
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      const pos = state.pawns[player]![pi]!;
      if (pos === YARD || pos === HOME_SQ) continue;
      for (let opp = 0; opp < np; opp++) {
        if (opp === player) continue;
        for (let op = 0; op < NUM_PAWNS; op++) {
          const oppPos = state.pawns[opp]![op]!;
          if (oppPos === YARD || oppPos === HOME_SQ) continue;
          if (oppPos > pos) {
            const newPawns = state.pawns.map((pp) => [...pp]);
            newPawns[player]![pi] = oppPos;
            newPawns[opp]![op] = pos;
            return nextTurn(state, newPawns, state.rngSeed, state.deck);
          }
        }
      }
    }
    return nextTurn(state, state.pawns, state.rngSeed, state.deck);
  }

  // Numeric card
  // Try to advance a pawn; pick the one furthest from home
  let bestPawn = -1;
  let bestNewPos = -1;
  for (let pi = 0; pi < NUM_PAWNS; pi++) {
    const pos = state.pawns[player]![pi]!;
    let delta = typeof card === "number" ? card : 0;
    if (card === 4) delta = -4;
    if (pos === HOME_SQ) continue;
    if (pos === YARD && delta === 1) {
      if (bestNewPos < 0) { bestPawn = pi; bestNewPos = 0; }
      continue;
    }
    if (pos === YARD) continue;
    const newPos = Math.max(0, pos + delta);
    if (card === 10) {
      const opt10 = pos + 10 <= HOME_SQ ? pos + 10 : -9999;
      const optB1 = pos > 0 ? pos - 1 : -9999;
      const best = Math.max(opt10, optB1);
      if (best > bestNewPos) { bestPawn = pi; bestNewPos = best; }
      continue;
    }
    if (newPos <= HOME_SQ && newPos > bestNewPos) { bestPawn = pi; bestNewPos = newPos; }
  }

  if (bestPawn === -1) {
    return nextTurn(state, state.pawns, state.rngSeed, state.deck);
  }

  let delta = typeof card === "number" ? card : 0;
  if (card === 4) delta = -4;
  if (card === 10) {
    const pos = state.pawns[player]![bestPawn]!;
    delta = bestNewPos === pos + 10 ? 10 : -1;
  }
  const newPawns = movePawn(state.pawns, player, bestPawn, delta, np);
  return nextTurn(state, newPawns, state.rngSeed, state.deck);
}

function advanceBots(state: SorryState): SorryState {
  let s = state;
  let iter = 0;
  while (s.winner === null && s.turn !== 0 && iter++ < 300) {
    if (s.phase === "drawing") {
      const { card, deck, seed } = drawCard(s);
      if (!canMoveCard(s.pawns, s.turn, card, s.numPlayers)) {
        const nt = (s.turn + 1) % s.numPlayers;
        s = { ...s, rngSeed: seed, deck, turn: nt, currentCard: null, phase: "drawing" };
        continue;
      }
      s = { ...s, rngSeed: seed, deck, currentCard: card, phase: "choosing" };
    } else {
      // choosing
      if (s.currentCard === null) { s = { ...s, phase: "drawing" }; continue; }
      s = botMove(s, s.currentCard);
      if (s.winner !== null) break;
      // If still bot's turn (shouldn't normally happen), just end
    }
  }
  return s;
}

export function reducer(state: SorryState, action: SorryAction): SorryState {
  if (state.winner !== null) return state;

  if (action.type === "draw") {
    if (state.phase !== "drawing" || state.turn !== 0) return state;
    const { card, deck, seed } = drawCard(state);
    if (!canMoveCard(state.pawns, 0, card, state.numPlayers)) {
      const nt = 1 % state.numPlayers;
      const next: SorryState = { ...state, rngSeed: seed, deck, turn: nt, currentCard: null, phase: "drawing" };
      return advanceBots(next);
    }
    return { ...state, rngSeed: seed, deck, currentCard: card, phase: "choosing" };
  }

  if (action.type === "move") {
    if (state.phase !== "choosing" || state.turn !== 0 || state.currentCard === null) return state;
    const card = state.currentCard;
    const { pawn, alt } = action;
    const pos = state.pawns[0]![pawn]!;

    let delta: number;
    if (typeof card === "number") {
      if (card === 4) delta = -4;
      else if (card === 10) delta = alt ? -1 : 10;
      else if (card === 11) delta = 11; // move 11 (swap handled separately)
      else delta = card;
    } else {
      return state; // Sorry/Swap handled separately
    }

    if (pos === YARD && delta === 1) {
      const newPawns = movePawn(state.pawns, 0, pawn, 1, state.numPlayers);
      const w = checkWinner(newPawns, state.numPlayers);
      if (w !== null) return { ...state, pawns: newPawns, winner: w };
      const nt = card === 2 ? 0 : (0 + 1) % state.numPlayers; // card 2 = draw again
      const next = { ...state, pawns: newPawns, turn: nt, phase: "drawing" as const, currentCard: null };
      if (nt !== 0) return advanceBots(next);
      return next;
    }
    if (pos === YARD) return state;
    const newPos = pos + delta;
    if (newPos < 0 && pos === 0) return state; // can't go negative from 0
    if (newPos > HOME_SQ) return state;

    const newPawns = movePawn(state.pawns, 0, pawn, delta, state.numPlayers);
    const w = checkWinner(newPawns, state.numPlayers);
    if (w !== null) return { ...state, pawns: newPawns, winner: w };
    const nt = card === 2 ? 0 : (0 + 1) % state.numPlayers;
    const next = { ...state, pawns: newPawns, turn: nt, phase: "drawing" as const, currentCard: null };
    if (nt !== 0) return advanceBots(next);
    return next;
  }

  if (action.type === "sorry") {
    if (state.phase !== "choosing" || state.turn !== 0 || state.currentCard !== "Sorry") return state;
    const { targetPlayer, targetPawn } = action;
    if (targetPlayer === 0) return state;
    const pos = state.pawns[targetPlayer]![targetPawn]!;
    if (pos === YARD || pos === HOME_SQ) return state;
    const newPawns = state.pawns.map((pp) => [...pp]);
    newPawns[targetPlayer]![targetPawn] = YARD;
    const w = checkWinner(newPawns, state.numPlayers);
    if (w !== null) return { ...state, pawns: newPawns, winner: w };
    const nt = (0 + 1) % state.numPlayers;
    const next = { ...state, pawns: newPawns, turn: nt, phase: "drawing" as const, currentCard: null };
    return advanceBots(next);
  }

  if (action.type === "swap") {
    if (state.phase !== "choosing" || state.turn !== 0 || state.currentCard !== "Swap") return state;
    const { myPawn, targetPlayer, targetPawn } = action;
    if (targetPlayer === 0) return state;
    const myPos = state.pawns[0]![myPawn]!;
    const oppPos = state.pawns[targetPlayer]![targetPawn]!;
    if (myPos === YARD || myPos === HOME_SQ || oppPos === YARD || oppPos === HOME_SQ) return state;
    const newPawns = state.pawns.map((pp) => [...pp]);
    newPawns[0]![myPawn] = oppPos;
    newPawns[targetPlayer]![targetPawn] = myPos;
    const w = checkWinner(newPawns, state.numPlayers);
    if (w !== null) return { ...state, pawns: newPawns, winner: w };
    const nt = (0 + 1) % state.numPlayers;
    const next = { ...state, pawns: newPawns, turn: nt, phase: "drawing" as const, currentCard: null };
    return advanceBots(next);
  }

  return state;
}

export function isTerminal(state: SorryState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
