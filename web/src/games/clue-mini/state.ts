import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ClueMiniSettings { questions: "10"; }
export interface ClueMiniState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type ClueMiniAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Number of suspects in classic Clue?",
    "choices": [
      "4",
      "6",
      "8",
      "10"
    ],
    "correct": 1
  },
  {
    "question": "Number of weapons in classic Clue?",
    "choices": [
      "4",
      "6",
      "8",
      "10"
    ],
    "correct": 1
  },
  {
    "question": "Number of rooms?",
    "choices": [
      "6",
      "8",
      "9",
      "12"
    ],
    "correct": 2
  },
  {
    "question": "Murderer is determined…",
    "choices": [
      "Random secret card draw",
      "Vote",
      "Roll",
      "Player choice"
    ],
    "correct": 0
  },
  {
    "question": "Accusation rule when wrong?",
    "choices": [
      "Eliminated from winning",
      "Lose token",
      "Skip turn",
      "Bonus"
    ],
    "correct": 0
  },
  {
    "question": "Suggestion requires…",
    "choices": [
      "Being in the room you suggest",
      "Being anywhere",
      "Lobby only",
      "Stairs"
    ],
    "correct": 0
  },
  {
    "question": "Refutation order?",
    "choices": [
      "Clockwise around the table starting from suggester",
      "Random",
      "Loudest",
      "Drawn"
    ],
    "correct": 0
  },
  {
    "question": "What card is shown during refutation?",
    "choices": [
      "Privately to suggester",
      "Public",
      "Discarded",
      "None"
    ],
    "correct": 0
  },
  {
    "question": "Best strategy?",
    "choices": [
      "Track refutation patterns systematically",
      "Run randomly",
      "Stay in start",
      "Skip turns"
    ],
    "correct": 0
  },
  {
    "question": "Designer of Cluedo?",
    "choices": [
      "Anthony E. Pratt",
      "Reiner Knizia",
      "Klaus Teuber",
      "Sid Sackson"
    ],
    "correct": 0
  },
  {
    "question": "Year published?",
    "choices": [
      "1949",
      "1965",
      "1980",
      "1990"
    ],
    "correct": 0
  },
  {
    "question": "Master Detective version adds…",
    "choices": [
      "More rooms / suspects",
      "Voting",
      "Cards only",
      "Solo mode"
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

export function initialState(seed: number, _settings: ClueMiniSettings): ClueMiniState {
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

export function reducer(state: ClueMiniState, action: ClueMiniAction): ClueMiniState {
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

export function isTerminal(state: ClueMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
