import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DeceptionHkSettings { questions: "10"; }
export interface DeceptionHkState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}
export type DeceptionHkAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Hidden roles in base Deception include…",
    "choices": [
      "Murderer + Investigators + Forensic Scientist",
      "Wolves + Villagers",
      "Spies only",
      "Detectives + Cops"
    ],
    "correct": 0
  },
  {
    "question": "Forensic Scientist's job?",
    "choices": [
      "Reveal clue tiles",
      "Murder",
      "Investigate alone",
      "Vote"
    ],
    "correct": 0
  },
  {
    "question": "Investigators try to deduce…",
    "choices": [
      "The Means and Clue from the Murderer's hand",
      "The killer's name only",
      "The Forensic Scientist",
      "Nothing"
    ],
    "correct": 0
  },
  {
    "question": "Accomplice role…",
    "choices": [
      "Helps Murderer secretly",
      "Kills",
      "Quits",
      "Wins solo"
    ],
    "correct": 0
  },
  {
    "question": "Witness expansion adds a player who…",
    "choices": [
      "Knows the Murderer",
      "Is the Murderer's twin",
      "Cannot speak",
      "Auto-wins"
    ],
    "correct": 0
  },
  {
    "question": "Tiles reveal categories like…",
    "choices": [
      "Cause of death, motive",
      "Locations only",
      "Weapons only",
      "Names"
    ],
    "correct": 0
  },
  {
    "question": "Murderer chooses…",
    "choices": [
      "1 means + 1 clue from their hand",
      "All tiles",
      "Investigator",
      "Nothing"
    ],
    "correct": 0
  },
  {
    "question": "Why is Forensic Scientist's role tense?",
    "choices": [
      "Limited tile choices may not match Murderer's hand",
      "Plays cards",
      "Drawn last",
      "All of the above"
    ],
    "correct": 0
  },
  {
    "question": "Best Investigator strategy?",
    "choices": [
      "Compare scientist signals across rounds",
      "Random guesses",
      "Trust no one",
      "Vote first"
    ],
    "correct": 0
  },
  {
    "question": "Game ends when…",
    "choices": [
      "Investigators correctly accuse with means and clue",
      "Time",
      "Tokens",
      "Pass"
    ],
    "correct": 0
  },
  {
    "question": "Murderer wins by…",
    "choices": [
      "Surviving rounds without correct accusation",
      "Killing all",
      "Voting",
      "Speaking last"
    ],
    "correct": 0
  },
  {
    "question": "Designer of Deception: Murder in Hong Kong?",
    "choices": [
      "Tobey Ho",
      "Reiner Knizia",
      "Stefan Feld",
      "Friedemann Friese"
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

export function initialState(seed: number, _settings: DeceptionHkSettings): DeceptionHkState {
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

export function reducer(state: DeceptionHkState, action: DeceptionHkAction): DeceptionHkState {
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

export function isTerminal(state: DeceptionHkState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
