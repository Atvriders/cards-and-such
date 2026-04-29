import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "10-ball: lowest first", choices: ["Yes","No","Skip","Random"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Call shot required?", choices: ["Yes (ball+pocket)","No","Only on 10","Only break"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Sink 10 on combination", choices: ["Foul (uncalled)","Win","Skip","Restart"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Cue ball foul", choices: ["Ball-in-hand","Win","Skip","Restart"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Break sinking 10 = ", choices: ["Re-spot","Win","Foul","Skip"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Slop shot allowed", choices: ["No (call shot)","Yes","Yes on 10","Sometimes"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Object ball first contact", choices: ["Lowest numbered","10","Cue","Any"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Push out rule", choices: ["First shot only","Never","Always","Bull only"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Win condition", choices: ["Pocket called 10","Pocket first","Score 100","Time"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Three fouls", choices: ["Loss of game","Ball-in-hand","Bonus","Reset"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
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
