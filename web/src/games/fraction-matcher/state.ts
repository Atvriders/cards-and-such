import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FractionMatcherSettings {
  rounds: "10" | "20" | "30";
  mode: "decimal" | "equivalent" | "mixed";
}

export interface FractionQuestion {
  numerator: number;
  denominator: number;
  choices: string[];
  correctIndex: number;
  type: "decimal" | "equivalent";
}

export interface FractionMatcherState {
  settings: FractionMatcherSettings;
  questions: FractionQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type FractionMatcherAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

// Simple fractions with clean decimals or equivalents
const FRACTION_POOL: Array<[number, number]> = [
  [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5],
  [1, 6], [5, 6], [1, 8], [3, 8], [5, 8], [7, 8], [1, 10], [3, 10], [7, 10],
  [9, 10], [1, 12], [5, 12], [7, 12], [11, 12], [2, 4], [4, 8], [2, 6],
  [3, 6], [4, 6], [2, 8], [6, 8], [4, 10], [6, 10], [8, 10], [2, 10],
];

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplify(n: number, d: number): [number, number] {
  const g = gcd(Math.abs(n), Math.abs(d));
  return [n / g, d / g];
}

function fracToDecimal(n: number, d: number): string {
  const val = n / d;
  // Round to 4 decimal places, strip trailing zeros
  return parseFloat(val.toFixed(4)).toString();
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function genDecimalQuestion(n: number, d: number, rng: () => number): FractionQuestion {
  const correct = fracToDecimal(n, d);
  // Generate 3 wrong decimal answers
  const wrongs = new Set<string>();
  const attempts = [
    fracToDecimal(n + 1, d),
    fracToDecimal(n, d + 1),
    fracToDecimal(n - 1 > 0 ? n - 1 : n + 2, d),
    fracToDecimal(n, d + 2),
    fracToDecimal(n + 2, d),
  ].filter(v => v !== correct);
  for (const w of attempts) {
    if (wrongs.size < 3) wrongs.add(w);
  }
  while (wrongs.size < 3) {
    const r = Math.floor(rng() * 9 + 1);
    const candidate = fracToDecimal(r, d + Math.floor(rng() * 3 + 1));
    if (candidate !== correct) wrongs.add(candidate);
  }
  const allChoices = [correct, ...Array.from(wrongs).slice(0, 3)];
  const shuffled = shuffle(allChoices, rng);
  return {
    numerator: n,
    denominator: d,
    choices: shuffled,
    correctIndex: shuffled.indexOf(correct),
    type: "decimal",
  };
}

function genEquivQuestion(n: number, d: number, rng: () => number): FractionQuestion {
  const [sn, sd] = simplify(n, d);
  // Make equivalent by multiplying by 2 or 3
  const mult = 2 + Math.floor(rng() * 2);
  const correct = `${sn * mult}/${sd * mult}`;
  const wrongs: string[] = [];
  const cands = [
    `${sn + 1}/${sd}`,
    `${sn}/${sd + 1}`,
    `${sn * mult + 1}/${sd * mult}`,
    `${sn * mult}/${sd * mult + 1}`,
    `${sn + 1}/${sd * mult}`,
  ].filter(v => {
    const [cn, cd] = v.split("/").map(Number);
    const [csn, csd] = simplify(cn!, cd!);
    return !(csn === sn && csd === sd) && v !== correct;
  });
  for (const c of cands) {
    if (wrongs.length < 3) wrongs.push(c);
  }
  while (wrongs.length < 3) {
    wrongs.push(`${sn + wrongs.length + 1}/${sd + 1}`);
  }
  const allChoices = [correct, ...wrongs.slice(0, 3)];
  const shuffled = shuffle(allChoices, rng);
  return {
    numerator: n,
    denominator: d,
    choices: shuffled,
    correctIndex: shuffled.indexOf(correct),
    type: "equivalent",
  };
}

export function initialState(seed: number, settings: FractionMatcherSettings): FractionMatcherState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.rounds, 10);
  const poolShuffled = shuffle([...FRACTION_POOL], rng);
  const questions: FractionQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const [n, d] = poolShuffled[i % poolShuffled.length]!;
    const useDecimal =
      settings.mode === "decimal" ? true :
      settings.mode === "equivalent" ? false :
      rng() < 0.5;
    const q = useDecimal
      ? genDecimalQuestion(n, d, rng)
      : genEquivQuestion(n, d, rng);
    questions.push(q);
  }

  return {
    settings,
    questions,
    currentIndex: 0,
    selected: null,
    submitted: false,
    score: 0,
    correctCount: 0,
    phase: "playing",
  };
}

export function reducer(state: FractionMatcherState, action: FractionMatcherAction): FractionMatcherState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "select":
      if (state.submitted) return state;
      return { ...state, selected: action.index };

    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const correct = state.selected === q.correctIndex;
      return {
        ...state,
        submitted: true,
        score: correct ? state.score + 10 : state.score,
        correctCount: correct ? state.correctCount + 1 : state.correctCount,
      };
    }

    case "next": {
      if (!state.submitted) return state;
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, phase: "done" };
      }
      return { ...state, currentIndex: nextIndex, selected: null, submitted: false };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FractionMatcherState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
