import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;

export interface CockroachBluffSettings { dummy: boolean; }

const PAIRS: [string, string][] = [["Cockroach","Animal type 1"],["Rat","Animal type 2"],["Bat","Animal type 3"],["Fly","Animal type 4"],["Spider","Animal type 5"],["Scorpion","Animal type 6"],["Stinkbug","Animal type 7"],["Toad","Animal type 8"],["First to 4 same animals","Loses the game"],["Pass face-down with claim","Standard play action"],["Challenge or pass on","Receiver's choice"],["Jacques Zeimet","Designer"],["Drei Magier Spiele 2004","Publisher and year"],["8 of each animal","Card count per animal type"],["Bluff or truth declaration","Core mechanic"]];

const PROMPT_PREFIX = "What's the rule or fact for this Cockroach Bluff element?";

export interface CockroachBluffRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface CockroachBluffState {
  rounds: CockroachBluffRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type CockroachBluffAction =
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

function genRounds(rng: () => number): CockroachBluffRound[] {
  const out: CockroachBluffRound[] = [];
  const used = new Set<string>();
  let attempts = 0;
  while (out.length < TOTAL_ROUNDS && attempts < 400) {
    attempts++;
    const pair = PAIRS[Math.floor(rng() * PAIRS.length)]!;
    const key = pair[1];
    const correctAns = pair[0];
    if (used.has(key)) continue;
    used.add(key);
    const wrongs: string[] = [];
    const seen = new Set<string>([correctAns]);
    let triesW = 0;
    while (wrongs.length < 3 && triesW < 80) {
      triesW++;
      const w = PAIRS[Math.floor(rng() * PAIRS.length)]![0];
      if (!seen.has(w)) { wrongs.push(w); seen.add(w); }
    }
    if (wrongs.length < 3) continue;
    const choices = shuffle([correctAns, ...wrongs], rng);
    const correctIdx = choices.indexOf(correctAns) as 0 | 1 | 2 | 3;
    out.push({
      question: PROMPT_PREFIX + " " + key,
      choices: choices as [string, string, string, string],
      correct: correctIdx,
    });
  }
  while (out.length < TOTAL_ROUNDS) {
    const pair = PAIRS[Math.floor(rng() * PAIRS.length)]!;
    const correctAns = pair[0];
    const wrongs: string[] = [];
    const seen = new Set<string>([correctAns]);
    while (wrongs.length < 3) {
      const w = PAIRS[Math.floor(rng() * PAIRS.length)]![0];
      if (!seen.has(w)) { wrongs.push(w); seen.add(w); }
    }
    const choices = shuffle([correctAns, ...wrongs], rng);
    const correctIdx = choices.indexOf(correctAns) as 0 | 1 | 2 | 3;
    out.push({
      question: PROMPT_PREFIX + " " + pair[1],
      choices: choices as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: CockroachBluffSettings): CockroachBluffState {
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

export function reducer(state: CockroachBluffState, action: CockroachBluffAction): CockroachBluffState {
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

export function isTerminal(state: CockroachBluffState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
