import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ResistanceQuizSettings { questions: "10"; }
export interface ResistanceQuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type ResistanceQuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "How many failed missions do spies need to win?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 1
  },
  {
    "question": "How many successful missions does the Resistance need to win?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 1
  },
  {
    "question": "What happens after 5 consecutive team rejections?",
    "choices": [
      "Resistance wins",
      "Spies automatically win",
      "Game ends in draw",
      "New leader chosen"
    ],
    "correct": 1
  },
  {
    "question": "In a 7-player game, how many spies are there?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 1
  },
  {
    "question": "Mission 4 in 7+ player games requires how many fails?",
    "choices": [
      "1",
      "2",
      "3",
      "1 or 2"
    ],
    "correct": 1
  },
  {
    "question": "Who chooses the team for each mission?",
    "choices": [
      "The current leader",
      "A vote",
      "Random",
      "Last mission's success team"
    ],
    "correct": 0
  },
  {
    "question": "How are mission cards revealed?",
    "choices": [
      "Open declaration",
      "Played face-down then shuffled",
      "Public vote",
      "Leader announces"
    ],
    "correct": 1
  },
  {
    "question": "Spies know:",
    "choices": [
      "Nothing",
      "Each other",
      "All Resistance",
      "Everyone's roles"
    ],
    "correct": 1
  },
  {
    "question": "Common Resistance tell of a spy is…",
    "choices": [
      "Eagerly leading",
      "Always voting yes early",
      "Quiet during discussion",
      "All of the above"
    ],
    "correct": 3
  },
  {
    "question": "Best strategy for Resistance early game?",
    "choices": [
      "Approve everything",
      "Reject all teams",
      "Track votes & include yourself",
      "Talk least"
    ],
    "correct": 2
  },
  {
    "question": "Avalon adds which iconic role to Resistance?",
    "choices": [
      "Witch",
      "Merlin",
      "King",
      "Wolf"
    ],
    "correct": 1
  },
  {
    "question": "Spies typically want to fail…",
    "choices": [
      "Mission 1",
      "Mission 2 or 3",
      "Every mission",
      "Only mission 5"
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

export function initialState(seed: number, _settings: ResistanceQuizSettings): ResistanceQuizState {
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

export function reducer(state: ResistanceQuizState, action: ResistanceQuizAction): ResistanceQuizState {
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

export function isTerminal(state: ResistanceQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
