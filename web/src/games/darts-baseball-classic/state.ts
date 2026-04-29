import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Innings target each round", choices: ["Number 1-9","Bull","20","Triple 20"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Single = ", choices: ["1 run","0 runs","2 runs","3 runs"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Double = ", choices: ["2 runs","1 run","3 runs","0 runs"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Triple = ", choices: ["3 runs","1 run","2 runs","0 runs"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Inning 1 best aim", choices: ["Triple 1 = 3 runs","Double 1","Single 1","Bull"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Inning 9 last — aim", choices: ["Triple 9","Single 9","Double 9","Bull"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Miss inning number", choices: ["0 runs","Negative","Half score","Bull bonus"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Best total possible per inning", choices: ["9 runs (3xT)","27","1","10"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Tie game extras inning", choices: ["Repeat round","End in tie","Bull-off","Restart"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Win condition", choices: ["Most runs after 9","First to 10","Reach 100","Close all"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
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
