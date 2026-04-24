import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankHand } from "../../engines/deck/ranking.js";
import type { HandClass } from "../../engines/deck/ranking.js";

export interface CasinoHoldemSettings {
  anteSize: "10" | "25" | "50";
  hands: "5" | "10" | "20";
}

export type CHPhase = "ante" | "decision" | "settled";

export interface CasinoHoldemState {
  settings: CasinoHoldemSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: CHPhase;
  shoe: Card[];
  discardPile: Card[];
  playerCards: Card[];    // 2 hole cards
  communityCards: Card[]; // 5 community cards
  dealerCards: Card[];    // 2 hole cards (hidden during decision)
  dealerQualifies: boolean;
  lastResult: string;
}

export type CasinoHoldemAction =
  | { type: "deal" }
  | { type: "fold" }
  | { type: "call" };  // call = raise 2x ante

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

const CLASS_ORDER: HandClass[] = [
  "high-card", "one-pair", "two-pair", "three-of-a-kind",
  "straight", "flush", "full-house", "four-of-a-kind", "straight-flush",
];

/** Best 5-card hand from 7 cards (2 hole + 5 community) */
export function bestHand(hole: Card[], community: Card[]): { class: HandClass; kickers: number[] } {
  const all = [...hole, ...community];
  // Try all C(7,5) = 21 combinations
  let best = rankHand([all[0]!, all[1]!, all[2]!, all[3]!, all[4]!]);
  for (let i = 0; i < all.length - 1; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const five = all.filter((_, idx) => idx !== i && idx !== j);
      if (five.length === 5) {
        const ranked = rankHand(five as [Card, Card, Card, Card, Card]);
        if (CLASS_ORDER.indexOf(ranked.class) > CLASS_ORDER.indexOf(best.class)) {
          best = ranked;
        } else if (CLASS_ORDER.indexOf(ranked.class) === CLASS_ORDER.indexOf(best.class)) {
          for (let k = 0; k < Math.max(ranked.kickers.length, best.kickers.length); k++) {
            if ((ranked.kickers[k] ?? 0) > (best.kickers[k] ?? 0)) { best = ranked; break; }
            if ((ranked.kickers[k] ?? 0) < (best.kickers[k] ?? 0)) break;
          }
        }
      }
    }
  }
  return best;
}

/** Dealer qualifies with pair of 4s or better */
export function dealerQualifiesCheck(hole: Card[], community: Card[]): boolean {
  const hand = bestHand(hole, community);
  if (CLASS_ORDER.indexOf(hand.class) > CLASS_ORDER.indexOf("one-pair")) return true;
  if (hand.class === "one-pair" && hand.kickers[0]! >= 4) return true; // pair of 4s or better
  return false;
}

function compareHands(h1: { class: HandClass; kickers: number[] }, h2: { class: HandClass; kickers: number[] }): number {
  const r1 = CLASS_ORDER.indexOf(h1.class);
  const r2 = CLASS_ORDER.indexOf(h2.class);
  if (r1 !== r2) return r1 - r2;
  for (let i = 0; i < Math.max(h1.kickers.length, h2.kickers.length); i++) {
    const diff = (h1.kickers[i] ?? 0) - (h2.kickers[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

const CALL_PAY: Record<HandClass, number> = {
  "high-card": 1,
  "one-pair": 1,
  "two-pair": 1,
  "three-of-a-kind": 1,
  "straight": 1,
  "flush": 1,
  "full-house": 2,
  "four-of-a-kind": 10,
  "straight-flush": 20,
};

export function initialState(seed: number, settings: CasinoHoldemSettings): CasinoHoldemState {
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
    dealerCards: [],
    dealerQualifies: false,
    lastResult: "",
  };
}

export function reducer(state: CasinoHoldemState, action: CasinoHoldemAction): CasinoHoldemState {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "ante" && state.phase !== "settled") return state;
      const maxHands = parseInt(state.settings.hands, 10);
      if (state.handsPlayed >= maxHands) return state;
      const ante = parseInt(state.settings.anteSize, 10);
      if (state.bankroll < ante) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      // Deal: 2 player, 2 dealer, 3 flop community cards
      const draw9 = drawN(9, state.shoe, state.discardPile, rng);
      const playerCards = draw9.cards.slice(0, 2);
      const dealerCards = draw9.cards.slice(2, 4);
      const communityCards = draw9.cards.slice(4, 7); // flop (3)

      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - ante,
        phase: "decision",
        shoe: draw9.shoe,
        discardPile: draw9.discardPile,
        playerCards,
        communityCards,
        dealerCards,
        dealerQualifies: false,
        lastResult: "",
      };
    }

    case "fold": {
      if (state.phase !== "decision") return state;
      const ante = parseInt(state.settings.anteSize, 10);
      const discardPile = [...state.discardPile, ...state.playerCards, ...state.dealerCards, ...state.communityCards];
      return {
        ...state,
        phase: "settled",
        handsPlayed: state.handsPlayed + 1,
        discardPile,
        lastResult: `Folded. Lost ante $${ante}.`,
      };
    }

    case "call": {
      if (state.phase !== "decision") return state;
      const ante = parseInt(state.settings.anteSize, 10);
      const callBet = ante * 2;
      if (state.bankroll < callBet) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      // Deal turn + river (2 more community)
      const draw2 = drawN(2, state.shoe, state.discardPile, rng);
      const fullCommunity = [...state.communityCards, ...draw2.cards];

      const dq = dealerQualifiesCheck(state.dealerCards, fullCommunity);
      let bankroll = state.bankroll - callBet;
      let resultMsg = "";

      if (!dq) {
        bankroll += ante * 2 + callBet; // ante pays 1:1, call returned
        resultMsg = `Dealer doesn't qualify. Ante wins +$${ante}. Call returned.`;
      } else {
        const playerBest = bestHand(state.playerCards, fullCommunity);
        const dealerBest = bestHand(state.dealerCards, fullCommunity);
        const cmp = compareHands(playerBest, dealerBest);

        if (cmp > 0) {
          const antePay = ante;
          const callPay = callBet * (CALL_PAY[playerBest.class] ?? 1);
          bankroll += ante + antePay + callBet + callPay;
          resultMsg = `Win! Ante +$${antePay}, Call ${CALL_PAY[playerBest.class] ?? 1}:1 +$${callPay}. Hand: ${playerBest.class}`;
        } else if (cmp < 0) {
          resultMsg = `Dealer wins (${dealerBest.class}). Lost ante + call.`;
        } else {
          bankroll += ante + callBet;
          resultMsg = "Push. Bets returned.";
        }
      }

      const discardPile = [...draw2.discardPile, ...state.playerCards, ...state.dealerCards, ...fullCommunity];
      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: Math.max(0, bankroll),
        phase: "settled",
        handsPlayed: state.handsPlayed + 1,
        shoe: draw2.shoe,
        discardPile,
        communityCards: fullCommunity,
        dealerQualifies: dq,
        lastResult: resultMsg,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CasinoHoldemState): { score: number } | null {
  const maxHands = parseInt(state.settings.hands, 10);
  if (state.phase === "settled" && (state.handsPlayed >= maxHands || state.bankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}
