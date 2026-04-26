import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Pick Three: 5 face-down cards, pick 3, score the sum of their ranks.
export interface CardPickThreeSettings { rounds: "10" | "20"; }

export interface CardPickThreeState {
  deck: number[];
  pos: number;
  hand: number[];          // 5 cards face-down
  picked: number[];        // indices picked
  coins: number;
  round: number;
  maxRounds: number;
  phase: "picking" | "result" | "gameover";
  lastScore: number;
}

export type CardPickThreeAction = { type: "pick"; index: number } | { type: "confirm" } | { type: "next" };

function makeDeck(rng: () => number): number[] {
  const arr = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j]!, arr[i]!]; }
  return arr;
}

export function cardLabel(c: number): string {
  return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][c % 13]! + ["♠","♥","♦","♣"][Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { return Math.floor(c / 13) === 1 || Math.floor(c / 13) === 2; }

export function initialState(seed: number, settings: CardPickThreeSettings): CardPickThreeState {
  const rng = mulberry32(seed);
  const deck = makeDeck(rng);
  return { deck, pos: 5, hand: deck.slice(0, 5), picked: [], coins: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "picking", lastScore: 0 };
}

export function reducer(state: CardPickThreeState, action: CardPickThreeAction): CardPickThreeState {
  if (state.phase === "gameover") return state;
  if (action.type === "pick") {
    if (state.phase !== "picking") return state;
    const i = action.index;
    if (state.picked.includes(i)) {
      return { ...state, picked: state.picked.filter(x => x !== i) };
    }
    if (state.picked.length >= 3) return state;
    return { ...state, picked: [...state.picked, i] };
  }
  if (action.type === "confirm") {
    if (state.phase !== "picking" || state.picked.length !== 3) return state;
    const score = state.picked.reduce((sum, i) => sum + (state.hand[i]! % 13) + 2, 0);
    return { ...state, lastScore: score, coins: state.coins + score, phase: "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const nextRound = state.round + 1;
    const done = nextRound > state.maxRounds;
    const newHand = state.deck.slice(state.pos, state.pos + 5);
    return { ...state, hand: newHand, pos: state.pos + 5, picked: [], round: nextRound, lastScore: 0, phase: done ? "gameover" : "picking" };
  }
  return state;
}

export function isTerminal(state: CardPickThreeState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.coins } : null;
}
