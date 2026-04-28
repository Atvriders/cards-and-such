import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CryptidMiniSettings { questions: "10"; }
export interface CryptidMiniState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type CryptidMiniAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Cryptid's map is made of…",
    "choices": [
      "Hex tiles",
      "Square grid",
      "Cards",
      "Yarn"
    ],
    "correct": 0
  },
  {
    "question": "Each player has a clue that is…",
    "choices": [
      "A terrain or feature constraint",
      "A suspect",
      "A weapon",
      "Random"
    ],
    "correct": 0
  },
  {
    "question": "Two main actions per turn?",
    "choices": [
      "Question / Search",
      "Move / Attack",
      "Buy / Sell",
      "Roll / Build"
    ],
    "correct": 0
  },
  {
    "question": "When you ask a question, opponent places a…",
    "choices": [
      "Disc (yes) or cube (no)",
      "Star",
      "Rock",
      "Card"
    ],
    "correct": 0
  },
  {
    "question": "Searching a hex requires…",
    "choices": [
      "All players to mark",
      "Random roll",
      "Just one player",
      "Vote"
    ],
    "correct": 0
  },
  {
    "question": "Standing stones & shacks are…",
    "choices": [
      "Decorations",
      "Structure clue features",
      "Tokens",
      "Penalty"
    ],
    "correct": 1
  },
  {
    "question": "A negative clue means…",
    "choices": [
      "The cryptid is NOT in that terrain/feature",
      "Cryptid is hiding",
      "Skip turn",
      "Penalty"
    ],
    "correct": 0
  },
  {
    "question": "Game ends when…",
    "choices": [
      "Cryptid found correctly",
      "Time runs out",
      "Tokens gone",
      "Vote"
    ],
    "correct": 0
  },
  {
    "question": "Why are searches information-rich?",
    "choices": [
      "Force every opponent to mark yes/no",
      "Gold reward",
      "Random",
      "End game"
    ],
    "correct": 0
  },
  {
    "question": "Best early-game move?",
    "choices": [
      "Search center hex",
      "Question for broad terrain elimination",
      "Random",
      "Pass"
    ],
    "correct": 1
  },
  {
    "question": "Cryptid box label?",
    "choices": [
      "Logic puzzle disguised as board game",
      "Combat game",
      "Word game",
      "Bluff game"
    ],
    "correct": 0
  },
  {
    "question": "How many players is Cryptid optimised for?",
    "choices": [
      "2",
      "3-5",
      "6-8",
      "Solo"
    ],
    "correct": 1
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

export function initialState(seed: number, _settings: CryptidMiniSettings): CryptidMiniState {
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

export function reducer(state: CryptidMiniState, action: CryptidMiniAction): CryptidMiniState {
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

export function isTerminal(state: CryptidMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
