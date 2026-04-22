import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankHand } from "../../engines/deck/ranking.js";
import type { HandClass } from "../../engines/deck/ranking.js";

export interface PaiGowPokerSettings {
  startingBankroll: number;
  anteSize: "10" | "25" | "50";
}

export type PaiGowPhase = "betting" | "splitting" | "result";

export interface PaiGowPokerState {
  settings: PaiGowPokerSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: PaiGowPhase;
  shoe: Card[];
  discardPile: Card[];
  playerCards: Card[]; // 7 dealt cards
  dealerCards: Card[]; // 7 dealt cards (hidden until reveal)
  playerHigh: Card[];  // player's chosen 5-card high hand
  playerLow: Card[];   // player's chosen 2-card low hand
  dealerHigh: Card[];  // dealer's 5-card high hand (auto-split)
  dealerLow: Card[];   // dealer's 2-card low hand (auto-split)
  lastResult: string;
}

export type PaiGowPokerAction =
  | { type: "deal" }
  | { type: "set-hands"; high: Card[]; low: Card[] }
  | { type: "auto-split" }; // let house split for player

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function drawN(n: number, shoe: Card[], discardPile: Card[], rng: () => number): {
  cards: Card[]; shoe: Card[]; discardPile: Card[];
} {
  let cur = shoe;
  let disc = discardPile;
  const cards: Card[] = [];
  for (let i = 0; i < n; i++) {
    if (cur.length < 10) {
      const reshuffled = shuffle([...cur, ...disc], rng);
      const r = deal(reshuffled, 1);
      cards.push(r.drawn[0]!);
      cur = r.remaining;
      disc = [];
    } else {
      const r = deal(cur, 1);
      cards.push(r.drawn[0]!);
      cur = r.remaining;
    }
  }
  return { cards, shoe: cur, discardPile: disc };
}

const CLASS_ORDER: HandClass[] = [
  "high-card", "one-pair", "two-pair", "three-of-a-kind",
  "straight", "flush", "full-house", "four-of-a-kind", "straight-flush",
];

export function compareHands5(a: Card[], b: Card[]): number {
  const ra = rankHand(a);
  const rb = rankHand(b);
  const oa = CLASS_ORDER.indexOf(ra.class);
  const ob = CLASS_ORDER.indexOf(rb.class);
  if (oa !== ob) return oa - ob;
  for (let i = 0; i < Math.max(ra.kickers.length, rb.kickers.length); i++) {
    const ka = ra.kickers[i] ?? 0;
    const kb = rb.kickers[i] ?? 0;
    if (ka !== kb) return ka - kb;
  }
  return 0;
}

/** Compare 2-card low hands: higher rank wins; joker treated as Ace (rank 1→14) */
export function compareHands2(a: Card[], b: Card[]): number {
  const highA = Math.max(...a.map(c => c.rank === 1 ? 14 : (c.rank > 13 ? 14 : c.rank)));
  const highB = Math.max(...b.map(c => c.rank === 1 ? 14 : (c.rank > 13 ? 14 : c.rank)));
  if (highA !== highB) return highA - highB;
  const lo2A = Math.min(...a.map(c => c.rank === 1 ? 14 : (c.rank > 13 ? 14 : c.rank)));
  const lo2B = Math.min(...b.map(c => c.rank === 1 ? 14 : (c.rank > 13 ? 14 : c.rank)));
  return lo2A - lo2B;
}

/** House way: dealer splits using simple heuristics */
export function houseSplit(cards: Card[]): { high: Card[]; low: Card[] } {
  // Try all C(7,2) combinations and pick the best where low < high
  const best = { high: cards.slice(0, 5), low: cards.slice(5, 7) };
  let bestScore = -Infinity;

  for (let i = 0; i < 7; i++) {
    for (let j = i + 1; j < 7; j++) {
      const low = [cards[i]!, cards[j]!];
      const high = cards.filter((_, idx) => idx !== i && idx !== j);
      // Validate: high hand must be better than or equal to low hand
      // For 2-card low, we just check the hand is valid (low has 2 cards, high has 5)
      const highRanked = rankHand(high);
      const highScore = CLASS_ORDER.indexOf(highRanked.class) * 1000 +
        (highRanked.kickers[0] ?? 0) * 10 + (highRanked.kickers[1] ?? 0);
      if (highScore > bestScore) {
        bestScore = highScore;
        best.high = high;
        best.low = low;
      }
    }
  }
  return best;
}

