import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BaccaratSettings {
  deckCount: "6" | "8";
  betSize: "10" | "25" | "50" | "100";
  hands: "10" | "20" | "50";
}

export type BaccaratBet = "player" | "banker" | "tie";
export type BaccaratPhase = "betting" | "dealing" | "settled";

export interface BaccaratState {
  settings: BaccaratSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: BaccaratPhase;
  shoe: Card[];
  discardPile: Card[];
  playerCards: Card[];
  bankerCards: Card[];
  currentBet: BaccaratBet;
  lastResult: string;
}

export type BaccaratAction =
  | { type: "bet"; bet: BaccaratBet }
  | { type: "deal" }
  | { type: "next" };

/** Baccarat card value: A=1, 2-9=face, 10/J/Q/K=0 */
export function baccaratValue(card: Card): number {
  if (card.rank >= 10) return 0;
  return card.rank;
}

/** Hand total = sum of card values mod 10 */
export function handTotal(cards: Card[]): number {
  return cards.reduce((sum, c) => (sum + baccaratValue(c)) % 10, 0);
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function drawN(
  n: number,
  shoe: Card[],
  discardPile: Card[],
  rng: () => number
): { cards: Card[]; shoe: Card[]; discardPile: Card[] } {
  let currentShoe = shoe;
  let currentDiscard = discardPile;
  const cards: Card[] = [];
  for (let i = 0; i < n; i++) {
    if (currentShoe.length < 10) {
      const reshuffled = shuffle([...currentShoe, ...currentDiscard], rng);
      const r = deal(reshuffled, 1);
      cards.push(r.drawn[0]!);
      currentShoe = r.remaining;
      currentDiscard = [];
    } else {
      const r = deal(currentShoe, 1);
      cards.push(r.drawn[0]!);
      currentShoe = r.remaining;
    }
  }
  return { cards, shoe: currentShoe, discardPile: currentDiscard };
}

export function initialState(seed: number, settings: BaccaratSettings): BaccaratState {
  const { rng, nextSeed } = advanceSeed(seed);
  const deckCount = parseInt(settings.deckCount, 10);
  const shoe = shuffle(newDeck(deckCount), rng);
  return {
    settings,
    rngSeed: nextSeed,
    bankroll: 1000,
    handsPlayed: 0,
    phase: "betting",
    shoe,
    discardPile: [],
    playerCards: [],
    bankerCards: [],
    currentBet: "player",
    lastResult: "",
  };
}

function playHand(state: BaccaratState): BaccaratState {
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  const betSize = parseInt(state.settings.betSize, 10);

  // Deal initial 4 cards: P, B, P, B
  const draw4 = drawN(4, state.shoe, state.discardPile, rng);
  const [p1, b1, p2, b2] = draw4.cards as [Card, Card, Card, Card];
  let playerCards = [p1, p2];
  let bankerCards = [b1, b2];
  let shoe = draw4.shoe;
  let discardPile = draw4.discardPile;

  const pTotal = handTotal(playerCards);
  const bTotal = handTotal(bankerCards);

  // Natural: 8 or 9 → no more cards
  const natural = pTotal >= 8 || bTotal >= 8;

  if (!natural) {
    // Player draws if total <= 5
    if (pTotal <= 5) {
      const d = drawN(1, shoe, discardPile, rng);
      playerCards = [...playerCards, d.cards[0]!];
      shoe = d.shoe;
      discardPile = d.discardPile;
    }
    // Banker simplified: draws if total <= 5
    if (handTotal(bankerCards) <= 5) {
      const d = drawN(1, shoe, discardPile, rng);
      bankerCards = [...bankerCards, d.cards[0]!];
      shoe = d.shoe;
      discardPile = d.discardPile;
    }
  }

  const finalP = handTotal(playerCards);
  const finalB = handTotal(bankerCards);

  let bankroll = state.bankroll - betSize;
  let resultMsg: string;

  if (finalP > finalB) {
    // Player wins
    if (state.currentBet === "player") {
      bankroll += betSize * 2;
      resultMsg = `Player wins ${finalP} vs ${finalB}! +$${betSize}`;
    } else if (state.currentBet === "banker") {
      resultMsg = `Player wins ${finalP} vs ${finalB}. Lost $${betSize}.`;
    } else {
      resultMsg = `Player wins ${finalP} vs ${finalB}. Tie bet lost $${betSize}.`;
    }
  } else if (finalB > finalP) {
    // Banker wins — 5% commission
    if (state.currentBet === "banker") {
      const commission = Math.floor(betSize * 0.05);
      const payout = betSize - commission;
      bankroll += betSize + payout;
      resultMsg = `Banker wins ${finalB} vs ${finalP}! +$${payout} (after commission)`;
    } else if (state.currentBet === "player") {
      resultMsg = `Banker wins ${finalB} vs ${finalP}. Lost $${betSize}.`;
    } else {
      resultMsg = `Banker wins ${finalB} vs ${finalP}. Tie bet lost $${betSize}.`;
    }
  } else {
    // Tie
    if (state.currentBet === "tie") {
      bankroll += betSize * 9; // 8:1 payout = bet + 8x
      resultMsg = `Tie! ${finalP}-${finalP}. Tie pays 8:1! +$${betSize * 8}`;
    } else {
      // Player/Banker bets push on tie
      bankroll += betSize;
      resultMsg = `Tie! ${finalP}-${finalP}. Your bet is returned.`;
    }
  }

  const allCards = [...playerCards, ...bankerCards];
  discardPile = [...discardPile, ...allCards];

  return {
    ...state,
    rngSeed: nextSeed,
    bankroll,
    handsPlayed: state.handsPlayed + 1,
    phase: "settled",
    shoe,
    discardPile,
    playerCards,
    bankerCards,
    lastResult: resultMsg,
  };
}

export function reducer(state: BaccaratState, action: BaccaratAction): BaccaratState {
  switch (action.type) {
    case "bet": {
      if (state.phase !== "betting") return state;
      return { ...state, currentBet: action.bet };
    }
    case "deal": {
      if (state.phase !== "betting" && state.phase !== "settled") return state;
      if (state.handsPlayed >= parseInt(state.settings.hands, 10)) return state;
      if (state.bankroll <= 0) return state;
      const betSize = parseInt(state.settings.betSize, 10);
      if (state.bankroll < betSize) return state;
      return playHand({ ...state, phase: "betting" });
    }
    case "next": {
      if (state.phase !== "settled") return state;
      return { ...state, phase: "betting" };
    }
    default:
      return state;
  }
}

export function isTerminal(state: BaccaratState): { score: number } | null {
  const maxHands = parseInt(state.settings.hands, 10);
  if (
    state.phase === "settled" &&
    (state.handsPlayed >= maxHands || state.bankroll <= 0)
  ) {
    return { score: state.bankroll };
  }
  return null;
}
