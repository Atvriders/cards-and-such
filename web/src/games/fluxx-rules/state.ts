import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;

export interface FluxxRulesSettings { dummy: boolean; }


export interface FluxxRulesRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface FluxxRulesState {
  rounds: FluxxRulesRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type FluxxRulesAction =
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

function genRounds(rng: () => number): FluxxRulesRound[] {
  const out: FluxxRulesRound[] = [];
  const GOALS = ["3 Keepers", "2 Keepers + 1 Action", "1 Keeper + 2 Goal cards", "4 Keepers"];
  const HANDS_BY_GOAL: Record<string, string> = {
    "3 Keepers": "K,K,K",
    "2 Keepers + 1 Action": "K,K,A",
    "1 Keeper + 2 Goal cards": "K,G,G",
    "4 Keepers": "K,K,K,K",
  };
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const goal = GOALS[Math.floor(rng() * GOALS.length)]!;
    const correct = HANDS_BY_GOAL[goal]!;
    const wrongHands = Object.values(HANDS_BY_GOAL).filter(h => h !== correct);
    const choices = shuffle([correct, ...shuffle(wrongHands, rng).slice(0, 3)], rng);
    const correctIdx = choices.indexOf(correct) as 0 | 1 | 2 | 3;
    out.push({
      question: "Goal: " + goal + " - which hand satisfies?",
      choices: choices as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: FluxxRulesSettings): FluxxRulesState {
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

export function reducer(state: FluxxRulesState, action: FluxxRulesAction): FluxxRulesState {
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

export function isTerminal(state: FluxxRulesState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
