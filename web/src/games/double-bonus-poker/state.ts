import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DoubleBonusSettings {
  handsPerSession: number;
  bet: "5" | "10" | "25";
}

export type DoubleBonusPhase = "betting" | "draw" | "settled";

export type HandRank =
  | "Royal Flush" | "Straight Flush"
  | "Four Aces" | "Four 2s-4s" | "Four 5s-Ks"
  | "Full House" | "Flush" | "Straight"
  | "Three of a Kind" | "Two Pair" | "Jacks or Better" | "Nothing";

export interface DoubleBonusState {
  settings: DoubleBonusSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: DoubleBonusPhase;
  shoe: Card[];
  discardPile: Card[];
  hand: Card[];
  held: boolean[];
  handRank: HandRank | null;
  lastResult: string;
}

export type DoubleBonusAction =
  | { type: "deal" }
  | { type: "toggle-hold"; index: number }
  | { type: "draw" };

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function drawN(n: number, shoe: Card[], disc: Card[], rng: () => number) {
  let cur = shoe; let d = disc; const cards: Card[] = [];
  for (let i = 0; i < n; i++) {
    if (cur.length < 10) { const rs = shuffle([...cur, ...d], rng); const r = deal(rs, 1); cards.push(r.drawn[0]!); cur = r.remaining; d = []; }
    else { const r = deal(cur, 1); cards.push(r.drawn[0]!); cur = r.remaining; }
  }
  return { cards, shoe: cur, discardPile: d };
}

function rankVal(r: Card["rank"]): number { return r === 1 ? 14 : r; }

export function evaluateDoubleBonusHand(cards: Card[]): HandRank {
  const vals = cards.map(c => rankVal(c.rank)).sort((a, b) => a - b);
  const suits = cards.map(c => c.suit);
  const isFlush = suits.every(s => s === suits[0]);
  const unique = new Set(vals);
  const isStraight = (unique.size === 5 && vals[4]! - vals[0]! === 4)
    || (vals.join() === "2,3,4,5,14");
  const counts: Record<number, number> = {};
  for (const v of vals) counts[v] = (counts[v] ?? 0) + 1;
  const freq = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topFreq = freq[0]!;

  if (isFlush && isStraight && vals[4] === 14 && vals[3] === 13) return "Royal Flush";
  if (isFlush && isStraight) return "Straight Flush";
  if (topFreq[1] === 4) {
    const quad = parseInt(topFreq[0]);
    if (quad === 14) return "Four Aces";
    if (quad >= 2 && quad <= 4) return "Four 2s-4s";
    return "Four 5s-Ks";
  }
  if (freq[0]![1] === 3 && freq[1]![1] === 2) return "Full House";
  if (isFlush) return "Flush";
  if (isStraight) return "Straight";
  if (topFreq[1] === 3) return "Three of a Kind";
  if (freq[0]![1] === 2 && freq[1]![1] === 2) return "Two Pair";
  if (topFreq[1] === 2) {
    const pairVal = parseInt(topFreq[0]);
    if (pairVal >= 11 || pairVal === 14) return "Jacks or Better";
  }
  return "Nothing";
}

const PAYOUTS: Record<HandRank, number> = {
  "Royal Flush": 800, "Straight Flush": 50, "Four Aces": 160,
  "Four 2s-4s": 80, "Four 5s-Ks": 50, "Full House": 10,
  "Flush": 7, "Straight": 5, "Three of a Kind": 3,
  "Two Pair": 1, "Jacks or Better": 1, "Nothing": 0,
};

export function initialState(seed: number, settings: DoubleBonusSettings): DoubleBonusState {
  const { rng, nextSeed } = advanceSeed(seed);
  return {
    settings, rngSeed: nextSeed, bankroll: 1000, handsPlayed: 0,
    phase: "betting", shoe: shuffle(newDeck(1), rng), discardPile: [],
    hand: [], held: [false, false, false, false, false],
    handRank: null, lastResult: "",
  };
}

export function reducer(state: DoubleBonusState, action: DoubleBonusAction): DoubleBonusState {
  const bet = parseInt(state.settings.bet, 10);
  switch (action.type) {
    case "deal": {
      if (state.phase !== "betting" && state.phase !== "settled") return state;
      if (state.handsPlayed >= state.settings.handsPerSession) return state;
      if (state.bankroll < bet) return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const drawn = drawN(5, state.shoe, state.discardPile, rng);
      return {
        ...state, rngSeed: nextSeed, bankroll: state.bankroll - bet,
        phase: "draw", shoe: drawn.shoe, discardPile: drawn.discardPile,
        hand: drawn.cards, held: [false, false, false, false, false],
        handRank: null, lastResult: "",
      };
    }
    case "toggle-hold": {
      if (state.phase !== "draw") return state;
      const { index } = action;
      if (index < 0 || index > 4) return state;
      const held = [...state.held];
      held[index] = !held[index];
      return { ...state, held };
    }
    case "draw": {
      if (state.phase !== "draw") return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const discardCount = state.held.filter(h => !h).length;
      const drawn = drawN(discardCount, state.shoe, state.discardPile, rng);
      const newHand: Card[] = [];
      let di = 0;
      for (let i = 0; i < 5; i++) {
        if (state.held[i]) newHand.push(state.hand[i]!);
        else newHand.push(drawn.cards[di++]!);
      }
      const rank = evaluateDoubleBonusHand(newHand);
      const payout = PAYOUTS[rank]! * bet;
      return {
        ...state, rngSeed: nextSeed,
        bankroll: state.bankroll + payout,
        handsPlayed: state.handsPlayed + 1,
        phase: "settled", shoe: drawn.shoe,
        discardPile: [...drawn.discardPile, ...newHand],
        hand: newHand, handRank: rank,
        lastResult: payout > 0 ? `${rank}! +$${payout}` : `${rank}. No win.`,
      };
    }
    default: return state;
  }
}

export function isTerminal(state: DoubleBonusState): { score: number } | null {
  if (state.phase === "settled" &&
    (state.handsPlayed >= state.settings.handsPerSession || state.bankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}
