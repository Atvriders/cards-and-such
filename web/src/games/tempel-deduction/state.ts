import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TempelDeductionSettings { questions: "10"; }
export interface TempelDeductionState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type TempelDeductionAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Two team roles?",
    "choices": [
      "Adventurers / Guardians",
      "Wolves / Villagers",
      "Spies / Resistance",
      "Mafia / Cops"
    ],
    "correct": 0
  },
  {
    "question": "Card types include all EXCEPT…",
    "choices": [
      "Treasure",
      "Empty",
      "Trap",
      "Wand"
    ],
    "correct": 3
  },
  {
    "question": "Adventurers win by…",
    "choices": [
      "Flipping all treasures",
      "Killing",
      "Trap reveal",
      "Voting"
    ],
    "correct": 0
  },
  {
    "question": "Guardians win by…",
    "choices": [
      "Trap card flipped or rounds expire",
      "Vote",
      "Treasure flip",
      "Speaking"
    ],
    "correct": 0
  },
  {
    "question": "Total rounds per game?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "question": "Key holder…",
    "choices": [
      "Chooses who to flip next",
      "Auto-wins",
      "Cannot vote",
      "Drawn last"
    ],
    "correct": 0
  },
  {
    "question": "After flipping, the key…",
    "choices": [
      "Passes to flipped player",
      "Stays",
      "Returns to start",
      "Random"
    ],
    "correct": 0
  },
  {
    "question": "Adventurer best strategy?",
    "choices": [
      "Read body language and key direction",
      "Random",
      "Wait",
      "Flip self"
    ],
    "correct": 0
  },
  {
    "question": "Guardian best strategy?",
    "choices": [
      "Push trap risk while seeming helpful",
      "Be silent",
      "Reveal role",
      "Refuse key"
    ],
    "correct": 0
  },
  {
    "question": "Why are remaining-treasure counts important?",
    "choices": [
      "Constrains who must hold them",
      "Game ends earlier",
      "Bonus tokens",
      "Nothing"
    ],
    "correct": 0
  },
  {
    "question": "Card backs are…",
    "choices": [
      "Identical to obscure type",
      "Different",
      "Marked",
      "Color-coded"
    ],
    "correct": 0
  },
  {
    "question": "Game alternative title?",
    "choices": [
      "Don't Mess with Cthulhu",
      "Werewolf",
      "Mafia",
      "Coup"
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

export function initialState(seed: number, _settings: TempelDeductionSettings): TempelDeductionState {
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

export function reducer(state: TempelDeductionState, action: TempelDeductionAction): TempelDeductionState {
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

export function isTerminal(state: TempelDeductionState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
