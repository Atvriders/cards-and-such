import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeucesWildSettings {
  handsPerSession: number;
  bet: "5" | "10" | "25";
}

export type DeucesWildPhase = "betting" | "draw" | "settled";

export type HandRank =
  | "Natural Royal Flush" | "Four Deuces" | "Wild Royal Flush"
  | "Five of a Kind" | "Straight Flush" | "Four of a Kind"
  | "Full House" | "Flush" | "Straight" | "Three of a Kind"
  | "Two Pair" | "Nothing";

export interface DeucesWildState {
  settings: DeucesWildSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: DeucesWildPhase;
  shoe: Card[];
  discardPile: Card[];
  hand: Card[];
  held: boolean[];
  handRank: HandRank | null;
  lastResult: string;
}

export type DeucesWildAction =
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

export function evaluateDeucesWild(cards: Card[]): HandRank {
  const deuces = cards.filter(c => c.rank === 2).length;
  const natural = cards.filter(c => c.rank !== 2);
  const vals = natural.map(c => rankVal(c.rank)).sort((a, b) => a - b);
  const suits = natural.map(c => c.suit);

  // Check natural royal flush (no deuces)
  if (deuces === 0) {
    const isFlush = suits.length === 5 && suits.every(s => s === suits[0]);
    const allVals = cards.map(c => rankVal(c.rank)).sort((a, b) => a - b);
    const isStraight = allVals[4]! - allVals[0]! === 4 && new Set(allVals).size === 5;
    if (isFlush && isStraight && allVals[4] === 14) return "Natural Royal Flush";
  }

  if (deuces === 4) return "Four Deuces";

  // Wild royal flush: with wild(s), can make A K Q J T same suit
  const allRanks = cards.map(c => rankVal(c.rank));
  const allSuits = cards.map(c => c.suit);
  const nFlush = suits.length > 0 && suits.every(s => s === suits[0]) && allSuits.filter(s => s === suits[0]).length + deuces >= 5;

  // Check five of a kind
  const counts: Record<number, number> = {};
  for (const v of vals) counts[v] = (counts[v] ?? 0) + 1;
  const freq = Object.values(counts).sort((a, b) => b - a);
  if (freq[0]! + deuces >= 5) return "Five of a Kind";

  // Check straight flush / wild royal flush via combinatorics
  if (nFlush) {
    // Check for royal: natural cards must all be 10-A
    const royalVals = new Set([10, 11, 12, 13, 14]);
    const naturalAreRoyal = vals.every(v => royalVals.has(v)) && new Set(vals).size === vals.length;
    const needed = 5 - vals.length;
    if (naturalAreRoyal && deuces >= needed && vals.length + deuces === 5) return "Wild Royal Flush";
    // Straight flush check: contiguous range possible
    if (vals.length > 0) {
      const min = vals[0]!; const max = vals[vals.length - 1]!;
      const span = max - min;
      const nodup = new Set(vals).size === vals.length;
      if (nodup && span + deuces <= 4) return "Straight Flush";
    } else {
      return "Straight Flush"; // all deuces + flush
    }
    return "Flush";
  }

  // Four of a kind
  if (freq[0]! + deuces >= 4) return "Four of a Kind";

  // Full house
  if (deuces === 0 && freq[0] === 3 && freq[1] === 2) return "Full House";
  if (deuces === 1 && freq[0] === 2 && freq[1] === 2) return "Full House";

  // Straight check
  if (vals.length > 0) {
    const nodup = new Set(vals).size === vals.length;
    const min = vals[0]!; const max = vals[vals.length - 1]!;
    const span = max - min;
    if (nodup && span + deuces <= 4) return "Straight";
  }

  // Three of a kind
  if (freq[0]! + deuces >= 3) return "Three of a Kind";

  // Two pair (only possible without deuces since deuces upgrade two-pair to three-of-kind)
  if (deuces === 0 && freq[0] === 2 && freq[1] === 2) return "Two Pair";

  return "Nothing";
}

const PAYOUTS: Record<HandRank, number> = {
  "Natural Royal Flush": 800, "Four Deuces": 200, "Wild Royal Flush": 25,
  "Five of a Kind": 15, "Straight Flush": 9, "Four of a Kind": 5,
  "Full House": 3, "Flush": 2, "Straight": 2, "Three of a Kind": 1,
  "Two Pair": 0, "Nothing": 0,
};

export function initialState(seed: number, settings: DeucesWildSettings): DeucesWildState {
  const { rng, nextSeed } = advanceSeed(seed);
  return {
    settings, rngSeed: nextSeed, bankroll: 1000, handsPlayed: 0,
    phase: "betting", shoe: shuffle(newDeck(1), rng), discardPile: [],
    hand: [], held: [false, false, false, false, false],
    handRank: null, lastResult: "",
  };
}

export function reducer(state: DeucesWildState, action: DeucesWildAction): DeucesWildState {
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
      const rank = evaluateDeucesWild(newHand);
      const payout = PAYOUTS[rank]! * bet;
      const discardPile = [...drawn.discardPile, ...newHand];
      return {
        ...state, rngSeed: nextSeed,
        bankroll: state.bankroll + payout,
        handsPlayed: state.handsPlayed + 1,
        phase: "settled", shoe: drawn.shoe, discardPile,
        hand: newHand, handRank: rank,
        lastResult: payout > 0 ? `${rank}! +$${payout}` : `${rank}. No win.`,
      };
    }
    default: return state;
  }
}

export function isTerminal(state: DeucesWildState): { score: number } | null {
  if (state.phase === "settled" &&
    (state.handsPlayed >= state.settings.handsPerSession || state.bankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}
