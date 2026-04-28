import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Code777MiniSettings { questions: "10"; }
export interface Code777MiniState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type Code777MiniAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Designer of Code 777?",
    "choices": [
      "Robert Abbott",
      "Reiner Knizia",
      "Sid Sackson",
      "Wolfgang Kramer"
    ],
    "correct": 0
  },
  {
    "question": "Each player wears how many tiles?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  },
  {
    "question": "Tiles face…",
    "choices": [
      "Toward you",
      "Outward",
      "Down",
      "Random"
    ],
    "correct": 1
  },
  {
    "question": "Clue cards typically state…",
    "choices": [
      "Public partial-information statements",
      "Names",
      "Roles",
      "Numbers only"
    ],
    "correct": 0
  },
  {
    "question": "Players see…",
    "choices": [
      "Their own tiles",
      "Everyone else's tiles",
      "Clue cards only",
      "Nothing"
    ],
    "correct": 1
  },
  {
    "question": "Key skill?",
    "choices": [
      "Logical bookkeeping",
      "Bluffing",
      "Speed",
      "Counting cards"
    ],
    "correct": 0
  },
  {
    "question": "Year first published?",
    "choices": [
      "1985",
      "1995",
      "2005",
      "1970"
    ],
    "correct": 0
  },
  {
    "question": "Common mistake?",
    "choices": [
      "Forgetting clues include other players' hidden tiles",
      "Speaking",
      "Counting",
      "Skipping"
    ],
    "correct": 0
  },
  {
    "question": "Clue distribution mechanism?",
    "choices": [
      "Public reveal",
      "Private read",
      "Vote",
      "Random"
    ],
    "correct": 0
  },
  {
    "question": "Game category?",
    "choices": [
      "Pure deduction",
      "Bluff",
      "Trick-taker",
      "Roll-and-write"
    ],
    "correct": 0
  },
  {
    "question": "Player count?",
    "choices": [
      "3-7",
      "Solo",
      "2",
      "12"
    ],
    "correct": 0
  },
  {
    "question": "Best bookkeeping practice?",
    "choices": [
      "Track every clue against current hypothesis",
      "Random notes",
      "None",
      "Memorize"
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

export function initialState(seed: number, _settings: Code777MiniSettings): Code777MiniState {
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

export function reducer(state: Code777MiniState, action: Code777MiniAction): Code777MiniState {
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

export function isTerminal(state: Code777MiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
