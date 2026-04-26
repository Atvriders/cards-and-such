import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Draw Up: Draw cards one at a time. Stop before going over 21 rank-sum. Closest to 21 wins.
export interface CardDrawUpSettings { rounds: "5" | "10"; }

export interface CardDrawUpState {
  deck: number[];
  pos: number;
  drawn: number[];
  total: number;
  coins: number;
  round: number;
  maxRounds: number;
  phase: "drawing" | "result" | "gameover";
  bust: boolean;
  lastGain: number;
}

export type CardDrawUpAction = { type: "draw" } | { type: "stop" } | { type: "next" };

function makeDeck(rng: () => number): number[] {
  const arr = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j]!, arr[i]!]; }
  return arr;
}

export function cardLabel(c: number): string {
  return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][c % 13]! + ["♠","♥","♦","♣"][Math.floor(c / 13)]!;
}

function rankValue(c: number): number { return Math.min(c % 13 + 2, 10); } // face cards = 10, Ace = 11? keep simple: cap at 10

export function isRed(c: number): boolean { return Math.floor(c / 13) === 1 || Math.floor(c / 13) === 2; }

export function initialState(seed: number, settings: CardDrawUpSettings): CardDrawUpState {
  const rng = mulberry32(seed);
  return { deck: makeDeck(rng), pos: 0, drawn: [], total: 0, coins: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "drawing", bust: false, lastGain: 0 };
}

export function reducer(state: CardDrawUpState, action: CardDrawUpAction): CardDrawUpState {
  if (state.phase === "gameover") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const card = state.deck[state.pos % 52]!;
    const val = rankValue(card);
    const newTotal = state.total + val;
    const bust = newTotal > 21;
    const newDrawn = [...state.drawn, card];
    if (bust) {
      return { ...state, drawn: newDrawn, total: newTotal, pos: state.pos + 1, bust: true, lastGain: 0, phase: "result" };
    }
    return { ...state, drawn: newDrawn, total: newTotal, pos: state.pos + 1 };
  }
  if (action.type === "stop") {
    if (state.phase !== "drawing" || state.drawn.length === 0) return state;
    const gain = state.total;
    return { ...state, lastGain: gain, coins: state.coins + gain, bust: false, phase: "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const nextRound = state.round + 1;
    const done = nextRound > state.maxRounds;
    return { ...state, drawn: [], total: 0, round: nextRound, bust: false, lastGain: 0, phase: done ? "gameover" : "drawing" };
  }
  return state;
}

export function isTerminal(state: CardDrawUpState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.coins } : null;
}
