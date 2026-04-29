import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Six-red red count", choices: ["6 reds","15","10","20"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Maximum break six-red", choices: ["75 (6×8 + 27)","147","100","50"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Frame target", choices: ["More points than opponent","100","Pot all reds","147"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "After red", choices: ["Must pot color","Free shot","Skip","Foul"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Color values", choices: ["Yellow=2, Black=7","All same","1 each","Increasing"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Foul awards opponent", choices: ["At least 4 (max 7)","1","5","0"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Best strategy", choices: ["Pot reds + black","Reds + blue","Reds only","Skip"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Free ball after foul", choices: ["Yes if snookered","Always","Never","Only on red"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Frame end condition", choices: ["No reds + final colors","Pot all","100 points","Time"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Black on respot", choices: ["Yes if needed","Never","Always","Skip"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
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
