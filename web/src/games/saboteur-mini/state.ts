import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SaboteurMiniSettings { questions: "10"; }
export interface SaboteurMiniState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type SaboteurMiniAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Saboteur's core race is…",
    "choices": [
      "Build a path to gold",
      "Steal coins",
      "Last dwarf standing",
      "Race down a track"
    ],
    "correct": 0
  },
  {
    "question": "Two role types?",
    "choices": [
      "Miner / Saboteur",
      "Wolf / Villager",
      "King / Pawn",
      "Healer / Killer"
    ],
    "correct": 0
  },
  {
    "question": "How many gold cards exist at start?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  },
  {
    "question": "Of those gold cards, how many are real?",
    "choices": [
      "1",
      "2",
      "3",
      "All"
    ],
    "correct": 0
  },
  {
    "question": "Action cards include all EXCEPT…",
    "choices": [
      "Broken tool",
      "Repair",
      "Map",
      "Wand of fire"
    ],
    "correct": 3
  },
  {
    "question": "Broken tool blocks a player from…",
    "choices": [
      "Speaking",
      "Playing path cards",
      "Voting",
      "Drawing"
    ],
    "correct": 1
  },
  {
    "question": "Map card lets you…",
    "choices": [
      "Look at gold-card secretly",
      "Win round",
      "Skip turn",
      "Re-deal"
    ],
    "correct": 0
  },
  {
    "question": "How many rounds in a full Saboteur game?",
    "choices": [
      "1",
      "2",
      "3",
      "5"
    ],
    "correct": 2
  },
  {
    "question": "Best signal of a saboteur?",
    "choices": [
      "Plays many path cards",
      "Tools players who could connect",
      "Always quiet",
      "Never plays maps"
    ],
    "correct": 1
  },
  {
    "question": "Saboteurs win a round by…",
    "choices": [
      "Path not reaching gold",
      "Killing miners",
      "Drawing all cards",
      "Voting wins"
    ],
    "correct": 0
  },
  {
    "question": "Players hold cards how?",
    "choices": [
      "Open",
      "Hidden hand",
      "Shared",
      "On table"
    ],
    "correct": 1
  },
  {
    "question": "When are role cards revealed?",
    "choices": [
      "Start",
      "End of round",
      "Mid-round",
      "Never"
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

export function initialState(seed: number, _settings: SaboteurMiniSettings): SaboteurMiniState {
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

export function reducer(state: SaboteurMiniState, action: SaboteurMiniAction): SaboteurMiniState {
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

export function isTerminal(state: SaboteurMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
