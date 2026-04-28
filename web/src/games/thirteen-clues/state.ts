import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ThirteenCluesSettings { questions: "10"; }
export interface ThirteenCluesState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type ThirteenCluesAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "What three categories make up a 13 Clues crime?",
    "choices": [
      "Suspect/Weapon/Location",
      "Time/Place/Motive",
      "Color/Shape/Number",
      "Fact/Lie/Question"
    ],
    "correct": 0
  },
  {
    "question": "What can each player see at game start?",
    "choices": [
      "Their own crime",
      "Everyone else's crime",
      "Only the cards",
      "Public clues"
    ],
    "correct": 1
  },
  {
    "question": "Sherlock & Watson cards are…",
    "choices": [
      "Public clue cards",
      "Hidden roles",
      "Bonus tokens",
      "Killers"
    ],
    "correct": 0
  },
  {
    "question": "Goal of 13 Clues?",
    "choices": [
      "Win first to deduce your own crime",
      "Deduce others'",
      "Draw most cards",
      "Highest count"
    ],
    "correct": 0
  },
  {
    "question": "Common clue format?",
    "choices": [
      "Yes/No about a category",
      "Free-text",
      "Voting",
      "Counting"
    ],
    "correct": 0
  },
  {
    "question": "Rumour token in 13 Clues?",
    "choices": [
      "Bonus question",
      "Penalty",
      "Doubled card",
      "Skip"
    ],
    "correct": 0
  },
  {
    "question": "Why is 13 Clues called 'inverse'?",
    "choices": [
      "See others, not yours",
      "Reverse turn order",
      "Backwards clues",
      "End-first scoring"
    ],
    "correct": 0
  },
  {
    "question": "Players ask questions of…",
    "choices": [
      "The next player",
      "Anyone",
      "Moderator",
      "Public board"
    ],
    "correct": 1
  },
  {
    "question": "Game ends when…",
    "choices": [
      "Time runs out",
      "First correct full deduction",
      "All clue cards used",
      "Tokens depleted"
    ],
    "correct": 1
  },
  {
    "question": "Best opening question style?",
    "choices": [
      "Broad category eliminator",
      "Specific suspect guess",
      "Random",
      "Public read"
    ],
    "correct": 0
  },
  {
    "question": "Sherlock cards exclude…",
    "choices": [
      "A suspect/weapon/location combo",
      "Roles",
      "Players",
      "Tokens"
    ],
    "correct": 0
  },
  {
    "question": "Strategically, narrow questions are best…",
    "choices": [
      "Early",
      "Late game",
      "Never",
      "Always"
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

export function initialState(seed: number, _settings: ThirteenCluesSettings): ThirteenCluesState {
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

export function reducer(state: ThirteenCluesState, action: ThirteenCluesAction): ThirteenCluesState {
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

export function isTerminal(state: ThirteenCluesState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
