import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;

export interface TaylordleSwiftSettings { dummy: boolean; }

const PAIRS: [string, string][] = [["Folklore","August slipped away into a moment in time"],["1989","Welcome to New York"],["Red","All too well, the scarf"],["Lover","ME! Spelling is fun"],["Reputation","Look what you made me do"],["Speak Now","Mean people, banjo era"],["Fearless","You belong with me, marching band"],["Evermore","Champagne problems, sister album to Folklore"],["Midnights","Anti-Hero confessional"],["Folklore","Cardigan under your bed"],["1989","Bad Blood gunmetal aesthetic"],["Red","We are never ever getting back together"],["Lover","Cruel Summer"],["Speak Now","Innocent forgiveness song"],["Reputation","Delicate vulnerable confession"]];

const PROMPT_PREFIX = "Which album does this Taylor lyric/handle belong to?";

export interface TaylordleSwiftRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface TaylordleSwiftState {
  rounds: TaylordleSwiftRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type TaylordleSwiftAction =
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

function genRounds(rng: () => number): TaylordleSwiftRound[] {
  const out: TaylordleSwiftRound[] = [];
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

export function initialState(seed: number, _s: TaylordleSwiftSettings): TaylordleSwiftState {
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

export function reducer(state: TaylordleSwiftState, action: TaylordleSwiftAction): TaylordleSwiftState {
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

export function isTerminal(state: TaylordleSwiftState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
