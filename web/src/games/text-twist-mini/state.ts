import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; answer: string; distractors: string[]; }

export const PUZZLES: Puzzle[] = [
  { prompt: "TLEAB", answer: "TABLE", distractors: ["BLEAT","BATEL","BLATE"] },
  { prompt: "EPLAS", answer: "PLEAS", distractors: ["SEPAL","LEAPS","PALES"] },
  { prompt: "ROEM", answer: "MORE", distractors: ["ROEM","REOM","OREM"] },
  { prompt: "EVOL", answer: "LOVE", distractors: ["VOLE","OVAL","OVEL"] },
  { prompt: "MTSY", answer: "MYTS", distractors: ["TYMS","STYM","MYTS"] },
  { prompt: "RPRA", answer: "PARP", distractors: ["RARP","PRAR","RAPP"] },
  { prompt: "GLOO", answer: "LOGO", distractors: ["GOLO","LOGG","LGOO"] },
  { prompt: "TENS", answer: "NETS", distractors: ["TENS","SENT","STEN"] },
  { prompt: "LEEPSC", answer: "SLEEPC", distractors: ["SCEEPL","CEEPLS","ELSEPC"] },
  { prompt: "RAGE", answer: "GEAR", distractors: ["AGER","RAEG","ERAG"] },
];

export interface TextTwistMiniSettings { rounds: "5" | "8" | "10"; }

export interface PuzzleRound {
  prompt: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface TextTwistMiniState {
  rounds: PuzzleRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type TextTwistMiniAction =
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

export function initialState(seed: number, settings: TextTwistMiniSettings): TextTwistMiniState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.rounds, 10);
  const pool = shuffle([...PUZZLES], rng).slice(0, Math.min(count, PUZZLES.length));
  const rounds: PuzzleRound[] = pool.map(p => {
    const all = [p.answer, ...p.distractors.slice(0, 3)];
    while (all.length < 4) all.push(p.answer + "_");
    const shuffled = shuffle(all.slice(0, 4), rng);
    const correct = shuffled.indexOf(p.answer) as 0 | 1 | 2 | 3;
    return {
      prompt: p.prompt,
      choices: [shuffled[0]!, shuffled[1]!, shuffled[2]!, shuffled[3]!],
      correct: correct >= 0 ? correct : 0,
    };
  });
  return { rounds, currentIndex: 0, selected: null, submitted: false, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: TextTwistMiniState, action: TextTwistMiniAction): TextTwistMiniState {
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

export function isTerminal(state: TextTwistMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
