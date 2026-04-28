import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WerewolfQuizSettings { questions: "10"; }
export interface WerewolfQuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type WerewolfQuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Werewolves win at what ratio?",
    "choices": [
      "More than Villagers",
      "Equal to Villagers",
      "Half Villagers",
      "Always last 3"
    ],
    "correct": 1
  },
  {
    "question": "Standard Werewolf:Villager ratio?",
    "choices": [
      "1:2",
      "1:3",
      "1:4",
      "1:5"
    ],
    "correct": 2
  },
  {
    "question": "Seer at night does what?",
    "choices": [
      "Kills",
      "Investigates one player",
      "Heals",
      "Votes twice"
    ],
    "correct": 1
  },
  {
    "question": "Doctor / Bodyguard at night?",
    "choices": [
      "Sees",
      "Protects one player",
      "Lynches",
      "Votes"
    ],
    "correct": 1
  },
  {
    "question": "First role typically targeted by Wolves?",
    "choices": [
      "Doctor",
      "Seer",
      "Random",
      "Village Idiot"
    ],
    "correct": 1
  },
  {
    "question": "Who runs the day phase?",
    "choices": [
      "Moderator",
      "Wolves",
      "Seer",
      "Doctor"
    ],
    "correct": 0
  },
  {
    "question": "Hammer = ?",
    "choices": [
      "Final vote that lynches",
      "First vote",
      "Tie-breaking vote",
      "Wolf signal"
    ],
    "correct": 0
  },
  {
    "question": "Cult/Vampire variant adds…",
    "choices": [
      "Recruitment",
      "Resurrection",
      "Auto-win",
      "Nothing"
    ],
    "correct": 0
  },
  {
    "question": "Counter-claim Seer means…",
    "choices": [
      "Wolf claims to also be Seer",
      "Doctor reveals",
      "Village quits",
      "Day skip"
    ],
    "correct": 0
  },
  {
    "question": "Village's best information source?",
    "choices": [
      "The Wolves",
      "Seer's checks",
      "Random voting",
      "Quiet players"
    ],
    "correct": 1
  },
  {
    "question": "If Seer dies night 1, Village should…",
    "choices": [
      "Give up",
      "Treat any claim with extreme suspicion (Wolves likely fake-claim)",
      "Auto-trust next claim",
      "Skip day"
    ],
    "correct": 1
  },
  {
    "question": "One Night Werewolf differs because…",
    "choices": [
      "No deaths",
      "Single round",
      "No Seer",
      "Auto-Wolf wins"
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

export function initialState(seed: number, _settings: WerewolfQuizSettings): WerewolfQuizState {
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

export function reducer(state: WerewolfQuizState, action: WerewolfQuizAction): WerewolfQuizState {
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

export function isTerminal(state: WerewolfQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
