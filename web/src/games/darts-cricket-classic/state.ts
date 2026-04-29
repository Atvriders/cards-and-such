import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Cricket numbers are", choices: ["15-20 + bull","1-20","10-20","Just bull"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Open a number with how many marks", choices: ["3 marks","2 marks","1 mark","5 marks"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Triple counts as how many marks", choices: ["3 marks","1 mark","2 marks","0 marks"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Best opening dart", choices: ["Triple 20","Single 1","Single 5","Double 5"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "After opening 20, opponent open — points?", choices: ["No points","20 pts","Triple","Double"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "After opening 20, opponent NOT open — points?", choices: ["20 per single","0","1 per dart","Lose marks"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Bullseye double counts", choices: ["2 marks","1 mark","3 marks","5 marks"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Closed when both players have", choices: ["3 marks each","1 mark","5 marks","Triple"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Win condition cricket", choices: ["Close all + lead/tie","Reach 0","Hit triple-20","Score 100"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Best target if behind on points", choices: ["Triple 20 to score","Single 15","Bull","Aim wide"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
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
