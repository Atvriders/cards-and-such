import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AbbreviationQuizSettings { questions: "8" | "12"; }
export interface AbbreviationQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AbbreviationQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "'etc.' is short for:",
    "choices": [
      "et cetera",
      "extra count",
      "et coetera (variant)",
      "et certain"
    ],
    "correct": 0
  },
  {
    "question": "'e.g.' stands for:",
    "choices": [
      "exempli gratia (for example)",
      "example given",
      "et generally",
      "exempli generis"
    ],
    "correct": 0
  },
  {
    "question": "'i.e.' stands for:",
    "choices": [
      "id est (that is)",
      "in essence",
      "in example",
      "id estimate"
    ],
    "correct": 0
  },
  {
    "question": "'Dr.' is the abbreviation for:",
    "choices": [
      "Doctor",
      "Drive",
      "Driver",
      "Drama"
    ],
    "correct": 0
  },
  {
    "question": "'Mr.' is the abbreviation for:",
    "choices": [
      "Mister",
      "Master",
      "Mariner",
      "Manager"
    ],
    "correct": 0
  },
  {
    "question": "'Mrs.' is the abbreviation for:",
    "choices": [
      "Mistress (married woman title)",
      "Misters",
      "Madame",
      "Misters' wife"
    ],
    "correct": 0
  },
  {
    "question": "'Ms.' is used for:",
    "choices": [
      "a woman regardless of marital status",
      "a married woman only",
      "a single woman only",
      "a man"
    ],
    "correct": 0
  },
  {
    "question": "'St.' (in addresses) often stands for:",
    "choices": [
      "Street",
      "State",
      "Stop",
      "Straight"
    ],
    "correct": 0
  },
  {
    "question": "'St.' (before a name) often stands for:",
    "choices": [
      "Saint",
      "Street",
      "State",
      "Stop"
    ],
    "correct": 0
  },
  {
    "question": "'Ave.' stands for:",
    "choices": [
      "Avenue",
      "Average",
      "Aviary",
      "Ave Maria"
    ],
    "correct": 0
  },
  {
    "question": "'Blvd.' stands for:",
    "choices": [
      "Boulevard",
      "Believed",
      "Believe",
      "Blower"
    ],
    "correct": 0
  },
  {
    "question": "'a.m.' stands for:",
    "choices": [
      "ante meridiem (before noon)",
      "after midnight",
      "almost morning",
      "at morning"
    ],
    "correct": 0
  },
  {
    "question": "'p.m.' stands for:",
    "choices": [
      "post meridiem (after noon)",
      "past midnight",
      "pre-morning",
      "post morning"
    ],
    "correct": 0
  },
  {
    "question": "'vs.' or 'v.' stands for:",
    "choices": [
      "versus",
      "verses",
      "very",
      "various"
    ],
    "correct": 0
  },
  {
    "question": "'cf.' stands for:",
    "choices": [
      "confer (compare)",
      "carry forward",
      "court file",
      "cross file"
    ],
    "correct": 0
  },
  {
    "question": "'No.' (before a number) stands for:",
    "choices": [
      "Number (Latin numero)",
      "North",
      "Note",
      "Nope"
    ],
    "correct": 0
  },
  {
    "question": "'oz.' stands for:",
    "choices": [
      "ounce",
      "ozone",
      "oozes",
      "ozark"
    ],
    "correct": 0
  },
  {
    "question": "'lb.' stands for:",
    "choices": [
      "pound (Latin libra)",
      "label",
      "load box",
      "lower bound"
    ],
    "correct": 0
  },
  {
    "question": "'ft.' stands for:",
    "choices": [
      "foot/feet",
      "fortune",
      "fitness",
      "front"
    ],
    "correct": 0
  },
  {
    "question": "'in.' stands for:",
    "choices": [
      "inch/inches",
      "inside",
      "inner",
      "input"
    ],
    "correct": 0
  },
  {
    "question": "'mph' stands for:",
    "choices": [
      "miles per hour",
      "miles past hour",
      "miles per heat",
      "movements per hour"
    ],
    "correct": 0
  },
  {
    "question": "'kph' stands for:",
    "choices": [
      "kilometers per hour",
      "kilos per hour",
      "knots per hour",
      "km past hour"
    ],
    "correct": 0
  },
  {
    "question": "'km' stands for:",
    "choices": [
      "kilometer",
      "kilo-mass",
      "kilometre",
      "k-meter"
    ],
    "correct": 0
  },
  {
    "question": "'kg' stands for:",
    "choices": [
      "kilogram",
      "kilo-gross",
      "kilo-gauge",
      "k-gram"
    ],
    "correct": 0
  },
  {
    "question": "'mm' stands for:",
    "choices": [
      "millimeter",
      "milli-mass",
      "macro-meter",
      "midmeter"
    ],
    "correct": 0
  },
  {
    "question": "'fig.' stands for:",
    "choices": [
      "figure",
      "fight",
      "figment",
      "fitness gym"
    ],
    "correct": 0
  },
  {
    "question": "'ed.' stands for:",
    "choices": [
      "editor or edition",
      "education",
      "ended",
      "edited (only)"
    ],
    "correct": 0
  },
  {
    "question": "'vol.' stands for:",
    "choices": [
      "volume",
      "volunteer",
      "volcano",
      "volatile"
    ],
    "correct": 0
  },
  {
    "question": "'approx.' stands for:",
    "choices": [
      "approximately",
      "approval",
      "appropriated",
      "approached"
    ],
    "correct": 0
  },
  {
    "question": "'misc.' stands for:",
    "choices": [
      "miscellaneous",
      "missing class",
      "mister",
      "mismatch"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AbbreviationQuizSettings): AbbreviationQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => {
    const idx = q.choices.map((c, i) => ({ c, i }));
    const s = shuffle(idx, rng);
    const nc = s.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: s.map(x => x.c) as [string, string, string, string], correct: nc };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: AbbreviationQuizState, action: AbbreviationQuizAction): AbbreviationQuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": return state.submitted ? state : { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const ok = state.selected === q.correct;
      const pts = ok ? 100 + Math.floor(state.timeLeft * 10) : 0;
      return { ...state, submitted: true, score: state.score + pts, correctCount: state.correctCount + (ok ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const t = state.timeLeft - 1;
      return t <= 0 ? { ...state, timeLeft: 0, submitted: true, phase: "result" } : { ...state, timeLeft: t };
    }
    case "next": {
      const ni = state.currentIndex + 1;
      return ni >= state.questions.length ? { ...state, phase: "done" } : { ...state, currentIndex: ni, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}
export function isTerminal(state: AbbreviationQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
