import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface KalookiSettings {
  botCount: number;
}

export type Phase = "player-draw" | "player-meld" | "bot-turn" | "done";

export interface TableMeld {
  id: string;
  cards: Card[];
  owner: number;
}

export interface KalookiState {
  settings: KalookiSettings;
  rngSeed: number;
  numPlayers: number;
  hands: readonly (readonly Card[])[];
  stock: readonly Card[];
  discardPile: readonly Card[];
  tableMelds: TableMeld[];
  scores: readonly number[];
  hasMelded: readonly boolean[]; // has player melded at least once?
  phase: Phase;
  message: string;
  meldCounter: number;
  winner: number | null;
  kalookiBonus: boolean; // if player went out without prior melding
}

export type KalookiAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "layoff"; cardId: string; meldId: string }
  | { type: "discard"; cardId: string }
  | { type: "kalooki" }; // go out without prior meld

// ── Helpers ──────────────────────────────────────────────────────────────────

export function isWild(card: Card): boolean {
  return card.rank === 2 || card.id.startsWith("joker-");
}

export function cardValue(rank: Rank): number {
  if (rank === 1) return 1;
  if (rank === 2) return 25; // wilds expensive penalty
  if (rank >= 11) return 10;
  return rank;
}

export function isValidSet(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const naturals = cards.filter(c => !isWild(c));
  const wilds = cards.filter(c => isWild(c));
  if (naturals.length === 0) return false;
  if (wilds.length > naturals.length) return false;
  const rank = naturals[0]!.rank;
  return naturals.every(c => c.rank === rank);
}

export function isValidRun(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const naturals = cards.filter(c => !isWild(c));
  const wilds = cards.filter(c => isWild(c));
  if (naturals.length === 0) return false;
  const suit = naturals[0]!.suit;
  if (!naturals.every(c => c.suit === suit)) return false;
  const ranks = naturals.map(c => c.rank).sort((a, b) => a - b);
  // Allow wildcards to fill gaps
  let gaps = 0;
  for (let i = 1; i < ranks.length; i++) {
    const diff = ranks[i]! - ranks[i - 1]! - 1;
    if (diff < 0) return false;
    gaps += diff;
  }
  return gaps <= wilds.length;
}

export function isValidMeld(cards: Card[]): boolean {
  return isValidSet(cards) || isValidRun(cards);
}

export function canLayOff(card: Card, meld: TableMeld): boolean {
  const cards = meld.cards;
  const naturals = cards.filter(c => !isWild(c));
  const allSameRank = naturals.length > 0 && naturals.every(c => c.rank === naturals[0]!.rank);
  if (allSameRank) {
    if (isWild(card)) return true;
    return card.rank === naturals[0]!.rank && !cards.some(c => !isWild(c) && c.suit === card.suit);
  }
  // Run: try adding at ends
  const suit = naturals[0]?.suit;
  if (!suit) return false;
  if (!isWild(card) && card.suit !== suit) return false;
  return true; // simplified: allow any same-suit or wild to extend run
}

function deadwoodValue(hand: Card[]): number {
  return hand.reduce((sum, c) => sum + cardValue(c.rank), 0);
}

function makeDeck(rng: () => number): Card[] {
  const cards = newDeck(2);
  for (let j = 0; j < 4; j++) cards.push({ suit: "♠", rank: 2, id: `joker-${j}` });
  return shuffle(cards, rng);
}

// ── Bot AI ──────────────────────────────────────────────────────────────────

function botTurn(state: KalookiState, seat: number, rng: () => number): KalookiState {
  let stock = [...state.stock];
  let discardPile = [...state.discardPile];
  let hand = [...state.hands[seat]!];
  const tableMelds = [...state.tableMelds];
  let meldCounter = state.meldCounter;
  const hasMelded = [...state.hasMelded];
  let scores = [...state.scores];

  if (stock.length === 0 && discardPile.length > 1) {
    const top = discardPile.pop()!;
    stock = shuffle(discardPile, rng);
    discardPile = [top];
  }
  if (stock.length > 0) hand.push(stock.shift()!);

  // Try melds by rank (sets)
  const byRank = new Map<Rank, Card[]>();
  for (const c of hand) {
    if (!isWild(c)) {
      const arr = byRank.get(c.rank) ?? [];
      arr.push(c);
      byRank.set(c.rank, arr);
    }
  }
  for (const [, group] of byRank) {
    if (group.length >= 3 && isValidSet(group.slice(0, 3))) {
      const meldCards = group.slice(0, 3);
      tableMelds.push({ id: `m-${seat}-${meldCounter++}`, cards: meldCards, owner: seat });
      hasMelded[seat] = true;
      const ids = new Set(meldCards.map(c => c.id));
      hand = hand.filter(c => !ids.has(c.id));
    }
  }

  // Discard
  const toDiscard = hand.length > 0 ? hand.reduce((hi, c) => cardValue(c.rank) > cardValue(hi.rank) ? c : hi) : null;
  if (toDiscard) {
    hand = hand.filter(c => c.id !== toDiscard.id);
    discardPile.push(toDiscard);
  }

  // Check if went out
  if (hand.length === 0) {
    const penalty = 0;
    scores = scores.map((s, i) => i === seat ? s + penalty : s + deadwoodValue([...state.hands[i]!]));
    const hands = state.hands.map((h, i) => i === seat ? hand : h) as Card[][];
    return { ...state, stock, discardPile, hands, tableMelds, meldCounter, hasMelded, scores, phase: "done", winner: seat, kalookiBonus: false, message: `Bot ${seat} went out!` };
  }

  const hands = state.hands.map((h, i) => i === seat ? hand : h) as Card[][];
  return { ...state, stock, discardPile, hands, tableMelds, meldCounter, hasMelded, scores };
}

// ── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state: KalookiState, action: KalookiAction): KalookiState {
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
    if (!isValidMeld(meldCards)) return { ...state, message: "Invalid meld." };
    const ids = new Set(action.cardIds);
    const newHand = hand.filter(c => !ids.has(c.id));
    const tableMelds = [...state.tableMelds, { id: `m-0-${state.meldCounter}`, cards: meldCards, owner: 0 }];
    const hasMelded = state.hasMelded.map((v, i) => i === 0 ? true : v);
    const hands = state.hands.map((h, i) => i === 0 ? newHand : h) as Card[][];
    return { ...state, rngSeed: nextSeed, hands, tableMelds, meldCounter: state.meldCounter + 1, hasMelded, message: "Meld placed!" };
  }

  if (action.type === "layoff" && state.phase === "player-meld") {
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    const meld = state.tableMelds.find(m => m.id === action.meldId);
    if (!card || !meld) return state;
    if (!canLayOff(card, meld)) return { ...state, message: "Can't lay off that card there." };
    const newMeld = { ...meld, cards: [...meld.cards, card] };
    const tableMelds = state.tableMelds.map(m => m.id === action.meldId ? newMeld : m);
    const hand = state.hands[0]!.filter(c => c.id !== action.cardId);
    const hands = state.hands.map((h, i) => i === 0 ? hand : h) as Card[][];
    return { ...state, rngSeed: nextSeed, hands, tableMelds, message: "Laid off!" };
  }

  if (action.type === "kalooki" && state.phase === "player-meld") {
    // Must have all 13 cards form valid melds (no prior meld on table from player)
    const hand = state.hands[0]!;
    if (state.hasMelded[0]) return { ...state, message: "Kalooki only allowed if you haven't melded yet this hand." };
    // Check entire hand forms valid melds
    const h = [...hand];
    let canKalooki = false;
    // Simple check: all cards covered by at least one valid set/run partition
    if (h.length === 0) canKalooki = true;
    // Attempt basic check: if deadwood = 0
    canKalooki = h.length === 0; // simplified: must have empty hand after draw for kalooki
    if (!canKalooki) return { ...state, message: "Can't Kalooki yet — need to meld all 13 cards at once." };

    const otherPenalties = state.scores.map((s, i) => i === 0 ? s : s + deadwoodValue([...state.hands[i]!]));
    const scores = otherPenalties.map((s, i) => i === 0 ? s - 50 : s); // Kalooki bonus
    return { ...state, rngSeed: nextSeed, scores, phase: "done", winner: 0, kalookiBonus: true, message: "Kalooki! -50 bonus to your score!" };
  }

  if (action.type === "discard" && state.phase === "player-meld") {
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    const hand = state.hands[0]!.filter(c => c.id !== action.cardId) as Card[];
    const discardPile = [...state.discardPile, card];
    const hands = state.hands.map((h, i) => i === 0 ? hand : h) as Card[][];

    // Check if went out
    if (hand.length === 0) {
      const scores = state.scores.map((s, i) => i === 0 ? s : s + deadwoodValue([...state.hands[i]!]));
      const bonus = state.hasMelded[0] ? 0 : -50;
      const finalScores = scores.map((s, i) => i === 0 ? s + bonus : s);
      return { ...state, rngSeed: nextSeed, hands, discardPile, scores: finalScores, phase: "done", winner: 0, kalookiBonus: bonus < 0, message: bonus < 0 ? "Kalooki! You went out without melding!" : "You went out!" };
    }

    let s: KalookiState = { ...state, rngSeed: nextSeed, hands, discardPile, phase: "bot-turn" };
    for (let bot = 1; bot < s.numPlayers; bot++) {
      s = botTurn(s, bot, botRng);
      if (s.phase === "done") return s;
    }
    return { ...s, phase: "player-draw", message: "Your turn." };
  }

  return state;
}

// ── initialState ─────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: KalookiSettings): KalookiState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const numPlayers = 1 + settings.botCount;
  const deck = makeDeck(dealRng);
  const hands: Card[][] = [];
  let pos = 0;
  for (let i = 0; i < numPlayers; i++) { hands.push(deck.slice(pos, pos + 13)); pos += 13; }
  const discardPile = [deck[pos]!];
  const stock = deck.slice(pos + 1);

  return {
    settings, rngSeed: Math.floor(dealRng() * 2 ** 31), numPlayers,
    hands, stock, discardPile, tableMelds: [],
    scores: Array(numPlayers).fill(0), hasMelded: Array(numPlayers).fill(false),
    phase: "player-draw", message: "Draw to begin. Going out without prior melding = Kalooki bonus!",
    meldCounter: 0, winner: null, kalookiBonus: false,
  };
}

// ── isTerminal ───────────────────────────────────────────────────────────────

export function isTerminal(state: KalookiState): { score: number } | null {
  if (state.phase !== "done") return null;
  const p = state.scores[0]!;
  const b = Math.min(...state.scores.slice(1));
  // Lower = better (penalty game); player wins if scores[0] <= min bot score
  return { score: state.winner === 0 ? Math.min(95, 70 + (state.kalookiBonus ? 15 : 0)) : Math.max(5, 30 - Math.floor((p - b) / 5)) };
}
