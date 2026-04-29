import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Race target standard", choices: ["150 points","100","50","8 balls"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Each pocketed ball", choices: ["1 point","5","10","0"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Scratch penalty", choices: ["-1 point + ball-in-hand","Lose game","Skip","+1"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Last ball = ", choices: ["Break ball","Final","Bonus","Free"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Re-rack with how many", choices: ["14 balls","8","10","9"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Call shot?", choices: ["Yes","No","Sometimes","Only on 8"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Combination called", choices: ["First contact + pocket","Any","Cue ball pocket","Bank only"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Run-out high record", choices: ["526 (Mosconi)","100","1000","300"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Three consecutive fouls", choices: ["-15 penalty","Loss","Bonus","Skip"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Strategy goal", choices: ["Set up break ball","Pocket all fast","Bank shots","Sink 8"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
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