export function settleHands(
  playerHigh: Card[], playerLow: Card[],
  dealerHigh: Card[], dealerLow: Card[],
  ante: number
): { bankrollDelta: number; result: string } {
  const highWin = compareHands5(playerHigh, dealerHigh) > 0;
  const highLose = compareHands5(playerHigh, dealerHigh) < 0;
  const lowWin = compareHands2(playerLow, dealerLow) > 0;
  const lowLose = compareHands2(playerLow, dealerLow) < 0;

  if (highWin && lowWin) {
    const gross = ante * 2; // 1:1
    const commission = Math.floor(gross * 0.05);
    const net = gross - commission;
    return { bankrollDelta: net, result: `Win! Both hands beat dealer. +$${net} (after 5% commission)` };
  }
  if (highLose && lowLose) {
    return { bankrollDelta: -ante, result: `Lose. Dealer wins both hands. -$${ante}` };
  }
  // Split or tie — house wins ties
  if (!highWin && !highLose && !lowWin && !lowLose) {
    return { bankrollDelta: -ante, result: "Dealer wins both ties. -$" + ante };
  }
  return { bankrollDelta: 0, result: "Push (split decision). Ante returned." };
}

export function initialState(seed: number, settings: PaiGowPokerSettings): PaiGowPokerState {
  const { rng, nextSeed } = advanceSeed(seed);
  // 53-card deck: standard 52 + joker represented as rank=1, suit="♠", id="joker"
  const base = newDeck(1);
  const joker: Card = { rank: 1, suit: "♠", id: "joker" };
  const fullDeck = shuffle([...base, joker], rng);
  return {
    settings,
    rngSeed: nextSeed,
    bankroll: settings.startingBankroll,
    handsPlayed: 0,
    phase: "betting",
    shoe: fullDeck,
    discardPile: [],
    playerCards: [],
    dealerCards: [],
    playerHigh: [],
    playerLow: [],
    dealerHigh: [],
    dealerLow: [],
    lastResult: "",
  };
}

export function reducer(state: PaiGowPokerState, action: PaiGowPokerAction): PaiGowPokerState {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "betting") return state;
      const ante = parseInt(state.settings.anteSize, 10);
      if (state.bankroll < ante) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw14 = drawN(14, state.shoe, state.discardPile, rng);
      const playerCards = draw14.cards.slice(0, 7);
      const dealerCards = draw14.cards.slice(7, 14);

      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - ante,
        phase: "splitting",
        shoe: draw14.shoe,
        discardPile: draw14.discardPile,
        playerCards,
        dealerCards,
        playerHigh: [],
        playerLow: [],
        lastResult: "",
      };
    }

    case "auto-split": {
      if (state.phase !== "splitting") return state;
      const playerSplit = houseSplit(state.playerCards);
      const dealerSplit = houseSplit(state.dealerCards);
      const ante = parseInt(state.settings.anteSize, 10);
      const { bankrollDelta, result } = settleHands(
        playerSplit.high, playerSplit.low,
        dealerSplit.high, dealerSplit.low,
        ante
      );
      const discardPile = [...state.discardPile, ...state.playerCards, ...state.dealerCards];
      return {
        ...state,
        bankroll: Math.max(0, state.bankroll + bankrollDelta),
        handsPlayed: state.handsPlayed + 1,
        phase: "result",
        discardPile,
        playerHigh: playerSplit.high,
        playerLow: playerSplit.low,
        dealerHigh: dealerSplit.high,
        dealerLow: dealerSplit.low,
        lastResult: result,
      };
    }

    case "set-hands": {
      if (state.phase !== "splitting") return state;
      const { high, low } = action;
      if (high.length !== 5 || low.length !== 2) return state;
      // Validate high > low
      const dealerSplit = houseSplit(state.dealerCards);
      const ante = parseInt(state.settings.anteSize, 10);
      const { bankrollDelta, result } = settleHands(high, low, dealerSplit.high, dealerSplit.low, ante);
      const discardPile = [...state.discardPile, ...state.playerCards, ...state.dealerCards];
      return {
        ...state,
        bankroll: Math.max(0, state.bankroll + bankrollDelta),
        handsPlayed: state.handsPlayed + 1,
        phase: "result",
        discardPile,
        playerHigh: high,
        playerLow: low,
        dealerHigh: dealerSplit.high,
        dealerLow: dealerSplit.low,
        lastResult: result,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PaiGowPokerState): { score: number } | null {
  if (state.phase === "result" && state.bankroll <= 0) {
    return { score: 0 };
  }
  return null;
}
