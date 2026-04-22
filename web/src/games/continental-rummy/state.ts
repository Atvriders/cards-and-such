import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ContinentalRummySettings {
  numBots: number;
}

// Round contract:
// Round 1: 2 sets of 3
// Round 2: 1 set of 3 + 1 run of 4
// Round 3: 2 runs of 4
export type ContractType = "set" | "run";
export interface ContractPart {
  type: ContractType;
  minLength: number;
}

export const CONTRACTS: ContractPart[][] = [
  [{ type: "set", minLength: 3 }, { type: "set", minLength: 3 }],
  [{ type: "set", minLength: 3 }, { type: "run", minLength: 4 }],
  [{ type: "run", minLength: 4 }, { type: "run", minLength: 4 }],
];

export type Phase = "player-draw" | "player-act" | "bot-turn" | "done";

export interface ContinentalRummyState {
  settings: ContinentalRummySettings;
  rngSeed: number;
  numPlayers: number;
  round: number; // 0,1,2
  hands: readonly (readonly Card[])[];
  stock: readonly Card[];
  discardPile: readonly Card[];
  fulfilled: readonly boolean[]; // has each player fulfilled the contract this round?
  scores: readonly number[];    // penalty points (lower = better)
  phase: Phase;
  message: string;
  winner: number | null;
}

export type ContinentalRummyAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "go-out"; groups: string[][] } // groups of card ids matching contract parts
  | { type: "discard"; cardId: string };

// ── Helpers ──────────────────────────────────────────────────────────────────

export function isWild(card: Card): boolean {
  return card.rank === 2 || card.id.startsWith("joker-");
}

export function cardValue(rank: Rank): number {
  if (rank === 1) return 1;
  if (rank >= 11) return 10;
  return rank;
}

export function isSet(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const naturals = cards.filter(c => !isWild(c));
  if (naturals.length === 0) return false;
  const rank = naturals[0]!.rank;
  return naturals.every(c => c.rank === rank);
}

export function isRun(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const naturals = cards.filter(c => !isWild(c));
  if (naturals.length === 0) return false;
  const suit = naturals[0]!.suit;
  if (!naturals.every(c => c.suit === suit)) return false;
  const ranks = naturals.map(c => c.rank).sort((a, b) => a - b);
  for (let i = 1; i < ranks.length; i++) {
    if (ranks[i]! !== ranks[i - 1]! + 1) return false;
  }
  return true;
}

export function meetsContract(groups: Card[][], contract: ContractPart[]): boolean {
  if (groups.length !== contract.length) return false;
  return contract.every((part, i) => {
    const g = groups[i]!;
    if (g.length < part.minLength) return false;
    return part.type === "set" ? isSet(g) : isRun(g);
  });
}

function makeDeck(rng: () => number): Card[] {
  // 2 decks + 2 jokers for Continental
  const cards = newDeck(2);
  for (let j = 0; j < 2; j++) cards.push({ suit: "♠", rank: 2, id: `joker-${j}` });
  return shuffle(cards, rng);
}

// ── Bot AI ──────────────────────────────────────────────────────────────────

