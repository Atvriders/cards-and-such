import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 15;

export interface quietYearMapSettings { dummy: boolean; }

const PAIRS: [string, string][] = [["River bend with fish","Resource"],["Wolves in the forest","Threat"],["Children play in the meadow","Hope"],["Harvest festival in autumn","Tradition"],["Old well runs dry","Decay"],["New road built east","Progress"],["Stranger arrives","Mystery"],["Wood pile dwindles","Concern"],["Snowfall begins","Season Change"],["Field flooded","Crisis"]];
const PROMPT_PREFIX = "Match:";
const PROMPT_SUFFIX = "";

export interface quietYearMapRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface quietYearMapState {
  rounds: quietYearMapRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type quietYearMapAction =
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

function genRounds(rng: () => number): quietYearMapRound[] {
  const out: quietYearMapRound[] = [];
  let attempts = 0;
  while (out.length < TOTAL_ROUNDS && attempts < 300) {
    attempts++;
    const idx = Math.floor(rng() * PAIRS.length);
    const pair = PAIRS[idx]!;
    const correctAns = pair[1];
    const wrongs: string[] = [];
    const seen = new Set<string>([correctAns]);
    let triesW = 0;
    while (wrongs.length < 3 && triesW < 60) {
      triesW++;
      const w = PAIRS[Math.floor(rng() * PAIRS.length)]![1];
      if (!seen.has(w)) { wrongs.push(w); seen.add(w); }
    }
    if (wrongs.length < 3) continue;
    const choices = shuffle([correctAns, ...wrongs], rng);
    const correctIdx = choices.indexOf(correctAns) as 0 | 1 | 2 | 3;
    out.push({
      question: PROMPT_PREFIX + " " + pair[0] + PROMPT_SUFFIX,
      choices: choices as [string, string, string, string],
      correct: correctIdx,
    });
  }
  while (out.length < TOTAL_ROUNDS) {
    const pair = PAIRS[Math.floor(rng() * PAIRS.length)]!;
    const correctAns = pair[1];
    const wrongs: string[] = [];
    const seen = new Set<string>([correctAns]);
    while (wrongs.length < 3) {
      const w = PAIRS[Math.floor(rng() * PAIRS.length)]![1];
      if (!seen.has(w)) { wrongs.push(w); seen.add(w); }
    }
    const choices = shuffle([correctAns, ...wrongs], rng);
    const correctIdx = choices.indexOf(correctAns) as 0 | 1 | 2 | 3;
    out.push({
      question: PROMPT_PREFIX + " " + pair[0] + PROMPT_SUFFIX,
      choices: choices as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: quietYearMapSettings): quietYearMapState {
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

export function reducer(state: quietYearMapState, action: quietYearMapAction): quietYearMapState {
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

export function isTerminal(state: quietYearMapState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
