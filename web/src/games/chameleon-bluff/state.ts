import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChameleonBluffSettings { questions: "10"; }
export interface ChameleonBluffState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type ChameleonBluffAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Chameleon's role?",
    "choices": [
      "Doesn't know secret word",
      "Knows everything",
      "Voter only",
      "Speaks last"
    ],
    "correct": 0
  },
  {
    "question": "Word grid size?",
    "choices": [
      "3x3",
      "4x4",
      "5x5",
      "6x6"
    ],
    "correct": 1
  },
  {
    "question": "Secret word determined by?",
    "choices": [
      "Two dice rolls (row/col)",
      "Card draw",
      "Player choice",
      "Random app"
    ],
    "correct": 0
  },
  {
    "question": "Each non-Chameleon gives?",
    "choices": [
      "A one-word clue",
      "Sentence",
      "Drawing",
      "Action"
    ],
    "correct": 0
  },
  {
    "question": "Goal of Chameleon?",
    "choices": [
      "Avoid identification or guess word if outed",
      "Be identified",
      "Most clues",
      "Speaks first"
    ],
    "correct": 0
  },
  {
    "question": "Best Chameleon clue style?",
    "choices": [
      "Vague / multi-word-compatible",
      "Direct guess",
      "Random",
      "Silent"
    ],
    "correct": 0
  },
  {
    "question": "Vote phase happens?",
    "choices": [
      "After all clues given",
      "Before clues",
      "Mid-clue",
      "End of round"
    ],
    "correct": 0
  },
  {
    "question": "If Chameleon identified, they may?",
    "choices": [
      "Guess the secret word to still win",
      "Auto-lose",
      "Re-clue",
      "Skip"
    ],
    "correct": 0
  },
  {
    "question": "Designer?",
    "choices": [
      "Rikki Tahta",
      "Klaus Teuber",
      "Sid Sackson",
      "Donald X."
    ],
    "correct": 0
  },
  {
    "question": "Why over-specific clues are dangerous?",
    "choices": [
      "Reveal you know the word and may be confused for Chameleon claim",
      "Always punished",
      "Bonus",
      "Random"
    ],
    "correct": 0
  },
  {
    "question": "Player count Chameleon supports?",
    "choices": [
      "3-8",
      "Solo",
      "2",
      "10+"
    ],
    "correct": 0
  },
  {
    "question": "Standard win condition?",
    "choices": [
      "Catch Chameleon AND prevent guess",
      "Just one of those",
      "Random",
      "Score points"
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

export function initialState(seed: number, _settings: ChameleonBluffSettings): ChameleonBluffState {
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

export function reducer(state: ChameleonBluffState, action: ChameleonBluffAction): ChameleonBluffState {
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

export function isTerminal(state: ChameleonBluffState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
