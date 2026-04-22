import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CanastaSettings {
  botCount: number;
}

export type Phase = "player-draw" | "player-meld" | "bot-turn" | "done";

export interface TableMeld {
  id: string;
  cards: Card[];
  owner: number;
}

export interface CanastaState {
  settings: CanastaSettings;
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
  firstMeldMade: readonly boolean[]; // whether player has met min first meld threshold
}

export type CanastaAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "layoff"; cardId: string; meldId: string }
  | { type: "discard"; cardId: string }
  | { type: "go-out"; cardId: string };

// ── Helpers ──────────────────────────────────────────────────────────────────

export function isJoker(card: Card): boolean {
  return card.id.startsWith("joker-");
}

export function isWild(card: Card): boolean {
  return card.rank === 2 || isJoker(card);
}

export function cardPoints(rank: Rank): number {
  if (rank === 2) return 20;
  if (rank === 1) return 20;  // Ace
  if (rank >= 8) return 10;
  if (rank >= 4) return 5;
  return 5; // 3,4,5,6,7 = 5
}

export function isValidMeld(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const naturals = cards.filter(c => !isWild(c));
  const wilds = cards.filter(c => isWild(c));
  if (naturals.length === 0) return false;
  if (wilds.length > naturals.length) return false;
  if (wilds.length > 3) return false; // max 3 wilds
  const rank = naturals[0]!.rank;
  // Rank 3 cannot be melded normally
  if (rank === 3) return false;
  return naturals.every(c => c.rank === rank);
}

export function meldValue(cards: Card[]): number {
  return cards.reduce((sum, c) => sum + (isWild(c) ? 20 : cardPoints(c.rank)), 0);
}

export function isCanasta(meld: TableMeld): boolean {
  return meld.cards.length >= 7;
}

export function isNaturalCanasta(meld: TableMeld): boolean {
  return isCanasta(meld) && meld.cards.every(c => !isWild(c));
}

export function firstMeldThreshold(score: number): number {
  if (score < 0) return 15;
  if (score < 1500) return 50;
  if (score < 3000) return 90;
  return 120;
}

export function computeRoundScore(state: CanastaState, seat: number): number {
  const myMelds = state.tableMelds.filter(m => m.owner === seat);
  const handPenalty = state.hands[seat]!.reduce((s, c) => s + (isWild(c) ? 20 : cardPoints(c.rank)), 0);
  const meldScore = myMelds.reduce((sum, m) => {
    let s = meldValue(m.cards);
    if (isNaturalCanasta(m)) s += 500;
    else if (isCanasta(m)) s += 300;
    return sum + s;
  }, 0);
  return meldScore - handPenalty;
}

export function makeDeck(rng: () => number): Card[] {
  const cards = newDeck(2);
  // Add 4 jokers
  for (let j = 0; j < 4; j++) {
    cards.push({ suit: "♠", rank: 2, id: `joker-${j}` });
  }
  return shuffle(cards, rng);
}

// ── Bot AI ──────────────────────────────────────────────────────────────────

function botTurn(state: CanastaState, seat: number, rng: () => number): CanastaState {
  let stock = [...state.stock];
  let discardPile = [...state.discardPile];
  let hand = [...state.hands[seat]!];
  const tableMelds = [...state.tableMelds];
  let meldCounter = state.meldCounter;
  const firstMeldMade = [...state.firstMeldMade];

  // Draw from stock
  if (stock.length === 0) {
    if (discardPile.length > 1) {
      const top = discardPile.pop()!;
      stock = shuffle(discardPile, rng);
      discardPile = [top];
    }
  }
  if (stock.length > 0) hand.push(stock.shift()!);

  // Try to meld by rank
  const byRank = new Map<Rank, Card[]>();
  for (const c of hand) {
    if (!isWild(c)) {
      const arr = byRank.get(c.rank) ?? [];
      arr.push(c);
      byRank.set(c.rank, arr);
    }
  }
  const wilds = hand.filter(c => isWild(c));

  for (const [, group] of byRank) {
    if (group.length >= 3 || (group.length >= 2 && wilds.length >= 1)) {
      const naturals = group.slice(0, Math.min(7, group.length));
      const meldCards = naturals.slice(0, 3);
      if (!isValidMeld(meldCards)) continue;
      const val = meldValue(meldCards);
      if (!firstMeldMade[seat] && val < firstMeldThreshold(state.scores[seat]!)) continue;

      const finalCards = group.slice(0, Math.min(7, group.length));
      tableMelds.push({ id: `m-${seat}-${meldCounter++}`, cards: finalCards, owner: seat });
      const ids = new Set(finalCards.map(c => c.id));
      hand = hand.filter(c => !ids.has(c.id));
      firstMeldMade[seat] = true;
    }
  }

  // Discard
  const nonWilds = hand.filter(c => !isWild(c));
  const toDiscard = nonWilds.length > 0
    ? nonWilds.reduce((hi, c) => cardPoints(c.rank) > cardPoints(hi.rank) ? c : hi)
    : hand[0];
  if (toDiscard) {
    hand = hand.filter(c => c.id !== toDiscard.id);
    discardPile.push(toDiscard);
  }

  const hands = state.hands.map((h, i) => i === seat ? hand : h) as Card[][];
  return { ...state, stock, discardPile, hands, tableMelds, meldCounter, firstMeldMade };
}

// ── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state: CanastaState, action: CanastaAction): CanastaState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  if (action.type === "draw-stock" && state.phase === "player-draw") {
    let stock = [...state.stock];
    let discardPile = [...state.discardPile];
    if (stock.length === 0) {
      if (discardPile.length > 1) {
        const top = discardPile.pop()!;
        stock = shuffle(discardPile, botRng);
        discardPile = [top];
      } else return state;
    }
    const drawn = stock.shift()!;
    const hand = [...state.hands[0]!, drawn];
    const hands = state.hands.map((h, i) => i === 0 ? hand : h) as Card[][];
    return { ...state, rngSeed: nextSeed, stock, discardPile, hands, phase: "player-meld", message: "Meld or discard." };
  }

  if (action.type === "draw-discard" && state.phase === "player-draw") {
    if (state.discardPile.length === 0) return state;
    const discardPile = [...state.discardPile];
    const drawn = discardPile.pop()!;
    if (isWild(drawn)) return { ...state, message: "Cannot take a wild from discard directly." };
    const hand = [...state.hands[0]!, drawn];
    const hands = state.hands.map((h, i) => i === 0 ? hand : h) as Card[][];
    return { ...state, rngSeed: nextSeed, discardPile, hands, phase: "player-meld", message: "Meld or discard." };
  }

  if (action.type === "meld" && state.phase === "player-meld") {
    const hand = [...state.hands[0]!];
    const meldCards = action.cardIds.map(id => hand.find(c => c.id === id)).filter(Boolean) as Card[];
    if (!isValidMeld(meldCards)) return { ...state, message: "Invalid meld. Need 3+ same rank, max 3 wilds, wilds ≤ naturals." };

    const val = meldValue(meldCards);
    const threshold = firstMeldThreshold(state.scores[0]!);
    if (!state.firstMeldMade[0] && val < threshold) {
      return { ...state, message: `First meld must be worth at least ${threshold} pts.` };
    }

    const ids = new Set(action.cardIds);
    const newHand = hand.filter(c => !ids.has(c.id));
    const tableMelds = [...state.tableMelds, { id: `m-0-${state.meldCounter}`, cards: meldCards, owner: 0 }];
    const firstMeldMade = state.firstMeldMade.map((v, i) => i === 0 ? true : v);
    const hands = state.hands.map((h, i) => i === 0 ? newHand : h) as Card[][];
    return { ...state, rngSeed: nextSeed, hands, tableMelds, meldCounter: state.meldCounter + 1, firstMeldMade, message: "Meld placed!" };
  }

  if (action.type === "layoff" && state.phase === "player-meld") {
    const meld = state.tableMelds.find(m => m.id === action.meldId);
    if (!meld) return state;
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    // Can lay off same rank onto existing meld (not exceeding 7 wilds limit)
    const rank = meld.cards.filter(c => !isWild(c))[0]?.rank;
    if (!rank) return state;
    if (!isWild(card) && card.rank !== rank) return { ...state, message: "Card doesn't match the meld rank." };

    const newMeld = { ...meld, cards: [...meld.cards, card] };
    const tableMelds = state.tableMelds.map(m => m.id === action.meldId ? newMeld : m);
    const hand = state.hands[0]!.filter(c => c.id !== action.cardId);
    const hands = state.hands.map((h, i) => i === 0 ? hand : h) as Card[][];
    return { ...state, rngSeed: nextSeed, hands, tableMelds, message: "Card laid off." };
  }

  if (action.type === "discard" && state.phase === "player-meld") {
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    const hand = state.hands[0]!.filter(c => c.id !== action.cardId) as Card[];
    const discardPile = [...state.discardPile, card];
    const hands = state.hands.map((h, i) => i === 0 ? hand : h) as Card[][];

    let s: CanastaState = { ...state, rngSeed: nextSeed, hands, discardPile, phase: "bot-turn" };
    for (let bot = 1; bot < s.numPlayers; bot++) {
      s = botTurn(s, bot, botRng);
    }
    return { ...s, phase: "player-draw", message: "Your turn — draw from stock or discard." };
  }

  if (action.type === "go-out" && state.phase === "player-meld") {
    // Must have at least one canasta
    const myMelds = state.tableMelds.filter(m => m.owner === 0);
    const hasCanasta = myMelds.some(m => isCanasta(m));
    if (!hasCanasta) return { ...state, message: "You need at least one Canasta to go out." };

    const scores = state.scores.map((s, i) => s + computeRoundScore(state, i) + (i === 0 ? 100 : 0));
    return { ...state, rngSeed: nextSeed, scores, phase: "done", message: "You went out! +100 bonus." };
  }

  return state;
}

// ── initialState ─────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: CanastaSettings): CanastaState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const numPlayers = 1 + settings.botCount;
  const deck = makeDeck(dealRng);

  const hands: Card[][] = [];
  let pos = 0;
  for (let i = 0; i < numPlayers; i++) {
    hands.push(deck.slice(pos, pos + 11));
    pos += 11;
  }
  const discardPile = [deck[pos]!];
  const stock = deck.slice(pos + 1);

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    numPlayers,
    hands,
    stock,
    discardPile,
    tableMelds: [],
    scores: Array(numPlayers).fill(0),
    phase: "player-draw",
    message: "Draw from stock or take discard.",
    meldCounter: 0,
    firstMeldMade: Array(numPlayers).fill(false),
  };
}

// ── isTerminal ───────────────────────────────────────────────────────────────

export function isTerminal(state: CanastaState): { score: number } | null {
  if (state.phase !== "done") return null;
  const playerScore = state.scores[0]!;
  const maxBot = Math.max(...state.scores.slice(1));
  const delta = playerScore - maxBot;
  return { score: Math.max(0, Math.min(100, 50 + Math.floor(delta / 20))) };
}
