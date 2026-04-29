import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 15;

export interface CinematrixYrSettings { dummy: boolean; }

const PAIRS: [string, string][] = [["Star Wars: A New Hope","1977"],["Jaws","1975"],["E.T.","1982"],["Titanic","1997"],["The Matrix","1999"],["Avatar","2009"],["Inception","2010"],["The Dark Knight","2008"],["Frozen","2013"],["Interstellar","2014"],["Get Out","2017"],["Parasite","2019"],["Forrest Gump","1994"],["Pulp Fiction","1994"],["Toy Story","1995"],["Jurassic Park","1993"],["Back to the Future","1985"],["The Godfather","1972"]];
const PROMPT_PREFIX = "Which year?";
const PROMPT_SUFFIX = "";

export interface CinematrixYrRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface CinematrixYrState {
  rounds: CinematrixYrRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type CinematrixYrAction =
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

function genRounds(rng: () => number): CinematrixYrRound[] {
  const out: CinematrixYrRound[] = [];
  const usedKeys = new Set<string>();
  let attempts = 0;
  while (out.length < TOTAL_ROUNDS && attempts < 300) {
    attempts++;
    const idx = Math.floor(rng() * PAIRS.length);
    const pair = PAIRS[idx]!;
    const key = pair[1];
    const correctAns = pair[0];
    if (usedKeys.has(key + "::" + correctAns)) continue;
    usedKeys.add(key + "::" + correctAns);
    const wrongs: string[] = [];
    const seen = new Set<string>([correctAns]);
    let triesW = 0;
    while (wrongs.length < 3 && triesW < 60) {
      triesW++;
      const w = PAIRS[Math.floor(rng() * PAIRS.length)]![0];
      if (!seen.has(w)) { wrongs.push(w); seen.add(w); }
    }
    if (wrongs.length < 3) continue;
    const choices = shuffle([correctAns, ...wrongs], rng);
    const correctIdx = choices.indexOf(correctAns) as 0 | 1 | 2 | 3;
    out.push({
      question: PROMPT_PREFIX + " " + key + PROMPT_SUFFIX,
      choices: choices as [string, string, string, string],
      correct: correctIdx,
    });
  }
  // If we couldn't fill enough unique rounds, allow repeats.
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
      question: PROMPT_PREFIX + " " + pair[1] + PROMPT_SUFFIX,
      choices: choices as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: CinematrixYrSettings): CinematrixYrState {
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

export function reducer(state: CinematrixYrState, action: CinematrixYrAction): CinematrixYrState {
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

export function isTerminal(state: CinematrixYrState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
