import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Score 301, need to take a bite — first dart aims?", choices: ["Triple 20","Double 20","Bullseye","Single 19"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Need 161 with three darts left", choices: ["T20-T17-D25","T20-T20-D20","T20-D20-D20","T17-T17-D25"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Score 170 — checkout?", choices: ["T20-T20-Bull","T20-T19-Bull","T19-T19-Bull","T20-D25-Bull"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Score 100 — single-dart finish?", choices: ["Bullseye doesn't finish 100","T20-D20","T16-D26 invalid","S20-D20-D20"] as [string,string,string,string], correctIndex: 1 as 0|1|2|3 },
  { prompt: "Score 75 — best two-dart finish?", choices: ["T17-D12","S15-D30 invalid","T15-D15","T19-D9"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Score 50 — single dart?", choices: ["Bullseye (50)","Double 20","Triple 16+2","Single 25+25"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Score 40 — single dart?", choices: ["Double 20","Single 40 invalid","Triple 13+1","Bull"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Score 32 — single dart?", choices: ["Double 16","Triple 10+2","Single 32 invalid","Bull"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Score 1 left — finish how?", choices: ["Cannot finish on 1","Single 1","Double 0.5","Bull"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Bust rule — score 5 hit triple 20", choices: ["Bust, return to 5","Continue from -55","Win","Take next dart"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
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
