import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;

export interface SpotItClassicSettings { dummy: boolean; }

export const SYMBOLS: string[] = ["star","spade","club","heart","diamond","circle","triangle","square","gem","flower","cross","umbrella","clover","sun","cloud","moon"];

export interface SpotItClassicRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface SpotItClassicState {
  rounds: SpotItClassicRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type SpotItClassicAction =
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

function genRounds(rng: () => number): SpotItClassicRound[] {
  const out: SpotItClassicRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const shared = SYMBOLS[Math.floor(rng() * SYMBOLS.length)]!;
    const used = new Set<string>([shared]);
    const pickN = (n: number): string[] => {
      const arr: string[] = [];
      let tries = 0;
      while (arr.length < n && tries < 60) {
        tries++;
        const s = SYMBOLS[Math.floor(rng() * SYMBOLS.length)]!;
        if (!used.has(s)) { arr.push(s); used.add(s); }
      }
      return arr;
    };
    const cardA = shuffle([shared, ...pickN(2)], rng).join(" ");
    const cardB = shuffle([shared, ...pickN(2)], rng).join(" ");
    const wrongs = pickN(3);
    while (wrongs.length < 3) wrongs.push(SYMBOLS[Math.floor(rng() * SYMBOLS.length)]!);
    const choices = shuffle([shared, ...wrongs], rng);
    const correctIdx = choices.indexOf(shared) as 0 | 1 | 2 | 3;
    out.push({
      question: "Cards [" + cardA + "] vs [" + cardB + "] - shared symbol?",
      choices: choices as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: SpotItClassicSettings): SpotItClassicState {
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

export function reducer(state: SpotItClassicState, action: SpotItClassicAction): SpotItClassicState {
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

export function isTerminal(state: SpotItClassicState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
