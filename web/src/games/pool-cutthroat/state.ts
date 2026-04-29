import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Cutthroat players", choices: ["3 typically","2","4","5"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Each player owns", choices: ["Ball group of 5","Single ball","All balls","Pocket"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Group A balls", choices: ["1-5","9-15","8-15","All"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Group B balls", choices: ["6-10","1-7","9-15","8-15"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Group C balls", choices: ["11-15","1-5","8-15","1-7"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Pocket opponents balls", choices: ["Score / eliminate them","Foul","Skip","Bonus self"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Pocket own ball", choices: ["Foul (some) / risky","Bonus","Win","Skip"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Last group with balls", choices: ["Wins","Loses","Ties","Restart"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Scratch on cue", choices: ["Each opponent gets ball back","You win","Skip","Bonus"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Strategy", choices: ["Sink opponents balls","Sink own","Bank only","Skip turn"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
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
