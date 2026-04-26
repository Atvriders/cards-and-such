import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Discard Bet: See top card, decide keep or discard. Keep=score rank. Discard=draw next for double.
export interface CardDiscardBetSettings { rounds: "10" | "20"; }

export interface CardDiscardBetState {
  deck: number[];
  pos: number;
  currentCard: number;
  discarded: boolean;
  nextCard: number | null;
  coins: number;
  round: number;
  maxRounds: number;
  phase: "decide" | "result" | "gameover";
  lastGain: number;
}

export type CardDiscardBetAction = { type: "keep" } | { type: "discard" } | { type: "next" };

function makeDeck(rng: () => number): number[] {
  const arr = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j]!, arr[i]!]; }
  return arr;
}

export function cardLabel(c: number): string {
  return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][c % 13]! + ["♠","♥","♦","♣"][Math.floor(c / 13)]!;
}

export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export function initialState(seed: number, settings: CardDiscardBetSettings): CardDiscardBetState {
  const rng = mulberry32(seed);
  const deck = makeDeck(rng);
  return { deck, pos: 1, currentCard: deck[0]!, discarded: false, nextCard: null, coins: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "decide", lastGain: 0 };
}

export function reducer(state: CardDiscardBetState, action: CardDiscardBetAction): CardDiscardBetState {
  if (state.phase === "gameover") return state;
  if (action.type === "keep") {
    if (state.phase !== "decide") return state;
    const gain = (state.currentCard % 13) + 2;
    return { ...state, lastGain: gain, coins: state.coins + gain, phase: "result" };
  }
  if (action.type === "discard") {
    if (state.phase !== "decide") return state;
    const nextCard = state.deck[state.pos % 52]!;
    const gain = ((nextCard % 13) + 2) * 2;
    return { ...state, nextCard, lastGain: gain, coins: state.coins + gain, pos: state.pos + 1, discarded: true, phase: "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const nextRound = state.round + 1;
    const newPos = state.pos + (state.discarded ? 0 : 1);
    const newCard = state.deck[newPos % 52]!;
    const done = nextRound > state.maxRounds;
    return { ...state, pos: newPos + 1, currentCard: newCard, nextCard: null, discarded: false, round: nextRound, lastGain: 0, phase: done ? "gameover" : "decide" };
  }
  return state;
}

export function isTerminal(state: CardDiscardBetState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.coins } : null;
}
