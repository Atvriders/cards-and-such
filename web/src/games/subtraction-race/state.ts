import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_QUESTIONS = 20;
export const TIME_LIMIT = 60;

export interface SubtractionRaceSettings { dummy: boolean; }

export interface RaceQuestion {
  a: number;
  b: number;
  choices: [number, number, number, number];
  correct: 0 | 1 | 2 | 3;
}

export interface SubtractionRaceState {
  questions: RaceQuestion[];
  currentIndex: number;
  timeLeft: number;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type SubtractionRaceAction = { type: "answer"; choice: number } | { type: "tick" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function genQuestions(rng: () => number): RaceQuestion[] {
  const out: RaceQuestion[] = [];
  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const big = 20 + Math.floor(rng() * 80);
    const small = 1 + Math.floor(rng() * Math.max(1, big - 1));
    const correct = big - small;
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const delta = (Math.floor(rng() * 10) - 5) || 6;
      const w = correct + delta;
      if (w !== correct && w >= 0) wrongs.add(w);
    }
    const choices = shuffle([correct, ...wrongs], rng);
    const correctIdx = choices.indexOf(correct) as 0 | 1 | 2 | 3;
    out.push({ a: big, b: small, choices: choices as [number, number, number, number], correct: correctIdx });
  }
  return out;
}

export function initialState(seed: number, _s: SubtractionRaceSettings): SubtractionRaceState {
  const rng = mulberry32(seed);
  return {
    questions: genQuestions(rng),
    currentIndex: 0,
    timeLeft: TIME_LIMIT,
    score: 0,
    correctCount: 0,
    phase: "playing",
  };
}

export function reducer(state: SubtractionRaceState, action: SubtractionRaceAction): SubtractionRaceState {
  if (state.phase === "done") return state;
  if (action.type === "answer") {
    const q = state.questions[state.currentIndex];
    if (!q) return state;
    const correct = action.choice === q.correct;
    const ni = state.currentIndex + 1;
    const done = ni >= state.questions.length;
    return {
      ...state,
      currentIndex: ni,
      score: state.score + (correct ? 10 : 0),
      correctCount: state.correctCount + (correct ? 1 : 0),
      phase: done ? "done" : "playing",
    };
  }
  if (action.type === "tick") {
    const t = state.timeLeft - 1;
    if (t <= 0) return { ...state, timeLeft: 0, phase: "done" };
    return { ...state, timeLeft: t };
  }
  return state;
}

export function isTerminal(state: SubtractionRaceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
