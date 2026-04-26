import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardStackFlipSettings { rounds: "10" | "20"; }
export interface CardStackFlipState {
  deck: number[]; pos: number; flipped: number[]; score: number;
  round: number; maxRounds: number; phase: "waiting" | "revealed" | "gameover"; lastPts: number;
}
export type CardStackFlipAction = { type: "flip" } | { type: "next" };

export function rankName(c: number): string { return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][c % 13]!; }
export function suitName(c: number): string { return ["♠","♥","♦","♣"][Math.floor(c / 13)]!; }

function makeDeck(rng: () => number): number[] {
  const a = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: CardStackFlipSettings): CardStackFlipState {
  const rng = mulberry32(seed);
  return { deck: makeDeck(rng), pos: 0, flipped: [], score: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "waiting", lastPts: 0 };
}

export function reducer(state: CardStackFlipState, action: CardStackFlipAction): CardStackFlipState {
  if (state.phase === "gameover") return state;
  if (action.type === "flip" && state.phase === "waiting") {
    const f = [state.deck[state.pos % 52]!, state.deck[(state.pos + 1) % 52]!, state.deck[(state.pos + 2) % 52]!, state.deck[(state.pos + 3) % 52]!, state.deck[(state.pos + 4) % 52]!];
    const sum = f.reduce((s, c) => s + (c % 13) + 2, 0);
    const pts = Math.min(sum, 50);
    return { ...state, flipped: f, lastPts: pts, score: state.score + pts, phase: "revealed" };
  }
  if (action.type === "next" && state.phase === "revealed") {
    const next = state.round + 1;
    const done = next > state.maxRounds;
    return { ...state, pos: state.pos + 5, flipped: [], round: next, phase: done ? "gameover" : "waiting" };
  }
  return state;
}

export function isTerminal(state: CardStackFlipState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