function botCanGoOut(hand: readonly Card[], contract: ContractPart[]): string[][] | null {
  // Try to find groups satisfying contract
  const h = [...hand];
  const result: string[][] = [];

  for (const part of contract) {
    if (part.type === "set") {
      const byRank = new Map<Rank, Card[]>();
      for (const c of h) {
        if (!isWild(c)) {
          const arr = byRank.get(c.rank) ?? [];
          arr.push(c);
          byRank.set(c.rank, arr);
        }
      }
      let found = false;
      for (const [, group] of byRank) {
        if (group.length >= part.minLength) {
          const g = group.slice(0, part.minLength);
          result.push(g.map(c => c.id));
          const ids = new Set(g.map(c => c.id));
          for (let i = h.length - 1; i >= 0; i--) {
            if (ids.has(h[i]!.id)) h.splice(i, 1);
          }
          found = true;
          break;
        }
      }
      if (!found) return null;
    } else {
      // run
      const bySuit = new Map<Suit, Card[]>();
      for (const c of h) {
        if (!isWild(c)) {
          const arr = bySuit.get(c.suit) ?? [];
          arr.push(c);
          bySuit.set(c.suit, arr);
        }
      }
      let found = false;
      for (const [, group] of bySuit) {
        const sorted = group.sort((a, b) => a.rank - b.rank);
        for (let start = 0; start <= sorted.length - part.minLength; start++) {
          const run = sorted.slice(start, start + part.minLength);
          let consecutive = true;
          for (let k = 1; k < run.length; k++) {
            if (run[k]!.rank !== run[k - 1]!.rank + 1) { consecutive = false; break; }
          }
          if (consecutive) {
            result.push(run.map(c => c.id));
            const ids = new Set(run.map(c => c.id));
            for (let i = h.length - 1; i >= 0; i--) {
              if (ids.has(h[i]!.id)) h.splice(i, 1);
            }
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found) return null;
    }
  }
  return result;
}

function botTurn(state: ContinentalRummyState, seat: number, rng: () => number): ContinentalRummyState {
  let stock = [...state.stock];
  let discardPile = [...state.discardPile];
  let hand = [...state.hands[seat]!];

  if (stock.length === 0 && discardPile.length > 1) {
    const top = discardPile.pop()!;
    stock = shuffle(discardPile, rng);
    discardPile = [top];
  }
  if (stock.length > 0) hand.push(stock.shift()!);

  const contract = CONTRACTS[state.round]!;
  const groups = botCanGoOut(hand, contract);
  if (groups) {
    const usedIds = new Set(groups.flat());
    const remaining = hand.filter(c => !usedIds.has(c.id));
    const penalty = remaining.reduce((s, c) => s + cardValue(c.rank), 0);
    const hands = state.hands.map((h, i) => i === seat ? [] : h) as Card[][];
    const scores = state.scores.map((s, i) => i === seat ? s + penalty : s);
    return {
      ...state,
      stock, discardPile, hands, scores,
      phase: "done",
      winner: seat,
      message: `Bot ${seat} went out!`,
    };
  }

  // Discard highest-value card
  const toDiscard = hand.reduce((hi, c) => cardValue(c.rank) > cardValue(hi.rank) ? c : hi);
  hand = hand.filter(c => c.id !== toDiscard.id);
  discardPile.push(toDiscard);

  const hands = state.hands.map((h, i) => i === seat ? hand : h) as Card[][];
  return { ...state, stock, discardPile, hands };
}

// ── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state: ContinentalRummyState, action: ContinentalRummyAction): ContinentalRummyState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  if (action.type === "draw-stock" && state.phase === "player-draw") {
    let stock = [...state.stock];
    let discardPile = [...state.discardPile];
    if (stock.length === 0) {
      if (discardPile.length > 1) { const top = discardPile.pop()!; stock = shuffle(discardPile, botRng); discardPile = [top]; }
      else return state;
    }
    const drawn = stock.shift()!;
    const hands = state.hands.map((h, i) => i === 0 ? [...h, drawn] : h) as Card[][];
    return { ...state, rngSeed: nextSeed, stock, discardPile, hands, phase: "player-act", message: "Discard or go out if you can fulfill the contract." };
  }

  if (action.type === "draw-discard" && state.phase === "player-draw") {
    if (state.discardPile.length === 0) return state;
    const discardPile = [...state.discardPile];
    const drawn = discardPile.pop()!;
    const hands = state.hands.map((h, i) => i === 0 ? [...h, drawn] : h) as Card[][];
    return { ...state, rngSeed: nextSeed, discardPile, hands, phase: "player-act", message: "Discard or go out." };
  }

  if (action.type === "go-out" && state.phase === "player-act") {
    const hand = [...state.hands[0]!];
    const contract = CONTRACTS[state.round]!;
    const groups = action.groups.map(ids => ids.map(id => hand.find(c => c.id === id)).filter(Boolean) as Card[]);
    if (!meetsContract(groups, contract)) return { ...state, message: "Contract not fulfilled. Check your groups." };

    const usedIds = new Set(action.groups.flat());
    const remaining = hand.filter(c => !usedIds.has(c.id));
    const penalty = remaining.reduce((s, c) => s + cardValue(c.rank), 0);
    const scores = state.scores.map((s, i) => i === 0 ? s + penalty : s);
    const hands = state.hands.map((h, i) => i === 0 ? [] : h) as Card[][];
    return {
      ...state, rngSeed: nextSeed, hands, scores,
      phase: "done", winner: 0,
      message: `You went out! Penalty: ${penalty} pts from deadwood.`,
    };
  }

  if (action.type === "discard" && state.phase === "player-act") {
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    const hand = state.hands[0]!.filter(c => c.id !== action.cardId) as Card[];
    const discardPile = [...state.discardPile, card];
    const hands = state.hands.map((h, i) => i === 0 ? hand : h) as Card[][];

    let s: ContinentalRummyState = { ...state, rngSeed: nextSeed, hands, discardPile, phase: "bot-turn" };
    for (let bot = 1; bot < s.numPlayers; bot++) {
      s = botTurn(s, bot, botRng);
      if (s.phase === "done") return s;
    }
    return { ...s, phase: "player-draw", message: "Your turn. Contract: " + contractDesc(CONTRACTS[s.round]!) };
  }

  return state;
}

function contractDesc(contract: ContractPart[]): string {
  return contract.map(p => `${p.minLength}-card ${p.type}`).join(" + ");
}

// ── initialState ─────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: ContinentalRummySettings): ContinentalRummyState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const numPlayers = 1 + settings.numBots;
  const deck = makeDeck(dealRng);
  const hands: Card[][] = [];
  let pos = 0;
  for (let i = 0; i < numPlayers; i++) { hands.push(deck.slice(pos, pos + 10)); pos += 10; }
  const discardPile = [deck[pos]!];
  const stock = deck.slice(pos + 1);
  const round = 0;

  return {
    settings, rngSeed: Math.floor(dealRng() * 2 ** 31), numPlayers, round,
    hands, stock, discardPile,
    fulfilled: Array(numPlayers).fill(false),
    scores: Array(numPlayers).fill(0),
    phase: "player-draw",
    message: "Round 1 contract: " + contractDesc(CONTRACTS[0]!),
    winner: null,
  };
}

// ── isTerminal ───────────────────────────────────────────────────────────────

export function isTerminal(state: ContinentalRummyState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Lower score = better. Player wins if they have lowest score.
  const playerScore = state.scores[0]!;
  const minBot = Math.min(...state.scores.slice(1));
  return { score: state.winner === 0 ? 80 : Math.max(0, Math.min(60, 60 - (playerScore - minBot))) };
}
