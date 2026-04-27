import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Find Composite: 20 rounds. Each round shows 4 numbers: 3 primes, 1 composite.
// Pick the composite. Correct = +10. No timer.

export const TOTAL_ROUNDS = 20;

export interface FindCompositeSettings { dummy: boolean; }

export interface FindCompositeRound {
  numbers: [number, number, number, number];
  correct: 0 | 1 | 2 | 3;
}

export interface FindCompositeState {
  rounds: FindCompositeRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type FindCompositeAction =
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

function pickComposite(rng: () => number): number {
  for (let attempt = 0; attempt < 50; attempt++) {
    const n = 4 + Math.floor(rng() * 96);
    if (!isPrime(n)) return n;
  }
  return 4;
}

function pickPrime(rng: () => number, exclude: Set<number>): number {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  for (let attempt = 0; attempt < 50; attempt++) {
    const p = primes[Math.floor(rng() * primes.length)]!;
    if (!exclude.has(p)) return p;
  }
  return 2;
}

function genRounds(rng: () => number): FindCompositeRound[] {
  const out: FindCompositeRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const composite = pickComposite(rng);
    const used = new Set<number>([composite]);
    const primes: number[] = [];
    while (primes.length < 3) {
      const p = pickPrime(rng, used);
      primes.push(p);
      used.add(p);
    }
    const all = shuffle([composite, ...primes], rng);
    const correctIdx = all.indexOf(composite) as 0 | 1 | 2 | 3;
    out.push({ numbers: all as [number, number, number, number], correct: correctIdx });
  }
  return out;
}

export function initialState(seed: number, _s: FindCompositeSettings): FindCompositeState {
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

export function reducer(state: FindCompositeState, action: FindCompositeAction): FindCompositeState {
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

export function isTerminal(state: FindCompositeState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
