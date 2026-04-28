import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TuringMachinePuzzleSettings { questions: "10"; }
export interface TuringMachinePuzzleState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type TuringMachinePuzzleAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "How long is the code in Turing Machine?",
    "choices": [
      "2 digits",
      "3 digits",
      "4 digits",
      "5 digits"
    ],
    "correct": 1
  },
  {
    "question": "Each digit is from?",
    "choices": [
      "1-5",
      "1-9",
      "0-9",
      "1-3"
    ],
    "correct": 0
  },
  {
    "question": "Verifier cards encode…",
    "choices": [
      "Color rules",
      "Comparison/property rules",
      "Random text",
      "Names"
    ],
    "correct": 1
  },
  {
    "question": "Range of verifier count per puzzle?",
    "choices": [
      "1-2",
      "2-3",
      "4-6",
      "10+"
    ],
    "correct": 2
  },
  {
    "question": "What do verifiers tell you when checked?",
    "choices": [
      "Yes / no the digit-code passes the rule",
      "The exact code",
      "Nothing",
      "Random number"
    ],
    "correct": 0
  },
  {
    "question": "Game has any luck element?",
    "choices": [
      "Yes",
      "No — pure logic",
      "Sometimes",
      "Roll-based"
    ],
    "correct": 1
  },
  {
    "question": "Best efficient strategy?",
    "choices": [
      "Random guesses",
      "Maximum-info-distinguishing guesses",
      "Confirm obvious",
      "Skip verifiers"
    ],
    "correct": 1
  },
  {
    "question": "Punch cards hide…",
    "choices": [
      "The exact rule, exposing only yes/no per check",
      "Numbers",
      "Nothing",
      "Names"
    ],
    "correct": 0
  },
  {
    "question": "How is the answer revealed?",
    "choices": [
      "Player declares with no verifier check",
      "After all checks",
      "By moderator",
      "Auto"
    ],
    "correct": 0
  },
  {
    "question": "Misreading a verifier means…",
    "choices": [
      "You may reach contradiction",
      "Auto-loss",
      "Skip",
      "Bonus"
    ],
    "correct": 0
  },
  {
    "question": "Hardest puzzles use how many verifiers?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 3
  },
  {
    "question": "Designer team includes?",
    "choices": [
      "Yoann Levet",
      "Reiner Knizia",
      "Stefan Feld",
      "Vlaada Chvátil"
    ],
    "correct": 0
  }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: TuringMachinePuzzleSettings): TuringMachinePuzzleState {
  const rng = mulberry32(seed);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, 10);
  const questions = pool.map(q => {
    const idx = q.choices.map((c, i) => ({ c, i }));
    const s = shuffle(idx, rng);
    const newCorrect = s.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: s.map(x => x.c) as [string, string, string, string], correct: newCorrect };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: TuringMachinePuzzleState, action: TuringMachinePuzzleAction): TuringMachinePuzzleState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select":
      return state.submitted ? state : { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const ok = state.selected === q.correct;
      return {
        ...state,
        submitted: true,
        score: state.score + (ok ? 100 : 0),
        correctCount: state.correctCount + (ok ? 1 : 0),
        phase: "result",
      };
    }
    case "next": {
      const ni = state.currentIndex + 1;
      return ni >= state.questions.length
        ? { ...state, phase: "done" }
        : { ...state, currentIndex: ni, selected: null, submitted: false, phase: "playing" };
    }
    default:
      return state;
  }
}

export function isTerminal(state: TuringMachinePuzzleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
