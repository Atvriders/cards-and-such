import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;

export interface BrainbowSettings { dummy: boolean; }


export interface BrainbowRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface BrainbowState {
  rounds: BrainbowRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type BrainbowAction =
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

const RAINBOW = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];

function genRounds(rng: () => number): BrainbowRound[] {
  const out: BrainbowRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const start = Math.floor(rng() * 5);
    const correctSeq = RAINBOW.slice(start, start + 3).join("->");
    const wrongs = new Set<string>();
    let tries = 0;
    while (wrongs.size < 3 && tries < 60) {
      tries++;
      const sh = shuffle(RAINBOW.slice(start, start + 3), rng).join("->");
      if (sh !== correctSeq) wrongs.add(sh);
    }
    while (wrongs.size < 3) wrongs.add("dummy" + wrongs.size);
    const choices = shuffle([correctSeq, ...wrongs], rng);
    const correctIdx = choices.indexOf(correctSeq) as 0 | 1 | 2 | 3;
    out.push({
      question: "Pick rainbow order starting from " + RAINBOW[start]!,
      choices: choices as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: BrainbowSettings): BrainbowState {
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

export function reducer(state: BrainbowState, action: BrainbowAction): BrainbowState {
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

export function isTerminal(state: BrainbowState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
