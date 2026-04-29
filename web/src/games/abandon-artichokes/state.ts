import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 15;

export interface AbandonArtichokesSettings { dummy: boolean; }


export interface AbandonArtichokesRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface AbandonArtichokesState {
  rounds: AbandonArtichokesRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type AbandonArtichokesAction =
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

function genRounds(rng: () => number): AbandonArtichokesRound[] {
  const out: AbandonArtichokesRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const counts = new Set<number>();
    while (counts.size < 4) counts.add(Math.floor(rng() * 8));
    const nums = [...counts];
    const min = Math.min(...nums);
    const correctIdx = nums.indexOf(min) as 0 | 1 | 2 | 3;
    out.push({
      question: "Pick the hand with fewest artichokes.",
      choices: nums.map(n => "Artichokes x " + n) as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: AbandonArtichokesSettings): AbandonArtichokesState {
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

export function reducer(state: AbandonArtichokesState, action: AbandonArtichokesAction): AbandonArtichokesState {
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

export function isTerminal(state: AbandonArtichokesState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
