import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HandAndFootSettings {
  botCount: number;
}

export type Phase = "player-draw" | "player-meld" | "bot-turn" | "done";

export interface TableMeld {
  id: string;
  cards: Card[];
  isClean: boolean; // true = no wilds
  owner: number;
}

export interface HandAndFootState {
  settings: HandAndFootSettings;
  rngSeed: number;
  numPlayers: number;
  // Each player has "hand" (current) and "foot" (revealed after hand exhausted)
  hands: readonly (readonly Card[])[];
  feet: readonly (readonly Card[])[];
  usingFoot: readonly boolean[];
  stock: readonly Card[];
  discardPile: readonly Card[];
  tableMelds: TableMeld[];
  scores: readonly number[];
  phase: Phase;
  message: string;
  meldCounter: number;
}

export type HandAndFootAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "discard"; cardId: string };

// ── Helpers ──────────────────────────────────────────────────────────────────

export function cardValue(rank: Rank): number {
  if (rank === 2) return 20; // wilds (2s)
  if (rank === 1) return 20;  // Aces
  if (rank >= 8) return 10;
  return 5;
}

export function isWild(card: Card): boolean {
  return card.rank === 2 || card.suit === "🃏" as never;
}

// For our deck, jokers are rank=2 with suit="★" (we encode jokers as extra cards)
export function makeMultiDeck(copies: number, jokers: number, rng: () => number): Card[] {
  const cards: Card[] = [];
  for (let c = 0; c < copies; c++) {
    const suits = ["♠", "♥", "♦", "♣"] as const;
    const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;
    for (const s of suits) for (const r of ranks) {
      cards.push({ suit: s, rank: r, id: `${c}-${s}${r}` });
    }
  }
  for (let j = 0; j < jokers; j++) {
    // encode joker as rank=2, suit=♠ with special id prefix
    cards.push({ suit: "♠", rank: 2, id: `joker-${j}` });
  }
  return shuffle(cards, rng);
}

export function isValidMeld(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const naturals = cards.filter(c => !isWild(c));
  const wilds = cards.filter(c => isWild(c));
  if (naturals.length === 0) return false;
  // Can't have more wilds than naturals
  if (wilds.length > naturals.length) return false;
  // All naturals must be same rank
  const rank = naturals[0]!.rank;
  return naturals.every(c => c.rank === rank);
}

function isMeldClean(meld: TableMeld): boolean {
  return meld.cards.every(c => !isWild(c));
}

function meldScore(meld: TableMeld): number {
  const isCanasta = meld.cards.length >= 7;
  if (isCanasta) {
    return isMeldClean(meld) ? 500 : 300;
  }
  return meld.cards.reduce((sum, c) => sum + cardValue(c.rank), 0);
}

export function computeFinalScore(state: HandAndFootState, seat: number): number {
  const myMelds = state.tableMelds.filter(m => m.owner === seat);
  return myMelds.reduce((sum, m) => sum + meldScore(m), 0);
}

// ── Bot AI ──────────────────────────────────────────────────────────────────

function botTurn(state: HandAndFootState, seat: number, rng: () => number): HandAndFootState {
  let stock = [...state.stock];
  let discardPile = [...state.discardPile];
  let hand = [...state.hands[seat]!];
  let feet = [...state.feet];
  let usingFoot = [...state.usingFoot];
  const tableMelds = [...state.tableMelds];
  let meldCounter = state.meldCounter;

  // Draw 2 from stock (Hand and Foot draws 2)
  for (let i = 0; i < 2; i++) {
    if (stock.length === 0) {
      if (discardPile.length > 1) {
        const top = discardPile.pop()!;
        stock = shuffle(discardPile, rng);
        discardPile = [top];
      } else break;
    }
    hand.push(stock.shift()!);
  }

  // Try to form melds from naturals grouped by rank
  const byRank = new Map<Rank, Card[]>();
  for (const c of hand) {
    if (!isWild(c)) {
      const arr = byRank.get(c.rank) ?? [];
      arr.push(c);
      byRank.set(c.rank, arr);
    }
  }
  for (const [, group] of byRank) {
    if (group.length >= 3) {
      const meldCards = group.slice(0, Math.min(7, group.length));
      tableMelds.push({ id: `m-${seat}-${meldCounter++}`, cards: meldCards, isClean: true, owner: seat });
      const ids = new Set(meldCards.map(c => c.id));
      hand = hand.filter(c => !ids.has(c.id));
    }
  }

  // Discard highest-value card
  if (hand.length > 0) {
    const toDiscard = hand.reduce((hi, c) => cardValue(c.rank) > cardValue(hi.rank) ? c : hi);
    hand = hand.filter(c => c.id !== toDiscard.id);
    discardPile.push(toDiscard);
  }

  // If hand empty, switch to foot
  if (hand.length === 0 && !usingFoot[seat] && feet[seat] && feet[seat]!.length > 0) {
    hand = [...feet[seat]!];
    feet = feet.map((f, i) => i === seat ? [] : f);
    usingFoot = usingFoot.map((u, i) => i === seat ? true : u);
  }

  const hands = state.hands.map((h, i) => i === seat ? hand : h) as Card[][];
  const newFeet = state.feet.map((f, i) => i === seat ? feet[i] ?? f : f) as Card[][];

  return { ...state, stock, discardPile, hands, feet: newFeet, usingFoot, tableMelds, meldCounter };
}

// ── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state: HandAndFootState, action: HandAndFootAction): HandAndFootState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  if (action.type === "draw-stock" && state.phase === "player-draw") {
    let stock = [...state.stock];
    let discardPile = [...state.discardPile];
    let hand = [...state.hands[0]!];

    // Draw 2 cards
    for (let i = 0; i < 2; i++) {
      if (stock.length === 0) {
        if (discardPile.length > 1) {
          const top = discardPile.pop()!;
          stock = shuffle(discardPile, botRng);
          discardPile = [top];
        } else break;
      }
      hand.push(stock.shift()!);
    }

    const hands = state.hands.map((h, i) => i === 0 ? hand : h) as Card[][];
    return { ...state, rngSeed: nextSeed, stock, discardPile, hands, phase: "player-meld", message: "Meld cards or discard." };
  }

  if (action.type === "draw-discard" && state.phase === "player-draw") {
    if (state.discardPile.length === 0) return state;
    const discardPile = [...state.discardPile];
    const drawn = discardPile.pop()!;
    const hand = [...state.hands[0]!, drawn];
    const hands = state.hands.map((h, i) => i === 0 ? hand : h) as Card[][];
    return { ...state, rngSeed: nextSeed, discardPile, hands, phase: "player-meld", message: "Meld cards or discard." };
  }

  if (action.type === "meld" && state.phase === "player-meld") {
    const hand = [...state.hands[0]!];
    const meldCards = action.cardIds.map(id => hand.find(c => c.id === id)).filter(Boolean) as Card[];
    if (!isValidMeld(meldCards)) return { ...state, message: "Invalid meld. Need 3+ same rank (max half wilds)." };

    const ids = new Set(action.cardIds);
    const newHand = hand.filter(c => !ids.has(c.id));
    const tableMelds = [...state.tableMelds, {
      id: `m-0-${state.meldCounter}`,
      cards: meldCards,
      isClean: meldCards.every(c => !isWild(c)),
      owner: 0,
    }];
    const hands = state.hands.map((h, i) => i === 0 ? newHand : h) as Card[][];
    return { ...state, rngSeed: nextSeed, hands, tableMelds, meldCounter: state.meldCounter + 1, message: "Meld placed! Continue or discard." };
  }

  if (action.type === "discard" && state.phase === "player-meld") {
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;

    let hand = state.hands[0]!.filter(c => c.id !== action.cardId) as Card[];
    const discardPile = [...state.discardPile, card];
    let usingFoot = [...state.usingFoot];
    let feet = [...state.feet] as Card[][];

    // Switch to foot if hand empty
    if (hand.length === 0 && !usingFoot[0] && feet[0] && feet[0]!.length > 0) {
      hand = [...feet[0]!];
      feet = feet.map((f, i) => i === 0 ? [] : f) as Card[][];
      usingFoot = usingFoot.map((u, i) => i === 0 ? true : u);
    }

    const hands = state.hands.map((h, i) => i === 0 ? hand : h) as Card[][];

    // Check if player is out (hand and foot both empty, canasta formed)
    const playerMelds = state.tableMelds.filter(m => m.owner === 0);
    const hasCanasta = playerMelds.some(m => m.cards.length >= 7);
    if (hand.length === 0 && usingFoot[0] && hasCanasta) {
      const scores = state.scores.map((s, i) => s + computeFinalScore({ ...state, tableMelds: state.tableMelds }, i));
      return { ...state, rngSeed: nextSeed, hands, feet, usingFoot, discardPile, scores, phase: "done", message: "You went out! Game over." };
    }

    // Bot turns
    let s: HandAndFootState = { ...state, rngSeed: nextSeed, hands, feet, usingFoot, discardPile, phase: "bot-turn" };
    for (let bot = 1; bot < s.numPlayers; bot++) {
      s = botTurn(s, bot, botRng);
      // Check if bot went out
      const botMelds = s.tableMelds.filter(m => m.owner === bot);
      const botHasCanasta = botMelds.some(m => m.cards.length >= 7);
      if (s.hands[bot]!.length === 0 && s.usingFoot[bot] && botHasCanasta) {
        const scores = s.scores.map((sc, i) => sc + computeFinalScore(s, i));
        return { ...s, scores, phase: "done", message: `Bot ${bot} went out! Game over.` };
      }
    }

    return { ...s, phase: "player-draw", message: "Your turn — draw 2 from stock or take discard." };
  }

  return state;
}

// ── initialState ─────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: HandAndFootSettings): HandAndFootState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const numPlayers = 1 + settings.botCount;
  // 4 decks + 8 jokers = 216 cards
  const deck = makeMultiDeck(4, 8, dealRng);

  const hands: Card[][] = [];
  const feet: Card[][] = [];
  let pos = 0;
  for (let i = 0; i < numPlayers; i++) {
    hands.push(deck.slice(pos, pos + 11));
    pos += 11;
    feet.push(deck.slice(pos, pos + 11));
    pos += 11;
  }

  const stock = deck.slice(pos);
  const discardPile: Card[] = [];

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    numPlayers,
    hands,
    feet,
    usingFoot: Array(numPlayers).fill(false),
    stock,
    discardPile,
    tableMelds: [],
    scores: Array(numPlayers).fill(0),
    phase: "player-draw",
    message: "Your turn — draw 2 from stock or take top discard.",
    meldCounter: 0,
  };
}

// ── isTerminal ───────────────────────────────────────────────────────────────

export function isTerminal(state: HandAndFootState): { score: number } | null {
  if (state.phase !== "done") return null;
  const playerScore = state.scores[0]!;
  return { score: Math.max(0, Math.min(100, 50 + Math.floor(playerScore / 10))) };
}
