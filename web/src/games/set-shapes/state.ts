import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;

export interface SetShapesSettings { dummy: boolean; }


export interface SetShapesRound {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface SetShapesState {
  rounds: SetShapesRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type SetShapesAction =
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

function genRounds(rng: () => number): SetShapesRound[] {
  const out: SetShapesRound[] = [];
  function isSet(a: number[], b: number[], c: number[]): boolean {
    for (let k = 0; k < 3; k++) {
      const allSame = a[k] === b[k] && b[k] === c[k];
      const allDiff = a[k] !== b[k] && b[k] !== c[k] && a[k] !== c[k];
      if (!allSame && !allDiff) return false;
    }
    return true;
  }
  function makeCard(): [number, number, number] {
    return [Math.floor(rng() * 3), Math.floor(rng() * 3), Math.floor(rng() * 3)];
  }
  function makeValidSet(): [number[], number[], number[]] {
    const a = makeCard();
    const b = makeCard();
    const c: number[] = [];
    for (let k = 0; k < 3; k++) {
      c.push(a[k] === b[k] ? a[k]! : 3 - a[k]! - b[k]!);
    }
    return [a, b, c];
  }
  function describe(card: number[]): string {
    const colors = ["red","green","purple"];
    const shapes = ["circle","square","triangle"];
    return colors[card[0]!] + "-" + shapes[card[1]!] + "-x" + (card[2]! + 1);
  }
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const validSet = makeValidSet();
    const validStr = validSet.map(describe).join(" | ");
    const wrongs: string[] = [];
    let tries = 0;
    while (wrongs.length < 3 && tries < 200) {
      tries++;
      const a = makeCard();
      const b = makeCard();
      const c = makeCard();
      if (!isSet(a, b, c)) {
        const s = [a, b, c].map(describe).join(" | ");
        if (!wrongs.includes(s) && s !== validStr) wrongs.push(s);
      }
    }
    while (wrongs.length < 3) wrongs.push("invalid-" + wrongs.length);
    const choices = shuffle([validStr, ...wrongs], rng);
    const correctIdx = choices.indexOf(validStr) as 0 | 1 | 2 | 3;
    out.push({
      question: "Pick the SET-valid trio (all-same or all-different per attribute).",
      choices: choices as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: SetShapesSettings): SetShapesState {
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

export function reducer(state: SetShapesState, action: SetShapesAction): SetShapesState {
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

export function isTerminal(state: SetShapesState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
