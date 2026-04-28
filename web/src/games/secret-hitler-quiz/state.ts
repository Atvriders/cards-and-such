import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SecretHitlerQuizSettings { questions: "10"; }
export interface SecretHitlerQuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type SecretHitlerQuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Total Liberal policies needed to win?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 2
  },
  {
    "question": "Total Fascist policies for Fascists to win?",
    "choices": [
      "5",
      "6",
      "7",
      "8"
    ],
    "correct": 1
  },
  {
    "question": "After how many Fascist policies can electing Hitler as Chancellor end the game?",
    "choices": [
      "1",
      "2",
      "3",
      "5"
    ],
    "correct": 2
  },
  {
    "question": "Policy deck composition?",
    "choices": [
      "6L / 11F",
      "8L / 11F",
      "5L / 10F",
      "7L / 12F"
    ],
    "correct": 0
  },
  {
    "question": "How many policies does the President draw?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 1
  },
  {
    "question": "How many does the Chancellor enact from?",
    "choices": [
      "1",
      "2",
      "3",
      "All"
    ],
    "correct": 1
  },
  {
    "question": "Veto power unlocks after how many Fascist policies?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 2
  },
  {
    "question": "Hitler in 5-6 player games knows…",
    "choices": [
      "Nothing",
      "Other Fascists",
      "Liberal count",
      "All roles"
    ],
    "correct": 1
  },
  {
    "question": "In 7-10 player games Hitler…",
    "choices": [
      "Knows other Fascists",
      "Doesn't know other Fascists",
      "Sees everyone",
      "Sees Liberals only"
    ],
    "correct": 1
  },
  {
    "question": "Best Liberal strategy when drawing 3?",
    "choices": [
      "Always discard Fascist",
      "Always discard Liberal",
      "Random",
      "Pass full info"
    ],
    "correct": 0
  },
  {
    "question": "5 government rejections in a row triggers…",
    "choices": [
      "Game over",
      "Top policy auto-enacts",
      "President swap",
      "Nothing"
    ],
    "correct": 1
  },
  {
    "question": "Which action is unlocked first chronologically (typical 7-player)?",
    "choices": [
      "Investigate",
      "Special Election",
      "Execution",
      "Peek"
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

export function initialState(seed: number, _settings: SecretHitlerQuizSettings): SecretHitlerQuizState {
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

export function reducer(state: SecretHitlerQuizState, action: SecretHitlerQuizAction): SecretHitlerQuizState {
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

export function isTerminal(state: SecretHitlerQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
