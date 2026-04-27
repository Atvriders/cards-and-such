import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROUNDS = 13;
export const DRAWS_PER_ROUND = 4;
export const POINTS_PER_HIT = 20;

export interface RankCollectorSettings { dummy: boolean; }

export interface RankCollectorState {
  rngSeed: number;
  round: number;
  targets: number[]; // shuffled order of 13 target indices
  draws: number[]; // cards drawn this round
  hits: boolean[]; // hit flag per drawn card
  score: number;
  phase: "drawing" | "done";
}

export type RankCollectorAction = { type: "draw" } | { type: "next" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export const TARGET_LABELS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

const matchTarget = (c: number, target: number): boolean => (c % 13) === target;

function shuffleTargets(rng: () => number, n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: RankCollectorSettings): RankCollectorState {
  const rng = mulberry32(seed);
  const targets = shuffleTargets(rng, ROUNDS);
  return { rngSeed: Math.floor(rng() * 2 ** 31), round: 0, targets, draws: [], hits: [], score: 0, phase: "drawing" };
}

export function reducer(state: RankCollectorState, action: RankCollectorAction): RankCollectorState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.draws.length >= DRAWS_PER_ROUND) return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const target = state.targets[state.round]!;
    const hit = matchTarget(c, target);
    return { ...state, rngSeed: nextSeed, draws: [...state.draws, c], hits: [...state.hits, hit], score: state.score + (hit ? POINTS_PER_HIT : 0) };
  }
  if (action.type === "next") {
    if (state.draws.length < DRAWS_PER_ROUND) return state;
    const nextRound = state.round + 1;
    if (nextRound >= ROUNDS) return { ...state, phase: "done" };
    return { ...state, round: nextRound, draws: [], hits: [] };
  }
  return state;
}

export function isTerminal(state: RankCollectorState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
