import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 15;

export interface SherlookDiffSettings { dummy: boolean; }

export const SYMBOLS: string[] = ["BLUE","GREEN","RED","YELLOW","PURPLE","ORANGE","BLACK","WHITE","BROWN","CYAN","PINK","NAVY","TEAL","CRIMSON","AMBER"];

export interface SherlookDiffRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface SherlookDiffState {
  rounds: SherlookDiffRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type SherlookDiffAction =
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

function genRounds(rng: () => number): SherlookDiffRound[] {
  const out: SherlookDiffRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const same = SYMBOLS[Math.floor(rng() * SYMBOLS.length)]!;
    let diff = same;
    let tries = 0;
    while (diff === same && tries < 50) { diff = SYMBOLS[Math.floor(rng() * SYMBOLS.length)]!; tries++; }
    const arr = shuffle([same, same, same, diff], rng);
    const correctIdx = arr.indexOf(diff) as 0 | 1 | 2 | 3;
    out.push({
      question: "Spot the different one!",
      choices: arr as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: SherlookDiffSettings): SherlookDiffState {
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

export function reducer(state: SherlookDiffState, action: SherlookDiffAction): SherlookDiffState {
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

export function isTerminal(state: SherlookDiffState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
