import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 15;

export interface SpotItSplashSettings { dummy: boolean; }

const POOL: string[] = ["Crab","Starfish","Seashell","Wave","Beach Ball","Sandcastle","Sailboat","Surfboard","Sunscreen","Goggles","Snorkel","Flipper","Dolphin","Octopus","Jellyfish","Coral","Seaweed","Sand"];
const PROMPT = "Which symbol is shared between both beach cards?";

export interface SpotItSplashRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface SpotItSplashState {
  rounds: SpotItSplashRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type SpotItSplashAction =
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

function genRounds(rng: () => number): SpotItSplashRound[] {
  const out: SpotItSplashRound[] = [];
  while (out.length < TOTAL_ROUNDS) {
    const correctAns = POOL[Math.floor(rng() * POOL.length)]!;
    const wrongs: string[] = [];
    const seen = new Set<string>([correctAns]);
    let tries = 0;
    while (wrongs.length < 3 && tries < 80) {
      tries++;
      const w = POOL[Math.floor(rng() * POOL.length)]!;
      if (!seen.has(w)) { wrongs.push(w); seen.add(w); }
    }
    if (wrongs.length < 3) continue;
    const choices = shuffle([correctAns, ...wrongs], rng);
    const correctIdx = choices.indexOf(correctAns) as 0 | 1 | 2 | 3;
    out.push({
      question: PROMPT + " " + correctAns,
      choices: choices as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: SpotItSplashSettings): SpotItSplashState {
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

export function reducer(state: SpotItSplashState, action: SpotItSplashAction): SpotItSplashState {
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

export function isTerminal(state: SpotItSplashState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
