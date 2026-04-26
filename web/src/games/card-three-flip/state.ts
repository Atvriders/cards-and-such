import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Three Flip: Flip 3 cards, score based on the highest rank shown.
export interface CardThreeFlipSettings { rounds: "10" | "20"; }

export interface CardThreeFlipState {
  deck: number[];
  pos: number;
  flipped: number[];
  coins: number;
  round: number;
  maxRounds: number;
  phase: "waiting" | "revealed" | "gameover";
  lastScore: number;
}

export type CardThreeFlipAction = { type: "flip" } | { type: "next" };

function makeDeck(rng: () => number): number[] {
  const arr = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j]!, arr[i]!]; }
  return arr;
}

export function rankName(c: number): string {
  return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][c % 13]!;
}

export function suitName(c: number): string {
  return ["♠","♥","♦","♣"][Math.floor(c / 13)]!;
}

export function initialState(seed: number, settings: CardThreeFlipSettings): CardThreeFlipState {
  const rng = mulberry32(seed);
  return { deck: makeDeck(rng), pos: 0, flipped: [], coins: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "waiting", lastScore: 0 };
}

export function reducer(state: CardThreeFlipState, action: CardThreeFlipAction): CardThreeFlipState {
  if (state.phase === "gameover") return state;
  if (action.type === "flip") {
    if (state.phase !== "waiting") return state;
    const cards = [state.deck[state.pos % 52]!, state.deck[(state.pos + 1) % 52]!, state.deck[(state.pos + 2) % 52]!];
    const maxRank = Math.max(...cards.map(c => c % 13));
    const pts = maxRank + 2; // 2..14
    return { ...state, flipped: cards, lastScore: pts, coins: state.coins + pts, phase: "revealed" };
  }
  if (action.type === "next") {
    if (state.phase !== "revealed") return state;
    const next = state.round + 1;
    const done = next > state.maxRounds;
    return { ...state, pos: state.pos + 3, flipped: [], round: next, phase: done ? "gameover" : "waiting" };
  }
  return state;
}

export function isTerminal(state: CardThreeFlipState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.coins } : null;
}
