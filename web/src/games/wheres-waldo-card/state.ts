import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 15;

export interface WheresWaldoCardSettings { dummy: boolean; }

export const TARGET = "Waldo";
export const DECOYS: string[] = ["Smiles","Wink","Cool","Thinking","Neutral","Upside","Halo","Tongue","Sleepy","Blush","Grin","Tear","Squint","Sweat"];

export interface WheresWaldoCardRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface WheresWaldoCardState {
  rounds: WheresWaldoCardRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type WheresWaldoCardAction =
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

function genRounds(rng: () => number): WheresWaldoCardRound[] {
  const out: WheresWaldoCardRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const wrongs: string[] = [];
    while (wrongs.length < 3) {
      const d = DECOYS[Math.floor(rng() * DECOYS.length)]!;
      wrongs.push(d);
    }
    const arr = shuffle([TARGET, ...wrongs], rng);
    const correctIdx = arr.indexOf(TARGET) as 0 | 1 | 2 | 3;
    out.push({
      question: "Find: " + TARGET,
      choices: arr as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: WheresWaldoCardSettings): WheresWaldoCardState {
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

export function reducer(state: WheresWaldoCardState, action: WheresWaldoCardAction): WheresWaldoCardState {
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

export function isTerminal(state: WheresWaldoCardState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
