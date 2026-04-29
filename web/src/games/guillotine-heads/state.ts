import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 15;

export interface GuillotineHeadsSettings { dummy: boolean; }


export interface GuillotineHeadsRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface GuillotineHeadsState {
  rounds: GuillotineHeadsRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type GuillotineHeadsAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function genRounds(rng: () => number): GuillotineHeadsRound[] {
  const out: GuillotineHeadsRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const totals = new Set<number>();
    while (totals.size < 4) totals.add(5 + Math.floor(rng() * 30));
    const nums = [...totals];
    const max = Math.max(...nums);
    const correctIdx = nums.indexOf(max) as 0 | 1 | 2 | 3;
    out.push({
      question: "Pick the queue with highest noble total.",
      choices: nums.map(n => "Queue worth " + n) as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: GuillotineHeadsSettings): GuillotineHeadsState {
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

export function reducer(state: GuillotineHeadsState, action: GuillotineHeadsAction): GuillotineHeadsState {
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

export function isTerminal(state: GuillotineHeadsState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
