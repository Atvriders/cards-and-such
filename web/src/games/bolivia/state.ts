import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BoliviaSettings {
  botCount: number;
}

export type Phase = "player-draw" | "player-meld" | "bot-turn" | "done";

export interface TableMeld {
  id: string;
  cards: Card[];
  owner: number;
  isWildMeld: boolean; // true = all wilds (for Bolivia bonus)
}

export interface BoliviaState {
  settings: BoliviaSettings;
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

export type BoliviaAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "discard"; cardId: string };

// ── Helpers ──────────────────────────────────────────────────────────────────

export function isWild(card: Card): boolean {
  return card.rank === 2 || card.id.startsWith("joker-");
}

export function cardPoints(rank: Rank): number {
  if (rank === 2) return 20;
  if (rank === 1) return 20;
  if (rank >= 8) return 10;
  return 5;
}

export function isValidMeld(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  // Wild-only meld (Bolivia)
  if (cards.every(c => isWild(c))) return true;
  // Normal set: naturals same rank, wilds <= naturals, max 3 wilds
  const naturals = cards.filter(c => !isWild(c));
  const wilds = cards.filter(c => isWild(c));
  if (naturals.length === 0) return false;
  if (wilds.length > naturals.length) return false;
  if (wilds.length > 3) return false;
  const rank = naturals[0]!.rank;
  if (rank === 3) return false;
  return naturals.every(c => c.rank === rank);
}

export function isBolivia(meld: TableMeld): boolean {
  return meld.isWildMeld && meld.cards.length >= 7;
}

export function isCanasta(meld: TableMeld): boolean {
  return !meld.isWildMeld && meld.cards.length >= 7;
}

function meldScore(meld: TableMeld): number {
  let s = meld.cards.reduce((sum, c) => sum + (isWild(c) ? 40 : cardPoints(c.rank)), 0); // wilds count double in Bolivia
  if (isBolivia(meld)) s += 2500;
  else if (isCanasta(meld)) s += 500;
  return s;
}

function makeDeck(rng: () => number): Card[] {
  const cards = newDeck(2);
  for (let j = 0; j < 4; j++) cards.push({ suit: "♠", rank: 2, id: `joker-${j}` });
  return shuffle(cards, rng);
}

// ── Bot AI ──────────────────────────────────────────────────────────────────

function botTurn(state: BoliviaState, seat: number, rng: () => number): BoliviaState {
  let stock = [...state.stock];
  let discardPile = [...state.discardPile];
  let hand = [...state.hands[seat]!];
  const tableMelds = [...state.tableMelds];
  let meldCounter = state.meldCounter;

  if (stock.length === 0 && discardPile.length > 1) {
    const top = discardPile.pop()!;
    stock = shuffle(discardPile, rng);
    discardPile = [top];
  }
  if (stock.length > 0) hand.push(stock.shift()!);

  // Try set melds
  const byRank = new Map<Rank, Card[]>();
  for (const c of hand) {
    if (!isWild(c) && c.rank !== 3) {
      const arr = byRank.get(c.rank) ?? [];
      arr.push(c);
      byRank.set(c.rank, arr);
    }
  }
  for (const [, group] of byRank) {
    if (group.length >= 3) {
      const meldCards = group.slice(0, Math.min(7, group.length));
      tableMelds.push({ id: `m-${seat}-${meldCounter++}`, cards: meldCards, owner: seat, isWildMeld: false });
      const ids = new Set(meldCards.map(c => c.id));
      hand = hand.filter(c => !ids.has(c.id));
    }
  }

  // Try wild meld if 3+ wilds
  const wilds = hand.filter(c => isWild(c));
  if (wilds.length >= 3) {
    tableMelds.push({ id: `m-${seat}-${meldCounter++}`, cards: wilds, owner: seat, isWildMeld: true });
    const ids = new Set(wilds.map(c => c.id));
    hand = hand.filter(c => !ids.has(c.id));
  }

  if (hand.length > 0) {
    const nonWilds = hand.filter(c => !isWild(c));
    const toDiscard = nonWilds.length > 0 ? nonWilds.reduce((hi, c) => cardPoints(c.rank) > cardPoints(hi.rank) ? c : hi) : hand[0]!;
    hand = hand.filter(c => c.id !== toDiscard.id);
    discardPile.push(toDiscard);
  }

  const hands = state.hands.map((h, i) => i === seat ? hand : h) as Card[][];
  return { ...state, stock, discardPile, hands, tableMelds, meldCounter };
}

// ── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state: BoliviaState, action: BoliviaAction): BoliviaState {
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
    return { ...state, rngSeed: nextSeed, stock, discardPile, hands, phase: "player-meld", message: "Meld or discard." };
  }

  if (action.type === "draw-discard" && state.phase === "player-draw") {
    if (state.discardPile.length === 0) return state;
    const discardPile = [...state.discardPile];
    const drawn = discardPile.pop()!;
    const hands = state.hands.map((h, i) => i === 0 ? [...h, drawn] : h) as Card[][];
    return { ...state, rngSeed: nextSeed, discardPile, hands, phase: "player-meld", message: "Meld or discard." };
  }

  if (action.type === "meld" && state.phase === "player-meld") {
    const hand = [...state.hands[0]!];
    const meldCards = action.cardIds.map(id => hand.find(c => c.id === id)).filter(Boolean) as Card[];
    if (!isValidMeld(meldCards)) return { ...state, message: "Invalid meld." };
    const isWildMeld = meldCards.every(c => isWild(c));
    const ids = new Set(action.cardIds);
    const newHand = hand.filter(c => !ids.has(c.id));
    const tableMelds = [...state.tableMelds, { id: `m-0-${state.meldCounter}`, cards: meldCards, owner: 0, isWildMeld }];
    const hands = state.hands.map((h, i) => i === 0 ? newHand : h) as Card[][];
    return { ...state, rngSeed: nextSeed, hands, tableMelds, meldCounter: state.meldCounter + 1, message: isWildMeld ? "Wild meld!" : "Meld placed!" };
  }

  if (action.type === "discard" && state.phase === "player-meld") {
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    const hand = state.hands[0]!.filter(c => c.id !== action.cardId) as Card[];
    const discardPile = [...state.discardPile, card];
    const hands = state.hands.map((h, i) => i === 0 ? hand : h) as Card[][];

    const myMelds = state.tableMelds.filter(m => m.owner === 0);
    const hasCanasta = myMelds.some(m => isCanasta(m) || isBolivia(m));
    if (hand.length === 0 && hasCanasta) {
      const scores = state.scores.map((s, i) => s + state.tableMelds.filter(m => m.owner === i).reduce((sum, m) => sum + meldScore(m), 0) + (i === 0 ? 100 : 0));
      return { ...state, rngSeed: nextSeed, hands, discardPile, scores, phase: "done", message: "You went out!" };
    }

    let s: BoliviaState = { ...state, rngSeed: nextSeed, hands, discardPile, phase: "bot-turn" };
    for (let bot = 1; bot < s.numPlayers; bot++) s = botTurn(s, bot, botRng);
    return { ...s, phase: "player-draw", message: "Your turn." };
  }

  return state;
}

// ── initialState ─────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: BoliviaSettings): BoliviaState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const numPlayers = 1 + settings.botCount;
  const deck = makeDeck(dealRng);
  const hands: Card[][] = [];
  let pos = 0;
  for (let i = 0; i < numPlayers; i++) { hands.push(deck.slice(pos, pos + 11)); pos += 11; }
  const discardPile = [deck[pos]!];
  const stock = deck.slice(pos + 1);

  return {
    settings, rngSeed: Math.floor(dealRng() * 2 ** 31), numPlayers,
    hands, stock, discardPile, tableMelds: [],
    scores: Array(numPlayers).fill(0), phase: "player-draw",
    message: "Draw from stock or discard.", meldCounter: 0,
  };
}

// ── isTerminal ───────────────────────────────────────────────────────────────

export function isTerminal(state: BoliviaState): { score: number } | null {
  if (state.phase !== "done") return null;
  const p = state.scores[0]!;
  const b = Math.max(...state.scores.slice(1));
  return { score: Math.max(0, Math.min(100, 50 + Math.floor((p - b) / 30))) };
}
