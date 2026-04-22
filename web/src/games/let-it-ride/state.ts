import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankHand } from "../../engines/deck/ranking.js";
import type { HandClass } from "../../engines/deck/ranking.js";

export interface LetItRideSettings {
  startingBankroll: number;
  anteSize: "5" | "10" | "25";
  handsPerSession: number;
}

export type LetItRidePhase =
  | "betting"      // place 3 equal bets
  | "decision1"    // after seeing 3 cards, pull back bet1?
  | "decision2"    // after seeing community1, pull back bet2?
  | "settled";

export interface LetItRideState {
  settings: LetItRideSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: LetItRidePhase;
  shoe: Card[];
  discardPile: Card[];
  playerCards: Card[];       // 3 player cards
  community: Card[];         // up to 2 community cards revealed progressively
  bet1Pulled: boolean;       // did player pull back bet1?
  bet2Pulled: boolean;       // did player pull back bet2?
  lastResult: string;
}

export type LetItRideAction =
  | { type: "deal" }
  | { type: "pull-back" }   // pull back the current eligible bet
  | { type: "let-it-ride" } // leave the current bet
  | { type: "reveal" };     // advance to next community card (auto after decision)

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

const PAYOUTS: Partial<Record<HandClass, number>> = {
  "straight-flush": 200,  // includes royal (simplified: same payout for straight-flush)
  "four-of-a-kind": 50,
  "full-house": 11,
  "flush": 8,
  "straight": 5,
  "three-of-a-kind": 3,
  "two-pair": 2,
  "one-pair": 1,  // only tens or better — handled below
};

function isRoyalFlush(cards: Card[]): boolean {
  const r = rankHand(cards);
  return r.class === "straight-flush" && r.kickers[0] === 14;
}

/** Returns multiplier for winning hand; 0 = no win */
export function evaluateHand(cards: Card[]): number {
  if (cards.length !== 5) return 0;
  if (isRoyalFlush(cards)) return 1000;
  const r = rankHand(cards);
  if (r.class === "one-pair") {
    // Only pair of 10s or better wins
    const pairRank = r.kickers[0]!; // highest = pair rank (HIGH value: 10→10, J→11, Q→12, K→13, A→14)
    return pairRank >= 10 ? 1 : 0;
  }
  return PAYOUTS[r.class] ?? 0;
}

export function initialState(seed: number, settings: LetItRideSettings): LetItRideState {
  const { rng, nextSeed } = advanceSeed(seed);
  const shoe = shuffle(newDeck(1), rng);
  return {
    settings,
    rngSeed: nextSeed,
    bankroll: settings.startingBankroll,
    handsPlayed: 0,
    phase: "betting",
    shoe,
    discardPile: [],
    playerCards: [],
    community: [],
    bet1Pulled: false,
    bet2Pulled: false,
    lastResult: "",
  };
}

export function reducer(state: LetItRideState, action: LetItRideAction): LetItRideState {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "betting" && state.phase !== "settled") return state;
      if (state.handsPlayed >= state.settings.handsPerSession) return state;
      const ante = parseInt(state.settings.anteSize, 10);
      const totalBet = ante * 3;
      if (state.bankroll < totalBet) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      // Draw 5 cards: 3 to player, 2 community (hidden)
      const draw5 = drawN(5, state.shoe, state.discardPile, rng);

      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - totalBet,
        phase: "decision1",
        shoe: draw5.shoe,
        discardPile: draw5.discardPile,
        playerCards: draw5.cards.slice(0, 3),
        community: draw5.cards.slice(3, 5), // stored but hidden
        bet1Pulled: false,
        bet2Pulled: false,
        lastResult: "",
      };
    }

    case "pull-back": {
      const ante = parseInt(state.settings.anteSize, 10);
      if (state.phase === "decision1") {
        return {
          ...state,
          bankroll: state.bankroll + ante,
          bet1Pulled: true,
          phase: "decision2",
        };
      }
      if (state.phase === "decision2") {
        return {
          ...state,
          bankroll: state.bankroll + ante,
          bet2Pulled: true,
          phase: "settled",
          handsPlayed: state.handsPlayed + 1,
          lastResult: resolveResult(state, true, true),
        };
      }
      return state;
    }

    case "let-it-ride": {
      if (state.phase === "decision1") {
        return { ...state, phase: "decision2" };
      }
      if (state.phase === "decision2") {
        const result = resolveResult(state, state.bet1Pulled, false);
        return {
          ...state,
          phase: "settled",
          handsPlayed: state.handsPlayed + 1,
          lastResult: result,
          bankroll: state.bankroll + computeWinnings(state, state.bet1Pulled, false),
        };
      }
      return state;
    }

    default:
      return state;
  }
}

function computeWinnings(state: LetItRideState, bet1Pulled: boolean, bet2Pulled: boolean): number {
  const ante = parseInt(state.settings.anteSize, 10);
  const finalCards = [...state.playerCards, ...state.community];
  const mult = evaluateHand(finalCards);

  let winnings = 0;
  // Bet 3 always stays
  winnings += mult > 0 ? ante * (1 + mult) : 0; // return + profit
  if (!bet1Pulled && mult > 0) winnings += ante * (1 + mult);
  if (!bet2Pulled && mult > 0) winnings += ante * (1 + mult);

  // Return stayed bets if loss (they were already deducted)
  if (mult === 0) {
    // All pulled bets were already returned. Stayed bets are lost.
    // Bet 3 is lost. Return nothing.
    winnings = 0;
  }

  return winnings;
}

function resolveResult(state: LetItRideState, bet1Pulled: boolean, bet2Pulled: boolean): string {
  const ante = parseInt(state.settings.anteSize, 10);
  const finalCards = [...state.playerCards, ...state.community];
  const mult = evaluateHand(finalCards);
  const r = rankHand(finalCards);

  if (mult === 0) {
    const lost = ante + (bet1Pulled ? 0 : ante) + (bet2Pulled ? 0 : ante);
    return `No win (${r.class}). Lost $${lost}.`;
  }

  const activeBets = 1 + (bet1Pulled ? 0 : 1) + (bet2Pulled ? 0 : 1);
  const profit = mult * ante * activeBets;
  return `${r.class}! ${mult}:1 × ${activeBets} bet(s) = +$${profit}`;
}

export function isTerminal(state: LetItRideState): { score: number } | null {
  if (state.phase === "settled" &&
    (state.handsPlayed >= state.settings.handsPerSession || state.bankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}
