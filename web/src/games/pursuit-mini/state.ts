import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const PATH_LEN = 50;

export interface Question { q: string; a: boolean; }
export const QUESTIONS: Question[] = [
  { q: "Saving for retirement is easier when you start young.", a: true },
  { q: "Compound interest works against you when you save.", a: false },
  { q: "Eating breakfast every day is required for survival.", a: false },
  { q: "Listening more than you speak is a sign of wisdom.", a: true },
  { q: "Sleep is optional once you turn 30.", a: false },
  { q: "Apologizing first is always a sign of weakness.", a: false },
  { q: "Reading regularly improves vocabulary over time.", a: true },
  { q: "Exercise reduces stress.", a: true },
  { q: "Money guarantees happiness.", a: false },
  { q: "Asking for help is a sign of maturity.", a: true },
  { q: "Multitasking always makes you more productive.", a: false },
  { q: "Time spent with loved ones is rarely wasted.", a: true },
  { q: "Holding grudges is healthy long-term.", a: false },
  { q: "Curiosity tends to keep your mind sharp with age.", a: true },
  { q: "Worrying about the past changes the past.", a: false },
  { q: "Honesty usually builds trust.", a: true },
  { q: "Regret is a useful guide for future choices.", a: true },
  { q: "Comparing yourself to others usually makes you happier.", a: false },
  { q: "Walking 30 minutes a day has health benefits.", a: true },
  { q: "Learning ends when school ends.", a: false },
  { q: "Patience improves with practice.", a: true },
  { q: "Anger is the best decision-making tool.", a: false },
  { q: "Gratitude improves perceived well-being.", a: true },
  { q: "Procrastination usually solves problems.", a: false },
  { q: "Failure can teach more than success.", a: true },
];

export interface PursuitSettings { dummy: boolean; }
export interface PursuitState {
  rngSeed: number;
  pos: number;
  wisdom: number;
  current: Question | null;
  lastRoll: number | null;
  lastCorrect: boolean | null;
  phase: "rolling" | "asking" | "answered" | "done";
}
export type PursuitAction = { type: "roll" } | { type: "answer"; value: boolean } | { type: "next" };

function pickQ(seed: number): { q: Question; nextSeed: number } {
  const rng = mulberry32(seed);
  const i = Math.floor(rng() * QUESTIONS.length);
  return { q: QUESTIONS[i]!, nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function initialState(seed: number, _s: PursuitSettings): PursuitState {
  return { rngSeed: seed, pos: 0, wisdom: 0, current: null, lastRoll: null, lastCorrect: null, phase: "rolling" };
}

export function reducer(state: PursuitState, action: PursuitAction): PursuitState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "rolling") {
    const rng = mulberry32(state.rngSeed);
    const r = 1 + Math.floor(rng() * 6);
    const seedAfter = Math.floor(rng() * 2 ** 31);
    const { q, nextSeed } = pickQ(seedAfter);
    const pos = Math.min(state.pos + r, PATH_LEN);
    return { ...state, rngSeed: nextSeed, pos, lastRoll: r, current: q, phase: "asking" };
  }
  if (action.type === "answer" && state.phase === "asking" && state.current) {
    const correct = action.value === state.current.a;
    const wisdom = state.wisdom + (correct ? 10 : 0);
    const reachedEnd = state.pos >= PATH_LEN;
    return { ...state, wisdom, lastCorrect: correct, phase: reachedEnd ? "done" : "answered" };
  }
  if (action.type === "next" && state.phase === "answered") {
    return { ...state, phase: "rolling", current: null, lastRoll: null, lastCorrect: null };
  }
  return state;
}

export function score(s: PursuitState): number { return s.wisdom; }
export function isTerminal(s: PursuitState): { score: number } | null { return s.phase === "done" ? { score: score(s) } : null; }
