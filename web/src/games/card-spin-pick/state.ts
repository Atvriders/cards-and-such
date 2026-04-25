import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Spin Pick: A "spinner" selects one of 4 face-down cards each round.
// Player locks in which card they want BEFORE the spinner reveals.
// If their card matches the spinner result, they win big; else small consolation.

export interface CardSpinPickSettings { rounds: "8" | "12"; }

export interface CardSpinPickState {
  deck: number[];
  pos: number;
  rowCards: [number, number, number, number];
  spinResult: number | null;   // index 0-3
  playerPick: number | null;
  score: number;
  round: number;
  maxRounds: number;
  phase: "picking" | "spun" | "gameover";
  rngSeed: number;
}

export type CardSpinPickAction =
  | { type: "pick"; index: number }
  | { type: "spin" }
  | { type: "next" };

function makeDeck(rng: () => number): number[] {
  const arr = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j]!, arr[i]!]; }
  return arr;
}

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}

export function initialState(seed: number, settings: CardSpinPickSettings): CardSpinPickState {
  const rng = mulberry32(seed);
  const deck = makeDeck(rng);
  const rowCards = [deck[0]!, deck[1]!, deck[2]!, deck[3]!] as [number, number, number, number];
  return { deck, pos: 4, rowCards, spinResult: null, playerPick: null, score: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "picking", rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: CardSpinPickState, action: CardSpinPickAction): CardSpinPickState {
  if (state.phase === "gameover") return state;
  if (action.type === "pick") {
    if (state.phase !== "picking") return state;
    return { ...state, playerPick: action.index };
  }
  if (action.type === "spin") {
    if (state.playerPick === null || state.phase !== "picking") return state;
    const rng = mulberry32(state.rngSeed);
    const spinResult = Math.floor(rng() * 4);
    const won = spinResult === state.playerPick;
    const pts = won ? 100 : 10;
    return { ...state, spinResult, score: state.score + pts, phase: "spun", rngSeed: Math.floor(rng() * 2 ** 31) };
  }
  if (action.type === "next") {
    if (state.phase !== "spun") return state;
    const newRound = state.round + 1;
    if (newRound > state.maxRounds) return { ...state, phase: "gameover" };
    const rng = mulberry32(state.rngSeed);
    const rowCards = [state.deck[state.pos % 52]!, state.deck[(state.pos + 1) % 52]!, state.deck[(state.pos + 2) % 52]!, state.deck[(state.pos + 3) % 52]!] as [number, number, number, number];
    return { ...state, pos: state.pos + 4, rowCards, spinResult: null, playerPick: null, round: newRound, phase: "picking", rngSeed: Math.floor(rng() * 2 ** 31) };
  }
  return state;
}

export function isTerminal(state: CardSpinPickState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
