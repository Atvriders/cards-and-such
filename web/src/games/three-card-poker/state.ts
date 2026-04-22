import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ThreeCardPokerSettings {
  startingBankroll: number;
  bets: "ante" | "pair-plus" | "both";
  anteSize: "10" | "25" | "50";
}

export type ThreeCardPhase = "betting" | "decision" | "settled";

export interface ThreeCardPokerState {
  settings: ThreeCardPokerSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: ThreeCardPhase;
  shoe: Card[];
  discardPile: Card[];
  playerCards: Card[];
  dealerCards: Card[];
  lastResult: string;
}

export type ThreeCardPokerAction =
  | { type: "deal" }
  | { type: "play" }
  | { type: "fold" };

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

export type ThreeHandClass =
  | "straight-flush"
  | "three-of-a-kind"
  | "straight"
  | "flush"
  | "one-pair"
  | "high-card";

const HIGH = (r: number) => r === 1 ? 14 : r;

export function rankThreeHand(cards: Card[]): { class: ThreeHandClass; kickers: number[] } {
  const ranks = cards.map(c => HIGH(c.rank)).sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);
  const isFlush = suits[0] === suits[1] && suits[1] === suits[2];
  const uniq = [...new Set(ranks)];

  // Straight detection (including wheel A-2-3)
  let isStraight = false;
  let straightHigh = 0;
  if (uniq.length === 3) {
    if (ranks[0]! - ranks[2]! === 2) { isStraight = true; straightHigh = ranks[0]!; }
    else if (ranks[0] === 14 && ranks[1] === 3 && ranks[2] === 2) { isStraight = true; straightHigh = 3; }
  }

  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  if (isStraight && isFlush) return { class: "straight-flush", kickers: [straightHigh] };
  if (groups[0]![1] === 3) return { class: "three-of-a-kind", kickers: [groups[0]![0]] };
  if (isStraight) return { class: "straight", kickers: [straightHigh] };
  if (isFlush) return { class: "flush", kickers: ranks };
  if (groups[0]![1] === 2) return { class: "one-pair", kickers: [groups[0]![0], groups[1]![0]] };
  return { class: "high-card", kickers: ranks };
}

const CLASS_ORDER_3: ThreeHandClass[] = [
  "high-card", "one-pair", "flush", "straight", "three-of-a-kind", "straight-flush",
];

export function compareThreeHands(a: Card[], b: Card[]): number {
  const ra = rankThreeHand(a);
  const rb = rankThreeHand(b);
  const oa = CLASS_ORDER_3.indexOf(ra.class);
  const ob = CLASS_ORDER_3.indexOf(rb.class);
  if (oa !== ob) return oa - ob;
  for (let i = 0; i < 3; i++) {
    const ka = ra.kickers[i] ?? 0;
    const kb = rb.kickers[i] ?? 0;
    if (ka !== kb) return ka - kb;
  }
  return 0;
}

/** Dealer qualifies with Queen-high or better */
export function dealerQualifies(cards: Card[]): boolean {
  const r = rankThreeHand(cards);
  if (r.class !== "high-card") return true;
  return r.kickers[0]! >= 12; // queen = 12
}

/** Pair Plus paytable (always resolved regardless of dealer) */
const PAIR_PLUS: Partial<Record<ThreeHandClass, number>> = {
  "straight-flush": 40,
  "three-of-a-kind": 30,
  "straight": 6,
  "flush": 3,
  "one-pair": 1,
};

export function initialState(seed: number, settings: ThreeCardPokerSettings): ThreeCardPokerState {
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
    dealerCards: [],
    lastResult: "",
  };
}

