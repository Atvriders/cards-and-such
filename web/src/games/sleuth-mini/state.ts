import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SleuthMiniSettings { questions: "10"; }
export interface SleuthMiniState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type SleuthMiniAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Designer of Sleuth?",
    "choices": [
      "Sid Sackson",
      "Reiner Knizia",
      "Klaus Teuber",
      "Donald X."
    ],
    "correct": 0
  },
  {
    "question": "Year first published?",
    "choices": [
      "1965",
      "1971",
      "1980",
      "1995"
    ],
    "correct": 1
  },
  {
    "question": "Gem cards have how many attributes?",
    "choices": [
      "1",
      "2",
      "3 (color, type, quantity)",
      "4"
    ],
    "correct": 2
  },
  {
    "question": "Goal of Sleuth?",
    "choices": [
      "Identify the missing gem",
      "Most cards",
      "Steal",
      "Score points"
    ],
    "correct": 0
  },
  {
    "question": "Question deck purpose?",
    "choices": [
      "Constrain queries",
      "Decoration",
      "Random",
      "Bonus"
    ],
    "correct": 0
  },
  {
    "question": "Best score-sheet practice?",
    "choices": [
      "Track answered queries by all players",
      "Track only own",
      "None",
      "Random"
    ],
    "correct": 0
  },
  {
    "question": "Sleuth's complexity?",
    "choices": [
      "Light",
      "Medium-deep deduction",
      "Heavy strategy",
      "Children's"
    ],
    "correct": 1
  },
  {
    "question": "Key skill in Sleuth?",
    "choices": [
      "Inferring opponents' info from their questions",
      "Bluffing",
      "Speed",
      "Counting tokens"
    ],
    "correct": 0
  },
  {
    "question": "Number of gem types per axis (typical)?",
    "choices": [
      "3 colors / 3 types / 3 quantities",
      "2/2/2",
      "5/5/5",
      "Random"
    ],
    "correct": 0
  },
  {
    "question": "Player count Sleuth supports?",
    "choices": [
      "3-7",
      "Solo",
      "2",
      "10+"
    ],
    "correct": 0
  },
  {
    "question": "Sleuth is in which category?",
    "choices": [
      "Pure deduction card game",
      "Wargame",
      "Trick taker",
      "Auction"
    ],
    "correct": 0
  },
  {
    "question": "Best opening question?",
    "choices": [
      "Broad attribute eliminator",
      "Specific gem guess",
      "Random",
      "Pass"
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

export function initialState(seed: number, _settings: SleuthMiniSettings): SleuthMiniState {
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

export function reducer(state: SleuthMiniState, action: SleuthMiniAction): SleuthMiniState {
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

export function isTerminal(state: SleuthMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
