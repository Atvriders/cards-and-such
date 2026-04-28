import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; answer: string; distractors: string[]; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Longest from D, R, E, A, M", answer: "DREAM", distractors: ["DEAR","READ","DARE"] },
  { prompt: "Longest from L, I, S, T, E, N", answer: "LISTEN", distractors: ["TINSEL","SILENT","TENS"] },
  { prompt: "Longest from F, R, I, E, N, D", answer: "FRIEND", distractors: ["FINDER","FIRED","FRIED"] },
  { prompt: "Longest from S, P, R, I, N, G", answer: "SPRING", distractors: ["RINGS","GRINS","RIPENS"] },
  { prompt: "Longest from B, R, I, G, H, T", answer: "BRIGHT", distractors: ["RIGHT","GRIT","BIRTH"] },
  { prompt: "Longest from S, P, A, C, E", answer: "SPACE", distractors: ["CAPS","PACE","CAPE"] },
  { prompt: "Longest from S, T, E, A, M", answer: "STEAM", distractors: ["MATES","TEAMS","MEATS"] },
  { prompt: "Longest from C, A, R, P, E, T", answer: "CARPET", distractors: ["CARTE","CRATE","TRACE"] },
  { prompt: "Longest from G, R, A, P, E", answer: "GRAPE", distractors: ["PAGER","GAPE","PEAR"] },
  { prompt: "Longest from B, A, K, E, R", answer: "BAKER", distractors: ["BEAR","BRAKE","KERB"] },
];

export interface RuzzleMiniSettings { rounds: "5" | "8" | "10"; }

export interface PuzzleRound {
  prompt: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface RuzzleMiniState {
  rounds: PuzzleRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type RuzzleMiniAction =
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

export function initialState(seed: number, settings: RuzzleMiniSettings): RuzzleMiniState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.rounds, 10);
  const pool = shuffle([...PUZZLES], rng).slice(0, Math.min(count, PUZZLES.length));
  const rounds: PuzzleRound[] = pool.map(p => {
    const all = [p.answer, ...p.distractors.slice(0, 3)];
    while (all.length < 4) all.push(p.answer + "_");
    const shuffled = shuffle(all.slice(0, 4), rng);
    const correct = shuffled.indexOf(p.answer) as 0 | 1 | 2 | 3;
    return {
      prompt: p.prompt,
      choices: [shuffled[0]!, shuffled[1]!, shuffled[2]!, shuffled[3]!],
      correct: correct >= 0 ? correct : 0,
    };
  });
  return { rounds, currentIndex: 0, selected: null, submitted: false, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: RuzzleMiniState, action: RuzzleMiniAction): RuzzleMiniState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select":
      return state.submitted ? state : { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const r = state.rounds[state.currentIndex]!;
      const ok = state.selected === r.correct;
      const pts = ok ? 100 : 0;
      return { ...state, submitted: true, score: state.score + pts, correctCount: state.correctCount + (ok ? 1 : 0), phase: "result" };
    }
    case "next": {
      const ni = state.currentIndex + 1;
      return ni >= state.rounds.length ? { ...state, phase: "done" } : { ...state, currentIndex: ni, selected: null, submitted: false, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: RuzzleMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