export function reducer(state: ThreeCardPokerState, action: ThreeCardPokerAction): ThreeCardPokerState {
  const ante = parseInt(state.settings.anteSize, 10);
  const usesAnte = state.settings.bets === "ante" || state.settings.bets === "both";
  const usesPairPlus = state.settings.bets === "pair-plus" || state.settings.bets === "both";
  const betNeeded = (usesAnte ? ante : 0) + (usesPairPlus ? ante : 0);

  switch (action.type) {
    case "deal": {
      if (state.phase !== "betting" && state.phase !== "settled") return state;
      if (state.bankroll < betNeeded) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw6 = drawN(6, state.shoe, state.discardPile, rng);
      const playerCards = draw6.cards.slice(0, 3);
      const dealerCards = draw6.cards.slice(3, 6);

      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll - betNeeded,
        phase: usesAnte ? "decision" : "settled",
        shoe: draw6.shoe,
        discardPile: draw6.discardPile,
        playerCards,
        dealerCards,
        lastResult: usesAnte ? "" : resolvePairPlusOnly(playerCards, ante),
        handsPlayed: usesAnte ? state.handsPlayed : state.handsPlayed + 1,
      };
    }

    case "fold": {
      if (state.phase !== "decision") return state;
      const pp = usesPairPlus ? resolvePairPlusWin(state.playerCards, ante) : 0;
      const ppMsg = usesPairPlus ? ` Pair Plus: ${pp >= 0 ? `+$${pp}` : `$0`}.` : "";
      const discardPile = [...state.discardPile, ...state.playerCards, ...state.dealerCards];
      return {
        ...state,
        bankroll: Math.max(0, state.bankroll + pp),
        phase: "settled",
        handsPlayed: state.handsPlayed + 1,
        discardPile,
        lastResult: `Folded. Ante lost (-$${ante}).${ppMsg}`,
      };
    }

    case "play": {
      if (state.phase !== "decision") return state;
      if (state.bankroll < ante) return state; // need to cover play bet
      const bankrollAfterPlay = state.bankroll - ante;

      const dq = dealerQualifies(state.dealerCards);
      const cmp = compareThreeHands(state.playerCards, state.dealerCards);
      const pr = rankThreeHand(state.playerCards);

      let bankrollDelta = 0;
      const parts: string[] = [];

      if (!dq) {
        // Dealer doesn't qualify: ante pays 1:1, play pushes
        bankrollDelta += ante * 2 + ante; // ante returned + win + play returned
        parts.push(`Dealer doesn't qualify. Ante wins +$${ante}. Play returned.`);
      } else if (cmp > 0) {
        // Player wins: ante 1:1, play 1:1
        const antePay = ante;
        const playPay = ante;
        bankrollDelta += ante * 2 + ante * 2; // both returned + both won
        parts.push(`Win! Ante +$${antePay}, Play +$${playPay}. Hand: ${pr.class}`);
      } else if (cmp < 0) {
        // Dealer wins
        parts.push(`Dealer wins. Lost ante $${ante} + play $${ante}.`);
      } else {
        // Tie — push
        bankrollDelta += ante * 2; // return both
        parts.push("Tie — push. Ante and play returned.");
      }

      if (usesPairPlus) {
        const pp = resolvePairPlusWin(state.playerCards, ante);
        if (pp > 0) {
          bankrollDelta += pp;
          const mult = PAIR_PLUS[rankThreeHand(state.playerCards).class] ?? 0;
          parts.push(`Pair Plus: ${mult}:1 = +$${pp}.`);
        } else {
          parts.push(`Pair Plus: no win.`);
        }
      }

      const discardPile = [...state.discardPile, ...state.playerCards, ...state.dealerCards];
      return {
        ...state,
        bankroll: Math.max(0, bankrollAfterPlay + bankrollDelta),
        phase: "settled",
        handsPlayed: state.handsPlayed + 1,
        discardPile,
        lastResult: parts.join(" "),
      };
    }

    default:
      return state;
  }
}

function resolvePairPlusWin(cards: Card[], ante: number): number {
  const r = rankThreeHand(cards);
  const mult = PAIR_PLUS[r.class];
  if (!mult) return 0;
  return ante * mult + ante; // profit + stake back
}

function resolvePairPlusOnly(cards: Card[], ante: number): string {
  const r = rankThreeHand(cards);
  const mult = PAIR_PLUS[r.class];
  if (!mult) return `No Pair Plus win (${r.class}). Lost $${ante}.`;
  const win = ante * mult;
  return `Pair Plus: ${r.class}! ${mult}:1 = +$${win}.`;
}

export function isTerminal(state: ThreeCardPokerState): { score: number } | null {
  if (state.phase === "settled" && state.bankroll <= 0) {
    return { score: 0 };
  }
  return null;
}
