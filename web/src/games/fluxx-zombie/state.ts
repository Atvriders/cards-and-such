import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;

export interface FluxxZombieSettings { dummy: boolean; }

const PAIRS: [string, string][] = [["Creeper","Schoolyard Zombies"],["Creeper","Backyard Zombies"],["Creeper","Office Zombies"],["Keeper","Gun"],["Keeper","Chainsaw"],["Keeper","Twinkies"],["Keeper","Cure"],["Goal","Headshots"],["Goal","Burn Them All"],["New Rule","Inflation"],["New Rule","No Hand Limit"],["Action","Empty the Trash"],["Action","Take Another Turn"],["Action","Use What You Take"],["Action","Trash a New Rule"]];

const PROMPT_PREFIX = "What card type is this Zombie Fluxx card?";

export interface FluxxZombieRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface FluxxZombieState {
  rounds: FluxxZombieRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type FluxxZombieAction =
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

function genRounds(rng: () => number): FluxxZombieRound[] {
  const out: FluxxZombieRound[] = [];
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

export function initialState(seed: number, _s: FluxxZombieSettings): FluxxZombieState {
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

export function reducer(state: FluxxZombieState, action: FluxxZombieAction): FluxxZombieState {
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

export function isTerminal(state: FluxxZombieState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
