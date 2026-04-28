import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; answer: string; distractors: string[]; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Equation that equals 10", answer: "5+5=10", distractors: ["5+5=11","5+4=10","6+5=10"] },
  { prompt: "Equation that equals 20", answer: "4*5=20", distractors: ["4*4=20","4+5=20","3*5=20"] },
  { prompt: "Equation that equals 7", answer: "12-5=7", distractors: ["12-6=7","11-5=7","12-5=8"] },
  { prompt: "Equation that equals 9", answer: "3*3=9", distractors: ["2*3=9","3*3=8","4*2=9"] },
  { prompt: "Equation that equals 6", answer: "2+4=6", distractors: ["2+3=6","2+4=7","3+4=6"] },
  { prompt: "Equation that equals 12", answer: "6*2=12", distractors: ["5*2=12","6*3=12","6+2=12"] },
  { prompt: "Equation that equals 8", answer: "16/2=8", distractors: ["14/2=8","18/2=8","16/4=8"] },
  { prompt: "Equation that equals 25", answer: "5*5=25", distractors: ["4*5=25","5+5=25","6*4=25"] },
  { prompt: "Equation that equals 100", answer: "10*10=100", distractors: ["10+10=100","9*11=100","11*10=100"] },
  { prompt: "Equation that equals 0", answer: "5-5=0", distractors: ["4-5=0","5+0=0","5*0=5"] },
];

export interface NerdleEquationSettings { rounds: "5" | "8" | "10"; }

export interface PuzzleRound {
  prompt: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface NerdleEquationState {
  rounds: PuzzleRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type NerdleEquationAction =
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

export function initialState(seed: number, settings: NerdleEquationSettings): NerdleEquationState {
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

export function reducer(state: NerdleEquationState, action: NerdleEquationAction): NerdleEquationState {
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

export function isTerminal(state: NerdleEquationState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
