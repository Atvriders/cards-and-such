import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_QUESTIONS = 20;
export const TIME_LIMIT = 60;

export interface MultiplicationRaceSettings { dummy: boolean; }

export interface RaceQuestion {
  a: number;
  b: number;
  choices: [number, number, number, number];
  correct: 0 | 1 | 2 | 3;
}

export interface MultiplicationRaceState {
  questions: RaceQuestion[];
  currentIndex: number;
  timeLeft: number;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type MultiplicationRaceAction = { type: "answer"; choice: number } | { type: "tick" };

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
    const a = 2 + Math.floor(rng() * 11); // 2..12
    const b = 2 + Math.floor(rng() * 11); // 2..12
    const correct = a * b;
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const delta = (Math.floor(rng() * 12) - 6) || 7;
      const w = correct + delta;
      if (w !== correct && w >= 0) wrongs.add(w);
    }
    const choices = shuffle([correct, ...wrongs], rng);
    const correctIdx = choices.indexOf(correct) as 0 | 1 | 2 | 3;
    out.push({ a, b, choices: choices as [number, number, number, number], correct: correctIdx });
  }
  return out;
}

export function initialState(seed: number, _s: MultiplicationRaceSettings): MultiplicationRaceState {
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

export function reducer(state: MultiplicationRaceState, action: MultiplicationRaceAction): MultiplicationRaceState {
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

export function isTerminal(state: MultiplicationRaceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
