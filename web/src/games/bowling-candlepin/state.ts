import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Candlepin pins shape", choices: ["Tall narrow cylinder","Bottle","Bowling pin","Cone"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Pins per frame", choices: ["10","9","8","12"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Balls per frame", choices: ["3 deliveries","2","1","Unlimited"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Ball size compared standard", choices: ["Smaller","Larger","Same","Hollow"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Deadwood (downed pins)", choices: ["Stay on lane","Cleared","Reset","Penalty"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Strike value", choices: ["10 + bonus","12","9","Pin count"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Spare value", choices: ["10 + bonus 1 ball","12","Skip","9"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Perfect game candlepin", choices: ["300 (rare/never)","200","150","100"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Lane length", choices: ["Standard 60ft","40ft","100ft","30ft"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Origin region", choices: ["New England","Texas","Florida","Hawaii"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
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
