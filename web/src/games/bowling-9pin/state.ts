import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "9-pin total pins", choices: ["9","10","8","12"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Center pin called", choices: ["Kingpin","Headpin","Twelve","Spotted"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Strike value", choices: ["12 (or 9)","10","Bonus + next two","9"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Frames per game", choices: ["8 frames typical","10","12","5"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Just kingpin = ", choices: ["12 points","9","5","1"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "All 9 pins down = ", choices: ["9 points","10","Strike+bonus","12"] as [string,string,string,string], correctIndex: 1 as 0|1|2|3 },
  { prompt: "Ball rolls per frame", choices: ["Up to 2","1","3","Unlimited"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Spare meaning", choices: ["All down in two","Strike","Half","Skip"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Tie break frame", choices: ["Sudden death","Skip","Restart","Average"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Pin formation", choices: ["Diamond pattern","Triangle","Square","Line"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
];

export interface GameSettings { rounds: "5" | "8" | "10"; }

export interface PuzzleRound {
  prompt: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface GameState {
  rounds: PuzzleRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type GameAction =
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

export function initialState(seed: number, settings: GameSettings): GameState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.rounds, 10);
  const pool = shuffle([...PUZZLES], rng).slice(0, Math.min(count, PUZZLES.length));
  const rounds: PuzzleRound[] = pool.map(p => ({
    prompt: p.prompt,
    choices: [...p.choices] as [string, string, string, string],
    correct: p.correctIndex,
  }));
  return { rounds, currentIndex: 0, selected: null, submitted: false, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: GameState, action: GameAction): GameState {
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

export function isTerminal(state: GameState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
