import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Cuckoo (Ranter-Go-Round)
// 4 players (you + 3 bots), 1 card each, lowest card loses a life.
// On your turn: keep or swap with next player (unless next has a King).
// Last player draws from stock.

export interface CuckooSettings {
  placeholder: "none";
}

export type CuckooPhase = "player-turn" | "reveal" | "done";

export interface CuckooState {
  settings: CuckooSettings;
  rngSeed: number;
  hands: readonly (Card | null)[];  // [player, bot1, bot2, bot3]
  lives: readonly number[];          // 3 lives each
  stock: readonly Card[];
  phase: CuckooPhase;
  turn: number;                      // 0 = player; bots resolve immediately after
  swapped: readonly boolean[];       // did seat swap this round
  roundMsg: string;
  revealedHands: readonly (Card | null)[];
  round: number;
}

export type CuckooAction =
  | { type: "keep" }
  | { type: "swap" };

// ── helpers ──────────────────────────────────────────────────────────────────

function isKing(card: Card | null): boolean {
  return card !== null && card.rank === 13;
}

function lowest(hands: readonly (Card | null)[]): number {
  // returns the seat index with the lowest card (rank; among ties all lose)
  let min = Infinity;
  let loser = 0;
  for (let i = 0; i < hands.length; i++) {
    const h = hands[i];
    if (h && h.rank < min) { min = h.rank; loser = i; }
  }
  return loser;
}

// ── bot logic ────────────────────────────────────────────────────────────────

function botDecide(card: Card): "keep" | "swap" {
  // swap if rank <= 6
  return card.rank <= 6 ? "swap" : "keep";
}

// Resolve all bot turns after player action; returns final state before reveal
function resolveBots(s: CuckooState, rng: () => number): CuckooState {
  // seats 1, 2 swap in order; seat 3 draws from stock
  let state = { ...s };

  for (let seat = 1; seat <= 2; seat++) {
    const card = state.hands[seat];
    if (!card) continue;
    const decision = botDecide(card);
    const nextSeat = (seat + 1) % 4;
    const nextCard = state.hands[nextSeat] ?? null;

    if (decision === "swap" && !isKing(nextCard)) {
      const newHands = [...state.hands] as (Card | null)[];
      newHands[seat] = nextCard;
      newHands[nextSeat] = card;
      state = { ...state, hands: newHands };
    }
  }

  // Seat 3 (last player) draws from stock
  if (state.stock.length > 0) {
    const drawn = state.stock[0]!;
    const remaining = state.stock.slice(1);
    const newHands = [...state.hands] as (Card | null)[];
    newHands[3] = drawn;
    state = { ...state, hands: newHands, stock: remaining };
  }

  // Reveal phase
  const loser = lowest(state.hands);
  const newLives = state.lives.map((l, i) => i === loser ? l - 1 : l) as number[];
  const anyDead = newLives.some(l => l <= 0);
  const phase: CuckooPhase = "reveal";

  void rng; // seed unused in deterministic bot
  return {
    ...state,
    revealedHands: state.hands,
    lives: newLives,
    phase,
    roundMsg: `${loser === 0 ? "You" : `Bot ${loser}`} had the lowest card and lost a life!${anyDead ? " Game Over!" : ""}`,
  };
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: CuckooState, action: CuckooAction): CuckooState {
  if (state.phase !== "player-turn") return state;
  if (state.turn !== 0) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  let s: CuckooState = { ...state, rngSeed: nextSeed };

  if (action.type === "swap") {
    const nextCard = s.hands[1] ?? null;
    if (!isKing(nextCard)) {
      const newHands = [...s.hands] as (Card | null)[];
      newHands[0] = nextCard;
      newHands[1] = s.hands[0] ?? null;
      s = { ...s, hands: newHands };
    }
    // if nextCard is King, keep own card (swap refused)
  }
  // "keep" — no change to hands

  return resolveBots(s, botRng);
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: CuckooSettings): CuckooState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(newDeck(), dealRng);
  const hands: (Card | null)[] = [deck[0]!, deck[1]!, deck[2]!, deck[3]!];
  const stock = deck.slice(4);

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    lives: [3, 3, 3, 3],
    stock,
    phase: "player-turn",
    turn: 0,
    swapped: [false, false, false, false],
    roundMsg: "",
    revealedHands: [null, null, null, null],
    round: 1,
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: CuckooState): { score: number } | null {
  if (state.phase !== "reveal") return null;
  const playerLives = state.lives[0] ?? 0;
  if (playerLives <= 0) return { score: 0 };
  // If any bot is dead and player survived
  const botDead = state.lives.slice(1).some(l => l <= 0);
  if (botDead) return { score: 100 };
  // Round ended but game not conclusive — score based on remaining lives
  const maxLives = 3 * 4;
  const playerTotal = state.lives[0]! * 25;
  return { score: playerTotal };
}
