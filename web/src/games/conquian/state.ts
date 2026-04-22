import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 40-card Spanish deck: A,2,3,4,5,6,7,J(11),Q(12),K(13)
const SPANISH_RANKS = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13] as const;
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function conquianDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of SPANISH_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `cq-${s}${r}` });
    }
  }
  return cards;
}

// Rank ordering for runs: A<2<3<4<5<6<7<J<Q<K
// Map ranks to sequential index for run detection
export function rankIndex(rank: Card["rank"]): number {
  const order: Card["rank"][] = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13];
  return order.indexOf(rank);
}

export type Meld = Card[];

/** Check if a group of cards is a valid meld (set of 3-4 same rank, or run of 3+ same suit) */
export function isValidMeld(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  // Set: all same rank
  if (cards.every(c => c.rank === cards[0]!.rank) && cards.length <= 4) return true;
  // Run: all same suit, consecutive ranks
  if (cards.every(c => c.suit === cards[0]!.suit)) {
    const indices = cards.map(c => rankIndex(c.rank)).sort((a, b) => a - b);
    for (let i = 1; i < indices.length; i++) {
      if (indices[i]! - indices[i - 1]! !== 1) return false;
    }
    return true;
  }
  return false;
}

/** Find all possible melds from a hand */
export function findMelds(hand: readonly Card[]): Meld[] {
  const results: Meld[] = [];
  const n = hand.length;

  // Try all subsets of size 3+
  for (let size = 3; size <= Math.min(4, n); size++) {
    for (let mask = 0; mask < (1 << n); mask++) {
      if (popcount(mask) !== size) continue;
      const subset: Card[] = [];
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) subset.push(hand[i]!);
      }
      if (isValidMeld(subset)) results.push(subset);
    }
  }
  // Also try runs of 5+
  for (let size = 5; size <= n; size++) {
    for (let mask = 0; mask < (1 << n); mask++) {
      if (popcount(mask) !== size) continue;
      const subset: Card[] = [];
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) subset.push(hand[i]!);
      }
      if (isValidMeld(subset)) results.push(subset);
    }
  }

  return results;
}

function popcount(n: number): number {
  let c = 0;
  while (n) { c += n & 1; n >>= 1; }
  return c;
}

/** Check if entire hand (minus melds) is fully melded */
export function isWinningHand(hand: readonly Card[], existingMelds: readonly Meld[]): boolean {
  const meldedIds = new Set(existingMelds.flat().map(c => c.id));
  const remaining = hand.filter(c => !meldedIds.has(c.id));
  return remaining.length === 0;
}

export type ConquianPhase =
  | "player-draw"   // player must take from discard (or pass)
  | "player-meld"   // player chose to take; must meld or discard drawn card
  | "bot-turn"
  | "done";

export interface ConquianState {
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  discard: readonly Card[];  // top = last element
  playerMelds: readonly Meld[];
  botMelds: readonly Meld[];
  drawnCard: Card | null;    // card player just drew
  phase: ConquianPhase;
  message: string;
  winner: "player" | "bot" | null;
}

export type ConquianAction =
  | { type: "take" }          // take top discard
  | { type: "pass" }          // pass on discard
  | { type: "meld"; cardIds: string[] }   // meld these cards (must include drawnCard)
  | { type: "discard"; cardId: string };  // discard the drawn card (if no meld possible)

function botTakesDiscard(hand: readonly Card[], topDiscard: Card): boolean {
  if (!topDiscard) return false;
  const testHand = [...hand, topDiscard];
  return findMelds(testHand).length > 0;
}

