import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankHand } from "../../engines/deck/ranking.js";
import type { HandClass } from "../../engines/deck/ranking.js";

export interface CaribbeanStudSettings {
  anteSize: "10" | "25" | "50";
  hands: "5" | "10" | "20";
}

export type CaribbeanStudPhase = "ante" | "decision" | "settled";

export interface CaribbeanStudState {
  settings: CaribbeanStudSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: CaribbeanStudPhase;
  shoe: Card[];
  discardPile: Card[];
  playerCards: Card[];
  dealerCards: Card[]; // all 5, but only [0] visible in decision phase
  dealerQualifies: boolean;
  lastResult: string;
}

export type CaribbeanStudAction =
  | { type: "deal" }
  | { type: "fold" }
  | { type: "raise" };

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

/** Dealer qualifies with at least Ace-King high */
export function dealerQualifies(cards: Card[]): boolean {
  const ranked = rankHand(cards);
  if (ranked.class !== "high-card") return true; // any pair or better qualifies
  // High card: kickers are sorted desc. Need at least Ace (14) and King (13)
  const kickers = ranked.kickers;
  return kickers[0] === 14 && kickers[1]! >= 13;
}

/** Compare two ranked hands: positive = hand1 wins, 0 = tie, negative = hand2 wins */
function compareHands(cards1: Card[], cards2: Card[]): number {
  const hand1 = rankHand(cards1);
  const hand2 = rankHand(cards2);

  const CLASS_ORDER: HandClass[] = [
    "high-card", "one-pair", "two-pair", "three-of-a-kind",
    "straight", "flush", "full-house", "four-of-a-kind", "straight-flush",
  ];

  const rank1 = CLASS_ORDER.indexOf(hand1.class);
  const rank2 = CLASS_ORDER.indexOf(hand2.class);

  if (rank1 !== rank2) return rank1 - rank2;

  // Same class, compare kickers
  for (let i = 0; i < Math.max(hand1.kickers.length, hand2.kickers.length); i++) {
    const k1 = hand1.kickers[i] ?? 0;
    const k2 = hand2.kickers[i] ?? 0;
    if (k1 !== k2) return k1 - k2;
  }
  return 0;
}

const RAISE_PAYOUT: Partial<Record<HandClass, number>> = {
  "one-pair": 1,
  "two-pair": 2,
  "three-of-a-kind": 3,
  "straight": 4,
  "flush": 5,
  "full-house": 7,
  "four-of-a-kind": 20,
  "straight-flush": 50,
};

/** Special royal flush check: straight flush with Ace-high */
function isRoyalFlush(cards: Card[]): boolean {
  const ranked = rankHand(cards);
  return ranked.class === "straight-flush" && ranked.kickers[0] === 14;
}

export function initialState(seed: number, settings: CaribbeanStudSettings): CaribbeanStudState {
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
    dealerCards: [],
    dealerQualifies: false,
    lastResult: "",
  };
}

export function reducer(state: CaribbeanStudState, action: CaribbeanStudAction): CaribbeanStudState {
  switch (action.type) {
    case "deal": {
      if (state.phase !== "ante" && state.phase !== "settled") return state;
      const maxHands = parseInt(state.settings.hands, 10);
      if (state.handsPlayed >= maxHands) return state;
      const ante = parseInt(state.settings.anteSize, 10);
      if (state.bankroll < ante) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      // Deal 5 to player, 5 to dealer
      const draw10 = drawN(10, state.shoe, state.discardPile, rng);
      const playerCards = draw10.cards.slice(0, 5);
      const dealerCards = draw10.cards.slice(5, 10);

      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - ante, // ante deducted
        phase: "decision",
        shoe: draw10.shoe,
        discardPile: draw10.discardPile,
        playerCards,
        dealerCards,
        dealerQualifies: false,
        lastResult: "",
      };
    }

    case "fold": {
      if (state.phase !== "decision") return state;
      // Fold: ante is lost (already deducted)
      const ante = parseInt(state.settings.anteSize, 10);
      const discardPile = [...state.discardPile, ...state.playerCards, ...state.dealerCards];
      return {
        ...state,
        phase: "settled",
        handsPlayed: state.handsPlayed + 1,
        discardPile,
        dealerQualifies: dealerQualifies(state.dealerCards),
        lastResult: `Folded. Lost ante $${ante}.`,
      };
    }

    case "raise": {
      if (state.phase !== "decision") return state;
      const ante = parseInt(state.settings.anteSize, 10);
      const raise = ante * 2;

      if (state.bankroll < raise) return state; // can't afford raise

      const dq = dealerQualifies(state.dealerCards);
      let bankroll = state.bankroll - raise;
      let resultMsg: string;

      if (!dq) {
        // Dealer doesn't qualify: ante pays 1:1, raise pushes
        bankroll += ante * 2 + raise; // ante returned + ante win + raise returned
        resultMsg = `Dealer doesn't qualify. Ante wins! +$${ante}. Raise returned.`;
      } else {
        const cmp = compareHands(state.playerCards, state.dealerCards);
        if (cmp > 0) {
          // Player wins
          const playerHand = rankHand(state.playerCards);
          let raisePay: number;
          if (isRoyalFlush(state.playerCards)) {
            raisePay = raise * 100;
          } else {
            const mult = RAISE_PAYOUT[playerHand.class] ?? 1;
            raisePay = raise * mult;
          }
          bankroll += ante * 2 + raise + raisePay; // ante returned + ante win + raise returned + raise win
          resultMsg = `Player wins! Ante +$${ante}, Raise pays ${RAISE_PAYOUT[playerHand.class] ?? 1}:1 = +$${raisePay}. Hand: ${playerHand.class}`;
        } else if (cmp < 0) {
          // Dealer wins — both ante and raise lost
          resultMsg = `Dealer wins. Lost ante $${ante} + raise $${raise}.`;
        } else {
          // Tie — push
          bankroll += ante + raise; // return both
          resultMsg = "Tie — push. Bets returned.";
        }
      }

      const discardPile = [...state.discardPile, ...state.playerCards, ...state.dealerCards];
      return {
        ...state,
        bankroll: Math.max(0, bankroll),
        phase: "settled",
        handsPlayed: state.handsPlayed + 1,
        discardPile,
        dealerQualifies: dq,
        lastResult: resultMsg,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CaribbeanStudState): { score: number } | null {
  const maxHands = parseInt(state.settings.hands, 10);
  if (
    state.phase === "settled" &&
    (state.handsPlayed >= maxHands || state.bankroll <= 0)
  ) {
    return { score: state.bankroll };
  }
  return null;
}
