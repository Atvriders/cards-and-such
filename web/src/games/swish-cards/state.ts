import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;

export interface SwishCardsSettings { dummy: boolean; }


export interface SwishCardsRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface SwishCardsState {
  rounds: SwishCardsRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type SwishCardsAction =
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

function genRounds(rng: () => number): SwishCardsRound[] {
  const out: SwishCardsRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const targetX = Math.floor(rng() * 4);
    const targetY = Math.floor(rng() * 4);
    const correctOverlay = "(" + targetX + "," + targetY + ")";
    const choicesSet = new Set<string>([correctOverlay]);
    let tries = 0;
    while (choicesSet.size < 4 && tries < 60) {
      tries++;
      const x = Math.floor(rng() * 4);
      const y = Math.floor(rng() * 4);
      choicesSet.add("(" + x + "," + y + ")");
    }
    while (choicesSet.size < 4) choicesSet.add("(?," + choicesSet.size + ")");
    const arr = shuffle([...choicesSet], rng).slice(0, 4);
    if (!arr.includes(correctOverlay)) arr[0] = correctOverlay;
    const correctIdx = arr.indexOf(correctOverlay) as 0 | 1 | 2 | 3;
    out.push({
      question: "Circle at " + correctOverlay + " - pick aligning overlay.",
      choices: arr as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: SwishCardsSettings): SwishCardsState {
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

export function reducer(state: SwishCardsState, action: SwishCardsAction): SwishCardsState {
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

export function isTerminal(state: SwishCardsState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
