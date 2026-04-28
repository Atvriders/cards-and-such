import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface InsiderQuizSettings { questions: "10"; }
export interface InsiderQuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type InsiderQuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Three role types in Insider?",
    "choices": [
      "Master / Insider / Commoners",
      "Wolves / Villagers / Seer",
      "Spy / Resistance / Cop",
      "Killer / Doctor / Detective"
    ],
    "correct": 0
  },
  {
    "question": "Master's role?",
    "choices": [
      "Knows word, answers yes/no",
      "Lies",
      "Insider's helper",
      "Random"
    ],
    "correct": 0
  },
  {
    "question": "Insider's role?",
    "choices": [
      "Knows word, asks subtle guiding questions",
      "Knows nothing",
      "Decoy",
      "Voter"
    ],
    "correct": 0
  },
  {
    "question": "Commoners' role?",
    "choices": [
      "Try to guess via questions",
      "Lie",
      "Vote",
      "Skip"
    ],
    "correct": 0
  },
  {
    "question": "Time pressure typically?",
    "choices": [
      "5 minutes for guess phase",
      "Untimed",
      "1 hour",
      "30 seconds"
    ],
    "correct": 0
  },
  {
    "question": "Voting phase?",
    "choices": [
      "Identify the Insider after word is guessed",
      "Identify Master",
      "Identify Commoner",
      "Random"
    ],
    "correct": 0
  },
  {
    "question": "Insider strategy?",
    "choices": [
      "Guide subtly without standing out",
      "Guess directly",
      "Stay silent",
      "Lie always"
    ],
    "correct": 0
  },
  {
    "question": "Master strategy?",
    "choices": [
      "Answer truthfully and pace fairly",
      "Lie",
      "Help Insider",
      "Random"
    ],
    "correct": 0
  },
  {
    "question": "Designer?",
    "choices": [
      "Tomoyuki Hayashi",
      "Klaus Teuber",
      "Sid Sackson",
      "Donald X."
    ],
    "correct": 0
  },
  {
    "question": "Game ends when?",
    "choices": [
      "Word is guessed AND vote held, or time runs out",
      "Random",
      "Vote only",
      "Roll"
    ],
    "correct": 0
  },
  {
    "question": "Best Commoner heuristic?",
    "choices": [
      "Track who asks pointed questions late",
      "Random",
      "Vote first",
      "Trust no one"
    ],
    "correct": 0
  },
  {
    "question": "Insider category?",
    "choices": [
      "Hidden-role + 20 Questions",
      "Trick-taker",
      "Auction",
      "Roll-and-write"
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

export function initialState(seed: number, _settings: InsiderQuizSettings): InsiderQuizState {
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

export function reducer(state: InsiderQuizState, action: InsiderQuizAction): InsiderQuizState {
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

export function isTerminal(state: InsiderQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
