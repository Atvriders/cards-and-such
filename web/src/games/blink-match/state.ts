import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 15;

export interface BlinkMatchSettings { dummy: boolean; }


export interface BlinkMatchRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface BlinkMatchState {
  rounds: BlinkMatchRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type BlinkMatchAction =
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

const SHAPES = ["circle", "square", "triangle", "diamond"];
const COLORS = ["red", "blue", "green", "purple"];
const COUNTS = [1, 2, 3, 4];

function genRounds(rng: () => number): BlinkMatchRound[] {
  const out: BlinkMatchRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const sh = SHAPES[Math.floor(rng() * 4)]!;
    const co = COLORS[Math.floor(rng() * 4)]!;
    const cn = COUNTS[Math.floor(rng() * 4)]!;
    const center = sh + " " + co + " x" + cn;
    const matchAttr = Math.floor(rng() * 3);
    const matchCard =
      matchAttr === 0 ? sh + " any anyx" :
      matchAttr === 1 ? "any " + co + " anyx" :
      "any any x" + cn;
    const wrongs: string[] = [];
    let tries = 0;
    while (wrongs.length < 3 && tries < 100) {
      tries++;
      const wsh = SHAPES[Math.floor(rng() * 4)]!;
      const wco = COLORS[Math.floor(rng() * 4)]!;
      const wcn = COUNTS[Math.floor(rng() * 4)]!;
      if (wsh !== sh && wco !== co && wcn !== cn) {
        wrongs.push(wsh + " " + wco + " x" + wcn);
      }
    }
    while (wrongs.length < 3) wrongs.push("filler-" + wrongs.length);
    const choices = shuffle([matchCard, ...wrongs], rng);
    const correctIdx = choices.indexOf(matchCard) as 0 | 1 | 2 | 3;
    out.push({
      question: "Center: " + center + " - pick match by shape, color, or count.",
      choices: choices as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: BlinkMatchSettings): BlinkMatchState {
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

export function reducer(state: BlinkMatchState, action: BlinkMatchAction): BlinkMatchState {
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

export function isTerminal(state: BlinkMatchState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
