import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Score 701 opening triple?", choices: ["Triple 20","Triple 19","Bullseye","Single 25"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Need 270 — best three-dart score?", choices: ["3xT20 = 180","T20-T19-T17","Bull-Bull-T20","T18-T19-T20"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Need 96 — checkout?", choices: ["T20-D18","T16-D24 invalid","T19-D19.5","Bull-Bull-D8"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Need 121 — best two-dart finish?", choices: ["T20-D30.5 invalid","T19-D32 invalid","T17-D35 invalid","T11-Bull"] as [string,string,string,string], correctIndex: 3 as 0|1|2|3 },
  { prompt: "Need 40 — checkout?", choices: ["Double 20","Single 40","Triple 13+1","Bull-D-5"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Need 170 — checkout?", choices: ["T20-T20-Bull","T20-T19-Bull","T17-T17-Bull","Bull-Bull-D35"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Bust strategy", choices: ["Stay above 2","Aim only triples","Aim only bulls","Hit doubles always"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Need 6 — best dart?", choices: ["Double 3","Single 6","Triple 2","Bull"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Need 2 — best dart?", choices: ["Double 1","Single 2","Triple 0","Bull"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Score below 0 means", choices: ["Bust, restore","Win","Continue","Skip turn"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
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
