import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Find Prime: 20 rounds. Each round shows 4 numbers, exactly one of which is prime.
// Correct = +10. Wrong = 0. No timer.

export const TOTAL_ROUNDS = 20;

export interface FindPrimeSettings { dummy: boolean; }

export interface FindPrimeRound {
  numbers: [number, number, number, number];
  correct: 0 | 1 | 2 | 3;
}

export interface FindPrimeState {
  rounds: FindPrimeRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type FindPrimeAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
  return true;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function pickPrime(rng: () => number): number {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  return primes[Math.floor(rng() * primes.length)]!;
}

function pickComposite(rng: () => number, exclude: Set<number>): number {
  for (let attempt = 0; attempt < 50; attempt++) {
    const n = 4 + Math.floor(rng() * 96);
    if (!isPrime(n) && !exclude.has(n)) return n;
  }
  return 4;
}

function genRounds(rng: () => number): FindPrimeRound[] {
  const out: FindPrimeRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const prime = pickPrime(rng);
    const used = new Set<number>([prime]);
    const composites: number[] = [];
    while (composites.length < 3) {
      const c = pickComposite(rng, used);
      composites.push(c);
      used.add(c);
    }
    const all = shuffle([prime, ...composites], rng);
    const correctIdx = all.indexOf(prime) as 0 | 1 | 2 | 3;
    out.push({ numbers: all as [number, number, number, number], correct: correctIdx });
  }
  return out;
}

export function initialState(seed: number, _s: FindPrimeSettings): FindPrimeState {
  const rng = mulberry32(seed);
  return {
    rounds: genRounds(rng),
    currentIndex: 0,
    selected: null,
    submitted: false,
    score: 0,
    correctCount: 0,
    phase: "playing",
  };
}

export function reducer(state: FindPrimeState, action: FindPrimeAction): FindPrimeState {
  if (state.phase === "done") return state;
  if (action.type === "select") {
    if (state.submitted) return state;
    return { ...state, selected: action.choice };
  }
  if (action.type === "submit") {
    if (state.submitted || state.selected === null) return state;
    const r = state.rounds[state.currentIndex]!;
    const ok = state.selected === r.correct;
    return {
      ...state,
      submitted: true,
      score: state.score + (ok ? 10 : 0),
      correctCount: state.correctCount + (ok ? 1 : 0),
      phase: "result",
    };
  }
  if (action.type === "next") {
    const ni = state.currentIndex + 1;
    if (ni >= state.rounds.length) return { ...state, phase: "done" };
    return { ...state, currentIndex: ni, selected: null, submitted: false, phase: "playing" };
  }
  return state;
}

export function isTerminal(state: FindPrimeState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
