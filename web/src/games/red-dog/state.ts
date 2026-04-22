import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RedDogSettings {
  startingBankroll: number;
  anteSize: "10" | "25" | "50";
}

export type RedDogPhase = "betting" | "decision" | "settled";

export interface RedDogState {
  settings: RedDogSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: RedDogPhase;
  shoe: Card[];
  discardPile: Card[];
  card1: Card | null;
  card2: Card | null;
  card3: Card | null;
  spread: number;   // -1 = consecutive (push), -2 = pair (wait for third)
  raised: boolean;
  lastResult: string;
}

export type RedDogAction =
  | { type: "deal" }
  | { type: "raise" }
  | { type: "stay" };

const HIGH = (r: number) => r === 1 ? 14 : r;

/** Compute spread between two cards: rank difference minus 1. Special values: -1 = consecutive, -2 = pair */
export function computeSpread(a: Card, b: Card): number {
  const ra = HIGH(a.rank);
  const rb = HIGH(b.rank);
  if (ra === rb) return -2; // pair
  const lo = Math.min(ra, rb);
  const hi = Math.max(ra, rb);
  if (hi - lo === 1) return -1; // consecutive
  return hi - lo - 1;
}

/** Payout multiplier for spread (not including bet return) */
export function spreadPayout(spread: number): number {
  if (spread === 1) return 5;
  if (spread === 2) return 4;
  if (spread === 3) return 2;
  return 1; // 4+
}

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

export function initialState(seed: number, settings: RedDogSettings): RedDogState {
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
    card1: null,
    card2: null,
    card3: null,
    spread: 0,
    raised: false,
    lastResult: "",
  };
}

export function reducer(state: RedDogState, action: RedDogAction): RedDogState {
  const ante = parseInt(state.settings.anteSize, 10);

  switch (action.type) {
    case "deal": {
      if (state.phase !== "betting" && state.phase !== "settled") return state;
      if (state.bankroll < ante) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      // Draw 2 cards initially
      const draw2 = drawN(2, state.shoe, state.discardPile, rng);
      const [c1, c2] = draw2.cards as [Card, Card];
      const spread = computeSpread(c1, c2);

      if (spread === -1) {
        // Consecutive — automatic push
        const discardPile = [...draw2.discardPile, c1, c2];
        return {
          ...state,
          rngSeed: nextSeed,
          bankroll: state.bankroll, // ante never deducted on push
          phase: "settled",
          handsPlayed: state.handsPlayed + 1,
          shoe: draw2.shoe,
          discardPile,
          card1: c1,
          card2: c2,
          card3: null,
          spread,
          raised: false,
          lastResult: `Consecutive! Auto-push. Ante returned.`,
        };
      }

      if (spread === -2) {
        // Pair — draw third card immediately, need to match for 11:1
        const draw3 = drawN(1, draw2.shoe, draw2.discardPile, rng);
        const c3 = draw3.cards[0]!;
        const ra = HIGH(c1.rank);
        const r3 = HIGH(c3.rank);
        const bankroll = state.bankroll - ante;
        const discardPile = [...draw3.discardPile, c1, c2, c3];

        if (ra === r3) {
          // Three of a kind: 11:1
          return {
            ...state,
            rngSeed: nextSeed,
            bankroll: bankroll + ante * 12, // stake + 11:1
            phase: "settled",
            handsPlayed: state.handsPlayed + 1,
            shoe: draw3.shoe,
            discardPile,
            card1: c1, card2: c2, card3: c3,
            spread: -2,
            raised: false,
            lastResult: `Pair + match! Three of a kind — 11:1! +$${ante * 11}`,
          };
        }
        return {
          ...state,
          rngSeed: nextSeed,
          bankroll: bankroll + ante, // push
          phase: "settled",
          handsPlayed: state.handsPlayed + 1,
          shoe: draw3.shoe,
          discardPile,
          card1: c1, card2: c2, card3: c3,
          spread: -2,
          raised: false,
          lastResult: `Pair — third card didn't match. Push. Ante returned.`,
        };
      }

      // Normal spread: player decides
      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - ante,
        phase: "decision",
        shoe: draw2.shoe,
        discardPile: draw2.discardPile,
        card1: c1,
        card2: c2,
        card3: null,
        spread,
        raised: false,
        lastResult: "",
      };
    }

    case "raise":
    case "stay": {
      if (state.phase !== "decision") return state;
      const raised = action.type === "raise";
      if (raised && state.bankroll < ante) return state;

      const extraBet = raised ? ante : 0;
      const bankrollAfterRaise = state.bankroll - extraBet;
      const totalBet = ante + extraBet;
      const payout = spreadPayout(state.spread);

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw1 = drawN(1, state.shoe, state.discardPile, rng);
      const c3 = draw1.cards[0]!;
      const r3 = HIGH(c3.rank);

      const lo = Math.min(HIGH(state.card1!.rank), HIGH(state.card2!.rank));
      const hi = Math.max(HIGH(state.card1!.rank), HIGH(state.card2!.rank));
      const win = r3 > lo && r3 < hi;

      let bankrollDelta = 0;
      let resultMsg = "";

      if (win) {
        bankrollDelta = totalBet + totalBet * payout;
        resultMsg = `Win! Third card (${r3}) is between ${lo} and ${hi}. Spread ${state.spread}: ${payout}:1. +$${totalBet * payout}`;
      } else {
        resultMsg = `Lose. Third card (${r3}) not between ${lo} and ${hi}. -$${totalBet}`;
      }

      const discardPile = [...draw1.discardPile, state.card1!, state.card2!, c3];
      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: Math.max(0, bankrollAfterRaise + bankrollDelta),
        phase: "settled",
        handsPlayed: state.handsPlayed + 1,
        shoe: draw1.shoe,
        discardPile,
        card3: c3,
        raised,
        lastResult: resultMsg,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: RedDogState): { score: number } | null {
  if (state.phase === "settled" && state.bankroll <= 0) {
    return { score: 0 };
  }
  return null;
}
