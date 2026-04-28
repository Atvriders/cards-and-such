import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LingoDeductionSettings { questions: "10"; }
export interface LingoDeductionState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type LingoDeductionAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Standard Lingo word length?",
    "choices": [
      "4",
      "5",
      "6",
      "7"
    ],
    "correct": 1
  },
  {
    "question": "First letter is given to help solve?",
    "choices": [
      "Yes (TV version)",
      "No",
      "Sometimes",
      "Only round 5"
    ],
    "correct": 0
  },
  {
    "question": "Yellow indicator means?",
    "choices": [
      "Right letter, right place",
      "Right letter, wrong place",
      "Not in word",
      "Special"
    ],
    "correct": 0
  },
  {
    "question": "Red indicator means?",
    "choices": [
      "Right letter, wrong place",
      "Right letter, right place",
      "Not in word",
      "Bonus"
    ],
    "correct": 0
  },
  {
    "question": "Best opening word strategy?",
    "choices": [
      "Saturate vowels and common consonants",
      "Random",
      "Plurals only",
      "Repeat letters"
    ],
    "correct": 0
  },
  {
    "question": "Wordle differs in?",
    "choices": [
      "No first-letter hint by default",
      "More guesses",
      "Letters appear randomly",
      "All of the above"
    ],
    "correct": 0
  },
  {
    "question": "Lingo first aired in which decade?",
    "choices": [
      "1970s",
      "1980s",
      "1990s",
      "2000s"
    ],
    "correct": 1
  },
  {
    "question": "Avoiding repeated eliminated letters is…",
    "choices": [
      "Optimal",
      "Forbidden",
      "Penalty",
      "Random"
    ],
    "correct": 0
  },
  {
    "question": "Information theory's optimal guess one?",
    "choices": [
      "SLATE-class words",
      "AAAAA",
      "QQQQQ",
      "EEEEE"
    ],
    "correct": 0
  },
  {
    "question": "Game ends when…",
    "choices": [
      "Word guessed correctly or guesses exhausted",
      "Time only",
      "Vote",
      "Random"
    ],
    "correct": 0
  },
  {
    "question": "Bonus round in Lingo TV format includes…",
    "choices": [
      "Bingo balls",
      "Skull",
      "Gold",
      "Cards"
    ],
    "correct": 0
  },
  {
    "question": "Lingo combines word puzzle and?",
    "choices": [
      "Bingo elements",
      "Math",
      "Trivia",
      "Music"
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

export function initialState(seed: number, _settings: LingoDeductionSettings): LingoDeductionState {
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

export function reducer(state: LingoDeductionState, action: LingoDeductionAction): LingoDeductionState {
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

export function isTerminal(state: LingoDeductionState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
