import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 15;

export interface SpoonsGrabSettings { dummy: boolean; }


export interface SpoonsGrabRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface SpoonsGrabState {
  rounds: SpoonsGrabRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type SpoonsGrabAction =
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

function genRounds(rng: () => number): SpoonsGrabRound[] {
  const out: SpoonsGrabRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const ranks = ["A","K","Q","J","10","9","8","7"];
    const winnerRank = ranks[Math.floor(rng() * ranks.length)]!;
    const winner = "[" + winnerRank + "," + winnerRank + "," + winnerRank + "," + winnerRank + "]";
    const wrongs = new Set<string>();
    let tries = 0;
    while (wrongs.size < 3 && tries < 60) {
      tries++;
      const a = ranks[Math.floor(rng() * ranks.length)]!;
      const b = ranks[Math.floor(rng() * ranks.length)]!;
      if (a !== b) wrongs.add("[" + a + "," + a + "," + a + "," + b + "]");
    }
    while (wrongs.size < 3) wrongs.add("[X" + wrongs.size + "]");
    const choices = shuffle([winner, ...wrongs], rng);
    const correctIdx = choices.indexOf(winner) as 0 | 1 | 2 | 3;
    out.push({
      question: "Spot the four-of-a-kind hand!",
      choices: choices as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: SpoonsGrabSettings): SpoonsGrabState {
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

export function reducer(state: SpoonsGrabState, action: SpoonsGrabAction): SpoonsGrabState {
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

export function isTerminal(state: SpoonsGrabState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
