import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Roman Numerals Mini: 20 rounds. Show a Roman numeral; pick the integer value from 4 choices.

export const TOTAL_ROUNDS = 20;

export interface RomanNumeralsMiniSettings { dummy: boolean; }

export interface RomanRound {
  roman: string;
  value: number;
  choices: [number, number, number, number];
  correct: 0 | 1 | 2 | 3;
}

export interface RomanNumeralsMiniState {
  rounds: RomanRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type RomanNumeralsMiniAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

export function toRoman(num: number): string {
  const map: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let n = num;
  let out = "";
  for (const [v, s] of map) {
    while (n >= v) { out += s; n -= v; }
  }
  return out;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function genRounds(rng: () => number): RomanRound[] {
  const out: RomanRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const value = 1 + Math.floor(rng() * 100); // 1..100
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const delta = (Math.floor(rng() * 20) - 10) || 11;
      const w = value + delta;
      if (w !== value && w >= 1 && w <= 200) wrongs.add(w);
    }
    const choices = shuffle([value, ...wrongs], rng);
    const correctIdx = choices.indexOf(value) as 0 | 1 | 2 | 3;
    out.push({ roman: toRoman(value), value, choices: choices as [number, number, number, number], correct: correctIdx });
  }
  return out;
}

export function initialState(seed: number, _s: RomanNumeralsMiniSettings): RomanNumeralsMiniState {
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

export function reducer(state: RomanNumeralsMiniState, action: RomanNumeralsMiniAction): RomanNumeralsMiniState {
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

export function isTerminal(state: RomanNumeralsMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
