import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankHand } from "../../engines/deck/ranking.js";
import type { HandClass } from "../../engines/deck/ranking.js";

export interface MississippiStudSettings {
  anteSize: "5" | "10" | "25";
  hands: "5" | "10" | "20";
}

export type MSPhase = "ante" | "third-street" | "fourth-street" | "fifth-street" | "settled";

export interface MississippiStudState {
  settings: MississippiStudSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: MSPhase;
  shoe: Card[];
  discardPile: Card[];
  playerCards: Card[];     // 2 hole cards
  communityCards: Card[];  // 3 community cards revealed 1 at a time
  bets: number[];          // bets placed at each street [ante, 3rd, 4th, 5th]
  lastResult: string;
}

export type MississippiStudAction =
  | { type: "deal" }
  | { type: "fold" }
  | { type: "bet"; multiplier: 1 | 2 | 3 }; // 1x, 2x, or 3x ante

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
    if (currentShoe.length < 15) {
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

/** Pay table: multiplier on the total bet placed (ante + all street bets) */
const PAY_TABLE: Record<HandClass, number> = {
  "high-card": 0,       // push on pair of 6s or better; lose otherwise
  "one-pair": 0,        // see logic below
  "two-pair": 2,
  "three-of-a-kind": 3,
  "straight": 4,
  "flush": 6,
  "full-house": 10,
  "four-of-a-kind": 40,
  "straight-flush": 100,
};

function HIGH(rank: Card["rank"]): number { return rank === 1 ? 14 : rank; }

/** Pair of 6s or better = push (1:1); pair of 5s or lower = lose */
function pairPayout(cards: Card[]): number {
  const hand = rankHand(cards);
  if (hand.class !== "one-pair") return PAY_TABLE[hand.class];
  const pairRank = hand.kickers[0]!;
  if (pairRank >= 6) return 1; // pair 6s–Ks = push 1:1
  return -1; // pair 2s–5s = lose
}

export function calcFinalPayout(cards: Card[], totalBet: number): number {
  const hand = rankHand(cards);
  if (hand.class === "one-pair") {
    const result = pairPayout(cards);
    if (result === -1) return 0; // lose
    return totalBet + totalBet * result; // return bet + win
  }
  if (hand.class === "high-card") return 0; // lose
  const mult = PAY_TABLE[hand.class];
  return totalBet + totalBet * mult;
}

export function initialState(seed: number, settings: MississippiStudSettings): MississippiStudState {
  const { rng, nextSeed } = advanceSeed(seed);
  const shoe = shuffle(newDeck(1), rng);
  return {
    settings,
    rngSeed: nextSeed,
    bankroll: 1000,
    handsPlayed: 0,
    phase: "ante",
    shoe,
    discardPile: [],
    playerCards: [],
    communityCards: [],
    bets: [],
    lastResult: "",
  };
}

export function reducer(state: MississippiStudState, action: MississippiStudAction): MississippiStudState {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "ante" && state.phase !== "settled") return state;
      const maxHands = parseInt(state.settings.hands, 10);
      if (state.handsPlayed >= maxHands) return state;
      const ante = parseInt(state.settings.anteSize, 10);
      if (state.bankroll < ante) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      // Deal 2 player hole cards + 3 community (all face-down initially)
      const draw5 = drawN(5, state.shoe, state.discardPile, rng);
      const playerCards = draw5.cards.slice(0, 2);
      const communityCards = draw5.cards.slice(2, 5);

      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - ante,
        phase: "third-street",
        shoe: draw5.shoe,
        discardPile: draw5.discardPile,
        playerCards,
        communityCards,
        bets: [ante], // only ante so far
        lastResult: "",
      };
    }

    case "fold": {
      if (state.phase === "ante" || state.phase === "settled") return state;
      const totalLost = state.bets.reduce((a, b) => a + b, 0);
      const discardPile = [...state.discardPile, ...state.playerCards, ...state.communityCards];
      return {
        ...state,
        phase: "settled",
        handsPlayed: state.handsPlayed + 1,
        discardPile,
        lastResult: `Folded. Lost $${totalLost}.`,
      };
    }

    case "bet": {
      if (state.phase !== "third-street" && state.phase !== "fourth-street" && state.phase !== "fifth-street") return state;
      const ante = parseInt(state.settings.anteSize, 10);
      const betAmt = ante * action.multiplier;
      if (state.bankroll < betAmt) return state;

      const newBets = [...state.bets, betAmt];
      let newBankroll = state.bankroll - betAmt;

      let nextPhase: MSPhase = "fourth-street";
      if (state.phase === "third-street") nextPhase = "fourth-street";
      else if (state.phase === "fourth-street") nextPhase = "fifth-street";
      else if (state.phase === "fifth-street") {
        // Settle
        const allCards = [...state.playerCards, ...state.communityCards];
        const totalBet = newBets.reduce((a, b) => a + b, 0);
        const payout = calcFinalPayout(allCards, totalBet);
        const hand = rankHand(allCards);
        const discardPile = [...state.discardPile, ...state.playerCards, ...state.communityCards];

        let result: string;
        if (payout === 0) {
          result = `Lost $${totalBet}. Hand: ${hand.class}`;
        } else {
          const net = payout - totalBet;
          result = `Won $${net >= 0 ? net : 0}! Total payout $${payout}. Hand: ${hand.class}`;
        }

        return {
          ...state,
          bankroll: Math.max(0, newBankroll + payout),
          handsPlayed: state.handsPlayed + 1,
          phase: "settled",
          discardPile,
          bets: newBets,
          lastResult: result,
        };
      }

      return {
        ...state,
        bankroll: newBankroll,
        phase: nextPhase,
        bets: newBets,
      };
    }

    default:
      return state;
  }
}

/** How many community cards are visible at current phase */
export function visibleCommunity(phase: MSPhase): number {
  if (phase === "third-street") return 0;
  if (phase === "fourth-street") return 1;
  if (phase === "fifth-street") return 2;
  return 3; // settled
}

export function isTerminal(state: MississippiStudState): { score: number } | null {
  const maxHands = parseInt(state.settings.hands, 10);
  if (state.phase === "settled" && (state.handsPlayed >= maxHands || state.bankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}
