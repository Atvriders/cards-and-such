import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AvalonQuizSettings { questions: "10"; }
export interface AvalonQuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type AvalonQuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Avalon's special evil role hidden from Merlin is…",
    "choices": [
      "Mordred",
      "Morgana",
      "Oberon",
      "Percival"
    ],
    "correct": 0
  },
  {
    "question": "Percival sees…",
    "choices": [
      "Mordred only",
      "Merlin & Morgana mixed",
      "All evil",
      "Just Merlin"
    ],
    "correct": 1
  },
  {
    "question": "Oberon is special because…",
    "choices": [
      "Always the leader",
      "Doesn't know other evil",
      "Sees everyone",
      "Cannot vote"
    ],
    "correct": 1
  },
  {
    "question": "Who can the Assassin kill at game end?",
    "choices": [
      "Anyone",
      "Merlin to win",
      "Percival only",
      "The leader"
    ],
    "correct": 1
  },
  {
    "question": "When does the Assassin guess?",
    "choices": [
      "Anytime",
      "After 3 successful missions",
      "After every mission",
      "Round 1"
    ],
    "correct": 1
  },
  {
    "question": "Merlin's primary risk is…",
    "choices": [
      "Being killed",
      "Being voted off",
      "Being outed and assassinated",
      "Too many votes"
    ],
    "correct": 2
  },
  {
    "question": "Morgana appears as Merlin to whom?",
    "choices": [
      "Percival",
      "Assassin",
      "Mordred",
      "Oberon"
    ],
    "correct": 0
  },
  {
    "question": "Standard 5-player Avalon evil count?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "question": "Best Merlin behaviour?",
    "choices": [
      "Lead aggressively",
      "Approve confidently without leading",
      "Speak last",
      "Reject everything"
    ],
    "correct": 1
  },
  {
    "question": "Why include Mordred?",
    "choices": [
      "More fails needed",
      "To balance Merlin's info",
      "Extra mission",
      "Reduce votes"
    ],
    "correct": 1
  },
  {
    "question": "Standard mission-five fails-needed?",
    "choices": [
      "1",
      "2 (in 7+)",
      "1 always",
      "Always 1 except for 7+ which can be 2"
    ],
    "correct": 3
  },
  {
    "question": "Percival outing themselves is…",
    "choices": [
      "Always wrong",
      "Sometimes right to draw fire from Merlin",
      "Forbidden",
      "Only round 5"
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

export function initialState(seed: number, _settings: AvalonQuizSettings): AvalonQuizState {
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

export function reducer(state: AvalonQuizState, action: AvalonQuizAction): AvalonQuizState {
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

export function isTerminal(state: AvalonQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
