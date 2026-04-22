import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FiveHundredRumSettings {
  numBots: number;
}

export type Phase = "player-draw" | "player-meld" | "bot-turn" | "done";

export interface TableMeld {
  id: string;
  cards: Card[];
  owner: number;
}

export interface FiveHundredRumState {
  settings: FiveHundredRumSettings;
  rngSeed: number;
  numPlayers: number;
  hands: readonly (readonly Card[])[];
  stock: readonly Card[];
  discardPile: readonly Card[];
  tableMelds: TableMeld[];
  scores: readonly number[];
  phase: Phase;
  message: string;
  meldCounter: number;
}

export type FiveHundredRumAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "layoff"; cardId: string; meldId: string }
  | { type: "discard"; cardId: string };

// ── Helpers ──────────────────────────────────────────────────────────────────

export function cardMeldValue(rank: Rank): number {
  if (rank === 1) return 15; // Ace high in 500 Rum
  if (rank >= 11) return 10;
  return rank;
}

export function isValidSet(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const rank = cards[0]!.rank;
  if (!cards.every(c => c.rank === rank)) return false;
  const suits = new Set(cards.map(c => c.suit));
  return suits.size === cards.length;
}

export function isValidRun(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const suit = cards[0]!.suit;
  if (!cards.every(c => c.suit === suit)) return false;
  const ranks = cards.map(c => c.rank).sort((a, b) => a - b);
  for (let i = 1; i < ranks.length; i++) {
    if (ranks[i]! !== ranks[i - 1]! + 1) return false;
  }
  return true;
}

export function isValidMeld(cards: Card[]): boolean {
  return isValidSet(cards) || isValidRun(cards);
}

export function canLayOff(card: Card, meld: TableMeld): boolean {
  const cards = meld.cards;
  const allSameRank = cards.every(c => c.rank === cards[0]!.rank);
  if (allSameRank) {
    return card.rank === cards[0]!.rank && !cards.some(c => c.suit === card.suit);
  }
  const allSameSuit = cards.every(c => c.suit === cards[0]!.suit);
  if (allSameSuit && card.suit === cards[0]!.suit) {
    const ranks = cards.map(c => c.rank).sort((a, b) => a - b);
    const min = ranks[0]!;
    const max = ranks[ranks.length - 1]!;
    return card.rank === min - 1 || card.rank === max + 1;
  }
  return false;
}

// ── Bot AI ──────────────────────────────────────────────────────────────────

function botTurn(state: FiveHundredRumState, seat: number, rng: () => number): FiveHundredRumState {
  let stock = [...state.stock];
  let discardPile = [...state.discardPile];
  let hand = [...state.hands[seat]!];
  const tableMelds = [...state.tableMelds];
  let meldCounter = state.meldCounter;
  let scores = [...state.scores];

  if (stock.length === 0 && discardPile.length > 1) {
    const top = discardPile.pop()!;
    stock = shuffle(discardPile, rng);
    discardPile = [top];
  }
  if (stock.length > 0) hand.push(stock.shift()!);

  // Try set melds by rank
  const byRank = new Map<number, Card[]>();
  for (const c of hand) {
    const arr = byRank.get(c.rank) ?? [];
    arr.push(c);
    byRank.set(c.rank, arr);
  }
  for (const [, group] of byRank) {
    if (group.length >= 3 && isValidSet(group.slice(0, 3))) {
      const meldCards = group.slice(0, 3);
      const meldVal = meldCards.reduce((s, c) => s + cardMeldValue(c.rank), 0);
      tableMelds.push({ id: `m-${seat}-${meldCounter++}`, cards: meldCards, owner: seat });
      scores = scores.map((s, i) => i === seat ? s + meldVal : s);
      const ids = new Set(meldCards.map(c => c.id));
      hand = hand.filter(c => !ids.has(c.id));
    }
  }

  // Lay off onto existing melds
  let changed = true;
  while (changed) {
    changed = false;
    for (let mi = 0; mi < tableMelds.length; mi++) {
      for (let di = hand.length - 1; di >= 0; di--) {
        if (canLayOff(hand[di]!, tableMelds[mi]!)) {
          const card = hand.splice(di, 1)[0]!;
          tableMelds[mi] = { ...tableMelds[mi]!, cards: [...tableMelds[mi]!.cards, card] };
          scores = scores.map((s, i) => i === seat ? s + cardMeldValue(card.rank) : s);
          changed = true;
        }
      }
    }
  }

  // Check if out (score >= 500)
  if (scores[seat]! >= 500 || hand.length === 0) {
    const hands = state.hands.map((h, i) => i === seat ? hand : h) as Card[][];
    const penalty = hand.reduce((s, c) => s + cardMeldValue(c.rank), 0);
    const finalScores = scores.map((s, i) => i === seat ? s - penalty : s);
    return { ...state, stock, discardPile, hands, tableMelds, meldCounter, scores: finalScores, phase: "done", message: `Bot ${seat} won!` };
  }

  // Discard highest value card
  const toDiscard = hand.reduce((hi, c) => cardMeldValue(c.rank) > cardMeldValue(hi.rank) ? c : hi);
  hand = hand.filter(c => c.id !== toDiscard.id);
  discardPile.push(toDiscard);

  const hands = state.hands.map((h, i) => i === seat ? hand : h) as Card[][];
  return { ...state, stock, discardPile, hands, tableMelds, meldCounter, scores };
}

// ── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state: FiveHundredRumState, action: FiveHundredRumAction): FiveHundredRumState {
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
    return { ...state, rngSeed: nextSeed, stock, discardPile, hands, phase: "player-meld", message: "Meld, lay off, or discard." };
  }

  if (action.type === "draw-discard" && state.phase === "player-draw") {
    if (state.discardPile.length === 0) return state;
    const discardPile = [...state.discardPile];
    const drawn = discardPile.pop()!;
    const hands = state.hands.map((h, i) => i === 0 ? [...h, drawn] : h) as Card[][];
    return { ...state, rngSeed: nextSeed, discardPile, hands, phase: "player-meld", message: "Meld, lay off, or discard." };
  }

  if (action.type === "meld" && state.phase === "player-meld") {
    const hand = [...state.hands[0]!];
    const meldCards = action.cardIds.map(id => hand.find(c => c.id === id)).filter(Boolean) as Card[];
    if (!isValidMeld(meldCards)) return { ...state, message: "Invalid meld. Need 3+ same rank or 3+ consecutive same suit." };

    const ids = new Set(action.cardIds);
    const newHand = hand.filter(c => !ids.has(c.id));
    const meldVal = meldCards.reduce((s, c) => s + cardMeldValue(c.rank), 0);
    const tableMelds = [...state.tableMelds, { id: `m-0-${state.meldCounter}`, cards: meldCards, owner: 0 }];
    const scores = state.scores.map((s, i) => i === 0 ? s + meldVal : s);
    const hands = state.hands.map((h, i) => i === 0 ? newHand : h) as Card[][];

    if (scores[0]! >= 500 || newHand.length === 0) {
      return { ...state, rngSeed: nextSeed, hands, tableMelds, meldCounter: state.meldCounter + 1, scores, phase: "done", message: "You reached 500! You win!" };
    }
    return { ...state, rngSeed: nextSeed, hands, tableMelds, meldCounter: state.meldCounter + 1, scores, message: "Meld placed! Score: " + scores[0] };
  }

  if (action.type === "layoff" && state.phase === "player-meld") {
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    const meld = state.tableMelds.find(m => m.id === action.meldId);
    if (!card || !meld) return state;
    if (!canLayOff(card, meld)) return { ...state, message: "Can't lay off that card on that meld." };
    const newMeld = { ...meld, cards: [...meld.cards, card] };
    const tableMelds = state.tableMelds.map(m => m.id === action.meldId ? newMeld : m);
    const hand = state.hands[0]!.filter(c => c.id !== action.cardId);
    const meldVal = cardMeldValue(card.rank);
    const scores = state.scores.map((s, i) => i === 0 ? s + meldVal : s);
    const hands = state.hands.map((h, i) => i === 0 ? hand : h) as Card[][];
    if (scores[0]! >= 500 || hand.length === 0) {
      return { ...state, rngSeed: nextSeed, hands, tableMelds, scores, phase: "done", message: "You reached 500! You win!" };
    }
    return { ...state, rngSeed: nextSeed, hands, tableMelds, scores, message: "Laid off! Score: " + scores[0] };
  }

  if (action.type === "discard" && state.phase === "player-meld") {
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    const hand = state.hands[0]!.filter(c => c.id !== action.cardId) as Card[];
    const discardPile = [...state.discardPile, card];
    const hands = state.hands.map((h, i) => i === 0 ? hand : h) as Card[][];

    let s: FiveHundredRumState = { ...state, rngSeed: nextSeed, hands, discardPile, phase: "bot-turn" };
    for (let bot = 1; bot < s.numPlayers; bot++) {
      s = botTurn(s, bot, botRng);
      if (s.phase === "done") return s;
    }
    return { ...s, phase: "player-draw", message: `Your turn. Score: ${s.scores[0]}` };
  }

  return state;
}

// ── initialState ─────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: FiveHundredRumSettings): FiveHundredRumState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const numPlayers = 1 + settings.numBots;
  const deck = shuffle(newDeck(), dealRng);
  const hands: Card[][] = [];
  let pos = 0;
  for (let i = 0; i < numPlayers; i++) { hands.push(deck.slice(pos, pos + 7)); pos += 7; }
  const discardPile = [deck[pos]!];
  const stock = deck.slice(pos + 1);

  return {
    settings, rngSeed: Math.floor(dealRng() * 2 ** 31), numPlayers,
    hands, stock, discardPile, tableMelds: [],
    scores: Array(numPlayers).fill(0), phase: "player-draw",
    message: "First to 500 points wins! Draw to start.", meldCounter: 0,
  };
}

// ── isTerminal ───────────────────────────────────────────────────────────────

export function isTerminal(state: FiveHundredRumState): { score: number } | null {
  if (state.phase !== "done") return null;
  const p = state.scores[0]!;
  const b = Math.max(...state.scores.slice(1));
  return { score: p >= b ? Math.min(100, 60 + Math.floor((p - b) / 10)) : Math.max(0, 40 - Math.floor((b - p) / 10)) };
}
