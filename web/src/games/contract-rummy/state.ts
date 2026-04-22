import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ContractRummySettings {
  contractRound: number;
  numBots: number;
}

export type ContractPart = { type: "set" | "run"; minLen: number };

export const CONTRACTS: ContractPart[][] = [
  [{ type: "set", minLen: 3 }, { type: "set", minLen: 3 }],
  [{ type: "set", minLen: 3 }, { type: "run", minLen: 4 }],
  [{ type: "set", minLen: 3 }, { type: "set", minLen: 3 }, { type: "run", minLen: 4 }],
];

export type Phase = "player-draw" | "player-act" | "bot-turn" | "done";

export interface ContractRummyState {
  settings: ContractRummySettings;
  rngSeed: number;
  numPlayers: number;
  contractRound: number;
  hands: readonly (readonly Card[])[];
  stock: readonly Card[];
  discardPile: readonly Card[];
  contractFulfilled: readonly boolean[];
  tableMelds: Array<{ id: string; cards: Card[]; owner: number }>;
  scores: readonly number[];
  phase: Phase;
  message: string;
  meldCounter: number;
  winner: number | null;
}

export type ContractRummyAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "open"; groups: string[][] }   // fulfill the contract
  | { type: "layoff"; cardId: string; meldId: string }
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

export function isValidSet(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const naturals = cards.filter(c => !isWild(c));
  if (naturals.length === 0) return false;
  const rank = naturals[0]!.rank;
  return naturals.every(c => c.rank === rank);
}

export function isValidRun(cards: Card[]): boolean {
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
    if (g.length < part.minLen) return false;
    return part.type === "set" ? isValidSet(g) : isValidRun(g);
  });
}

function makeDeck(rng: () => number): Card[] {
  const cards = newDeck(2);
  for (let j = 0; j < 2; j++) cards.push({ suit: "♠", rank: 2, id: `joker-${j}` });
  return shuffle(cards, rng);
}

// ── Bot AI ──────────────────────────────────────────────────────────────────

function tryFulfill(hand: readonly Card[], contract: ContractPart[]): string[][] | null {
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
        if (group.length >= part.minLen) {
          const g = group.slice(0, part.minLen);
          result.push(g.map(c => c.id));
          const ids = new Set(g.map(c => c.id));
          for (let i = h.length - 1; i >= 0; i--) { if (ids.has(h[i]!.id)) h.splice(i, 1); }
          found = true; break;
        }
      }
      if (!found) return null;
    } else {
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
        const sorted = [...group].sort((a, b) => a.rank - b.rank);
        for (let start = 0; start <= sorted.length - part.minLen; start++) {
          const run = sorted.slice(start, start + part.minLen);
          let consec = true;
          for (let k = 1; k < run.length; k++) {
            if (run[k]!.rank !== run[k-1]!.rank + 1) { consec = false; break; }
          }
          if (consec) {
            result.push(run.map(c => c.id));
            const ids = new Set(run.map(c => c.id));
            for (let i = h.length - 1; i >= 0; i--) { if (ids.has(h[i]!.id)) h.splice(i, 1); }
            found = true; break;
          }
        }
        if (found) break;
      }
      if (!found) return null;
    }
  }
  return result;
}

function botTurn(state: ContractRummyState, seat: number, rng: () => number): ContractRummyState {
  let stock = [...state.stock];
  let discardPile = [...state.discardPile];
  let hand = [...state.hands[seat]!];
  const tableMelds = [...state.tableMelds];
  let meldCounter = state.meldCounter;
  const contractFulfilled = [...state.contractFulfilled];

  if (stock.length === 0 && discardPile.length > 1) {
    const top = discardPile.pop()!;
    stock = shuffle(discardPile, rng);
    discardPile = [top];
  }
  if (stock.length > 0) hand.push(stock.shift()!);

  const contract = CONTRACTS[state.contractRound]!;
  if (!contractFulfilled[seat]) {
    const groups = tryFulfill(hand, contract);
    if (groups) {
      contractFulfilled[seat] = true;
      const usedIds = new Set(groups.flat());
      for (const g of groups) {
        const cards = g.map(id => hand.find(c => c.id === id)!);
        tableMelds.push({ id: `m-${seat}-${meldCounter++}`, cards, owner: seat });
      }
      hand = hand.filter(c => !usedIds.has(c.id));
    }
  }

  // Try to go out
  if (contractFulfilled[seat] && hand.length === 0) {
    const hands = state.hands.map((h, i) => i === seat ? [] : h) as Card[][];
    return { ...state, stock, discardPile, hands, tableMelds, meldCounter, contractFulfilled, phase: "done", winner: seat, message: `Bot ${seat} went out!` };
  }

  // Discard highest
  if (hand.length > 0) {
    const toDiscard = hand.reduce((hi, c) => cardValue(c.rank) > cardValue(hi.rank) ? c : hi);
    hand = hand.filter(c => c.id !== toDiscard.id);
    discardPile.push(toDiscard);
  }

  const hands = state.hands.map((h, i) => i === seat ? hand : h) as Card[][];
  return { ...state, stock, discardPile, hands, tableMelds, meldCounter, contractFulfilled };
}

// ── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state: ContractRummyState, action: ContractRummyAction): ContractRummyState {
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
    return { ...state, rngSeed: nextSeed, stock, discardPile, hands, phase: "player-act", message: "Meld or discard." };
  }

  if (action.type === "draw-discard" && state.phase === "player-draw") {
    if (state.discardPile.length === 0) return state;
    const discardPile = [...state.discardPile];
    const drawn = discardPile.pop()!;
    const hands = state.hands.map((h, i) => i === 0 ? [...h, drawn] : h) as Card[][];
    return { ...state, rngSeed: nextSeed, discardPile, hands, phase: "player-act", message: "Meld or discard." };
  }

  if (action.type === "open" && state.phase === "player-act" && !state.contractFulfilled[0]) {
    const hand = [...state.hands[0]!];
    const contract = CONTRACTS[state.contractRound]!;
    const groups = action.groups.map(ids => ids.map(id => hand.find(c => c.id === id)!).filter(Boolean));
    if (!meetsContract(groups, contract)) return { ...state, message: "Contract not fulfilled." };

    const usedIds = new Set(action.groups.flat());
    const newHand = hand.filter(c => !usedIds.has(c.id));
    const tableMelds = [...state.tableMelds];
    let meldCounter = state.meldCounter;
    for (const g of groups) {
      tableMelds.push({ id: `m-0-${meldCounter++}`, cards: g, owner: 0 });
    }
    const contractFulfilled = state.contractFulfilled.map((v, i) => i === 0 ? true : v);
    const hands = state.hands.map((h, i) => i === 0 ? newHand : h) as Card[][];
    return { ...state, rngSeed: nextSeed, hands, tableMelds, meldCounter, contractFulfilled, message: "Contract opened! Lay off or discard." };
  }

  if (action.type === "layoff" && state.phase === "player-act" && state.contractFulfilled[0]) {
    const meld = state.tableMelds.find(m => m.id === action.meldId);
    if (!meld) return state;
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    const rank = meld.cards.filter(c => !isWild(c))[0]?.rank;
    if (!rank) return state;
    if (!isWild(card) && card.rank !== rank) return { ...state, message: "Doesn't match meld." };
    const newMeld = { ...meld, cards: [...meld.cards, card] };
    const tableMelds = state.tableMelds.map(m => m.id === action.meldId ? newMeld : m);
    const hand = state.hands[0]!.filter(c => c.id !== action.cardId);
    const hands = state.hands.map((h, i) => i === 0 ? hand : h) as Card[][];
    return { ...state, rngSeed: nextSeed, hands, tableMelds, message: "Laid off." };
  }

  if (action.type === "discard" && state.phase === "player-act") {
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    const hand = state.hands[0]!.filter(c => c.id !== action.cardId) as Card[];
    const discardPile = [...state.discardPile, card];
    const hands = state.hands.map((h, i) => i === 0 ? hand : h) as Card[][];

    if (hand.length === 0 && state.contractFulfilled[0]) {
      const penalty = state.scores[0]!;
      return { ...state, rngSeed: nextSeed, hands, discardPile, phase: "done", winner: 0, message: "You went out!", scores: [...state.scores] };
    }

    let s: ContractRummyState = { ...state, rngSeed: nextSeed, hands, discardPile, phase: "bot-turn" };
    for (let bot = 1; bot < s.numPlayers; bot++) {
      s = botTurn(s, bot, botRng);
      if (s.phase === "done") return s;
    }
    return { ...s, phase: "player-draw", message: "Your turn." };
  }

  return state;
}

// ── initialState ─────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: ContractRummySettings): ContractRummyState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const numPlayers = 1 + settings.numBots;
  const contractRound = settings.contractRound;
  const deck = makeDeck(dealRng);
  const hands: Card[][] = [];
  let pos = 0;
  const dealCount = contractRound === 2 ? 12 : 10;
  for (let i = 0; i < numPlayers; i++) { hands.push(deck.slice(pos, pos + dealCount)); pos += dealCount; }
  const discardPile = [deck[pos]!];
  const stock = deck.slice(pos + 1);
  const contract = CONTRACTS[contractRound]!;

  return {
    settings, rngSeed: Math.floor(dealRng() * 2 ** 31), numPlayers, contractRound,
    hands, stock, discardPile, contractFulfilled: Array(numPlayers).fill(false),
    tableMelds: [], scores: Array(numPlayers).fill(0),
    phase: "player-draw",
    message: `Contract: ${contract.map(p => `${p.minLen}+ ${p.type}`).join(" + ")}`,
    meldCounter: 0, winner: null,
  };
}

// ── isTerminal ───────────────────────────────────────────────────────────────

export function isTerminal(state: ContractRummyState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.winner === 0 ? 80 : 20 };
}
