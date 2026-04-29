import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;

export interface KlaskMagneticSettings { dummy: boolean; }


export interface KlaskMagneticRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface KlaskMagneticState {
  rounds: KlaskMagneticRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type KlaskMagneticAction =
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

function genRounds(rng: () => number): KlaskMagneticRound[] {
  const out: KlaskMagneticRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const goalPos = Math.floor(rng() * 8);
    const correct = "Magnet @ " + goalPos;
    const wrongs = new Set<string>();
    let tries = 0;
    while (wrongs.size < 3 && tries < 50) {
      tries++;
      const w = Math.floor(rng() * 8);
      if (w !== goalPos) wrongs.add("Magnet @ " + w);
    }
    while (wrongs.size < 3) wrongs.add("Magnet @ X" + wrongs.size);
    const choices = shuffle([correct, ...wrongs], rng);
    const correctIdx = choices.indexOf(correct) as 0 | 1 | 2 | 3;
    out.push({
      question: "Goal slot at " + goalPos + " - which magnet path scores?",
      choices: choices as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: KlaskMagneticSettings): KlaskMagneticState {
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

export function reducer(state: KlaskMagneticState, action: KlaskMagneticAction): KlaskMagneticState {
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

export function isTerminal(state: KlaskMagneticState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
