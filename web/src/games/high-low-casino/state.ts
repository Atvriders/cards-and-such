import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HighLowSettings {
  handsPerSession: number;
  bet: "5" | "10" | "25";
}

export type HighLowPhase = "betting" | "decision" | "settled";

export interface HighLowState {
  settings: HighLowSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: HighLowPhase;
  shoe: Card[];
  discardPile: Card[];
  baseCard: Card | null;
  nextCard: Card | null;
  streak: number; // consecutive correct guesses this round
  lastResult: string;
}

export type HighLowAction =
  | { type: "deal" }
  | { type: "guess"; prediction: "higher" | "lower" | "same" }
  | { type: "bank" }; // collect streak bonus and end round

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function drawOne(shoe: Card[], disc: Card[], rng: () => number): { card: Card; shoe: Card[]; discardPile: Card[] } {
  if (shoe.length < 10) {
    const rs = shuffle([...shoe, ...disc], rng);
    const r = deal(rs, 1);
    return { card: r.drawn[0]!, shoe: r.remaining, discardPile: [] };
  }
  const r = deal(shoe, 1);
  return { card: r.drawn[0]!, shoe: r.remaining, discardPile: disc };
}

function rankVal(r: Card["rank"]): number { return r === 1 ? 14 : r; }

// Streak multipliers: 1 correct = 1x, 2 = 2x, 3 = 4x, 4+ = 8x
function streakMultiplier(streak: number): number {
  if (streak <= 0) return 0;
  if (streak === 1) return 1;
  if (streak === 2) return 2;
  if (streak === 3) return 4;
  return 8;
}

export function initialState(seed: number, settings: HighLowSettings): HighLowState {
  const { rng, nextSeed } = advanceSeed(seed);
  return {
    settings, rngSeed: nextSeed, bankroll: 1000, handsPlayed: 0,
    phase: "betting", shoe: shuffle(newDeck(1), rng), discardPile: [],
    baseCard: null, nextCard: null, streak: 0, lastResult: "",
  };
}

export function reducer(state: HighLowState, action: HighLowAction): HighLowState {
  const bet = parseInt(state.settings.bet, 10);
  switch (action.type) {
    case "deal": {
      if (state.phase !== "betting" && state.phase !== "settled") return state;
      if (state.handsPlayed >= state.settings.handsPerSession) return state;
      if (state.bankroll < bet) return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw = drawOne(state.shoe, state.discardPile, rng);
      return {
        ...state, rngSeed: nextSeed, bankroll: state.bankroll - bet,
        phase: "decision", shoe: draw.shoe, discardPile: draw.discardPile,
        baseCard: draw.card, nextCard: null, streak: 0, lastResult: "",
      };
    }
    case "guess": {
      if (state.phase !== "decision" || !state.baseCard) return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw = drawOne(state.shoe, state.discardPile, rng);
      const next = draw.card;
      const bv = rankVal(state.baseCard.rank);
      const nv = rankVal(next.rank);
      const { prediction } = action;
      let correct = false;
      if (prediction === "higher" && nv > bv) correct = true;
      if (prediction === "lower" && nv < bv) correct = true;
      if (prediction === "same" && nv === bv) correct = true;
      const newStreak = correct ? state.streak + 1 : 0;
      if (!correct) {
        // Lose bet, end round
        return {
          ...state, rngSeed: nextSeed, shoe: draw.shoe, discardPile: draw.discardPile,
          phase: "settled", handsPlayed: state.handsPlayed + 1,
          baseCard: next, nextCard: next, streak: 0,
          lastResult: `Wrong! Card was ${nv}. Lost $${bet}. Streak: 0.`,
        };
      }
      const mult = streakMultiplier(newStreak);
      // Correct — ask if they want to bank or continue
      return {
        ...state, rngSeed: nextSeed, shoe: draw.shoe, discardPile: draw.discardPile,
        baseCard: next, nextCard: next, streak: newStreak,
        lastResult: `Correct! Streak x${newStreak} (${mult}x multiplier). Bank for +$${bet * mult} or keep going!`,
      };
    }
    case "bank": {
      if (state.phase !== "decision" || state.streak === 0) return state;
      const bet = parseInt(state.settings.bet, 10);
      const mult = streakMultiplier(state.streak);
      const winnings = bet * mult;
      return {
        ...state, bankroll: state.bankroll + bet + winnings,
        phase: "settled", handsPlayed: state.handsPlayed + 1,
        lastResult: `Banked! Streak x${state.streak} = +$${winnings}. Total returned: $${bet + winnings}.`,
      };
    }
    default: return state;
  }
}

export function isTerminal(state: HighLowState): { score: number } | null {
  if (state.phase === "settled" &&
    (state.handsPlayed >= state.settings.handsPerSession || state.bankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}
