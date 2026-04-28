import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; answer: string; distractors: string[]; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Best word from H,A,N,D,S", answer: "HANDS", distractors: ["HAS","HAD","AND"] },
  { prompt: "Best word from C,L,U,B,S", answer: "CLUBS", distractors: ["CUB","SUB","BUS"] },
  { prompt: "Best word from F,L,A,M,E", answer: "FLAME", distractors: ["FAME","LAME","MEAL"] },
  { prompt: "Best word from G,R,O,W,N", answer: "GROWN", distractors: ["WORN","RNG","NOR"] },
  { prompt: "Best word from S,H,A,R,K", answer: "SHARK", distractors: ["RASH","HARK","ARS"] },
  { prompt: "Best word from T,H,I,N,K", answer: "THINK", distractors: ["KNIT","HINT","TIN"] },
  { prompt: "Best word from B,O,A,T,S", answer: "BOATS", distractors: ["BOAT","OATS","TABS"] },
  { prompt: "Best word from C,R,A,N,E", answer: "CRANE", distractors: ["RACE","CANE","ACRE"] },
  { prompt: "Best word from S,T,O,R,M", answer: "STORM", distractors: ["MOST","ROT","TOR"] },
  { prompt: "Best word from G,L,O,V,E", answer: "GLOVE", distractors: ["GOVE","LOVE","OGLE"] },
];

export interface QuiddlerMiniSettings { rounds: "5" | "8" | "10"; }

export interface PuzzleRound {
  prompt: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface QuiddlerMiniState {
  rounds: PuzzleRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type QuiddlerMiniAction =
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

export function initialState(seed: number, settings: QuiddlerMiniSettings): QuiddlerMiniState {
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

export function reducer(state: QuiddlerMiniState, action: QuiddlerMiniAction): QuiddlerMiniState {
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

export function isTerminal(state: QuiddlerMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
