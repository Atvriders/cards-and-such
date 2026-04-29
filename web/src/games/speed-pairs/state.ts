import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 15;

export interface SpeedPairsSettings { dummy: boolean; }

export const SYMBOLS: string[] = ["K","Q","J","A","10","9","8","7","6","5","4","3","2","T"];

export interface SpeedPairsRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface SpeedPairsState {
  rounds: SpeedPairsRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type SpeedPairsAction =
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

function genRounds(rng: () => number): SpeedPairsRound[] {
  const out: SpeedPairsRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const dup = SYMBOLS[Math.floor(rng() * SYMBOLS.length)]!;
    const others: string[] = [];
    const used = new Set<string>([dup]);
    while (others.length < 2) {
      const s = SYMBOLS[Math.floor(rng() * SYMBOLS.length)]!;
      if (!used.has(s)) { others.push(s); used.add(s); }
    }
    const arr = shuffle([dup, dup, others[0]!, others[1]!], rng);
    const correctIdx = arr.indexOf(dup) as 0 | 1 | 2 | 3;
    out.push({
      question: "Tap one of the duplicate cards.",
      choices: arr as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: SpeedPairsSettings): SpeedPairsState {
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

export function reducer(state: SpeedPairsState, action: SpeedPairsAction): SpeedPairsState {
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

export function isTerminal(state: SpeedPairsState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