function botTurn(state: ConquianState, rng: () => number): ConquianState {
  const topDiscard = state.discard[state.discard.length - 1];
  if (!topDiscard) {
    // No discard to take — stalemate, end game
    return { ...state, phase: "done", winner: null, message: "Stalemate — draw!" };
  }

  if (botTakesDiscard(state.botHand, topDiscard)) {
    const newBotHand = [...state.botHand, topDiscard];
    const newDiscard = state.discard.slice(0, -1);
    const melds = findMelds(newBotHand);
    if (melds.length > 0) {
      const bestMeld = melds[0]!;
      const meldIds = new Set(bestMeld.map(c => c.id));
      // Discard a non-meld card (prefer non-drawn)
      const remaining = newBotHand.filter(c => !meldIds.has(c.id));
      // Actually in Conquian: bot must meld OR discard the drawn card
      // We'll meld if possible, then discard a non-drawn card
      const discardCard = remaining.find(c => c.id !== topDiscard.id) ?? remaining[0]!;
      const finalHand = remaining.filter(c => c.id !== discardCard.id);
      const newMelds = [...state.botMelds, bestMeld];

      if (isWinningHand(finalHand, newMelds) && finalHand.length === 0) {
        return { ...state, botHand: finalHand, botMelds: newMelds, discard: [...newDiscard, discardCard], phase: "done", winner: "bot", message: "Bot wins! Fully melded." };
      }

      return {
        ...state,
        botHand: finalHand,
        botMelds: newMelds,
        discard: [...newDiscard, discardCard],
        phase: "player-draw",
        message: `Bot melded and discarded ${discardCard.suit}${rankLabel(discardCard.rank)}.`,
      };
    }
    // Can't meld — discard the drawn card
    const finalHand = state.botHand; // didn't take
    return {
      ...state,
      phase: "player-draw",
      message: `Bot passed on ${topDiscard.suit}${rankLabel(topDiscard.rank)}.`,
    };
  }

  // Bot passes
  return {
    ...state,
    phase: "player-draw",
    message: `Bot passed. Top discard: ${topDiscard.suit}${rankLabel(topDiscard.rank)}.`,
  };
}

function rankLabel(rank: Card["rank"]): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function reducer(state: ConquianState, action: ConquianAction): ConquianState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const s = { ...state, rngSeed: nextSeed };

  if (state.phase === "player-draw") {
    const topDiscard = state.discard[state.discard.length - 1];

    if (action.type === "take" && topDiscard) {
      return {
        ...s,
        drawnCard: topDiscard,
        playerHand: [...state.playerHand, topDiscard],
        discard: state.discard.slice(0, -1),
        phase: "player-meld",
        message: `You took ${topDiscard.suit}${rankLabel(topDiscard.rank)}. Now meld or discard it.`,
      };
    }

    if (action.type === "pass") {
      // Pass on discard — opponent's turn
      let next = botTurn(s, rng);
      return next;
    }
  }

  if (state.phase === "player-meld") {
    if (action.type === "meld") {
      const { cardIds } = action;
      if (!state.drawnCard) return state;
      // Must include drawn card
      if (!cardIds.includes(state.drawnCard.id)) return state;
      const meldCards = state.playerHand.filter(c => cardIds.includes(c.id));
      if (!isValidMeld(meldCards)) return state;

      const meldIds = new Set(cardIds);
      const newHand = state.playerHand.filter(c => !meldIds.has(c.id));
      const newMelds = [...state.playerMelds, meldCards];

      if (newHand.length === 0) {
        return { ...s, playerHand: newHand, playerMelds: newMelds, drawnCard: null, phase: "done", winner: "player", message: "You win! Fully melded!" };
      }

      // Must still discard something (meld was played, but hand still has cards)
      // In Conquian after melding, you discard a non-meld card
      return { ...s, playerHand: newHand, playerMelds: newMelds, drawnCard: null, phase: "bot-turn", message: "Meld played! Bot's turn." };
    }

    if (action.type === "discard") {
      if (!state.drawnCard) return state;
      if (action.cardId !== state.drawnCard.id) return state; // Must discard the drawn card
      const newHand = state.playerHand.filter(c => c.id !== action.cardId);
      const newDiscard = [...state.discard, state.drawnCard];
      let next: ConquianState = { ...s, playerHand: newHand, discard: newDiscard, drawnCard: null, phase: "bot-turn", message: "You discarded. Bot's turn." };
      next = botTurn(next, rng);
      return next;
    }
  }

  if (state.phase === "bot-turn") {
    return botTurn(s, rng);
  }

  return state;
}

export function initialState(seed: number): ConquianState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(conquianDeck(), mulberry32(nextSeed));

  const playerHand = deck.slice(0, 10);
  const botHand = deck.slice(10, 20);
  const discard = [deck[20]!]; // first discard

  const topDiscard = discard[0]!;
  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    playerHand,
    botHand,
    discard,
    playerMelds: [],
    botMelds: [],
    drawnCard: null,
    phase: "player-draw",
    message: `Top discard: ${topDiscard.suit}${rankLabel(topDiscard.rank)}. Take it or pass?`,
    winner: null,
  };
}

export function isTerminal(state: ConquianState): { score: number } | null {
  if (state.phase !== "done") return null;
  if (state.winner === "player") return { score: 100 };
  if (state.winner === "bot") return { score: 0 };
  return { score: 50 };
}
