import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HairstylesQuizSettings { questionCount: "5" | "10" | "15"; }

export interface QuizEntry { question: string; answer: string; choices: string[]; }

export interface HairstylesQuizState {
  settings: HairstylesQuizSettings;
  entries: QuizEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type HairstylesQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string }[] = [
  { question: "What hairstyle involves tightly coiled or twisted strands?", answer: "Dreadlocks" },
  { question: "Which cut features longer hair on top and shaved sides?", answer: "Undercut" },
  { question: "What style keeps all hair at one uniform length?", answer: "Bob Cut" },
  { question: "Which Victorian-era style involves hair piled high on the head?", answer: "Pompadour" },
  { question: "What French braid variant wraps hair under rather than over?", answer: "Dutch Braid" },
  { question: "Which cut is very short with texturized, often messy-looking layers?", answer: "Pixie Cut" },
  { question: "What style features two sections of hair tied at the back of the head?", answer: "Pigtails" },
  { question: "Which ancient style wraps hair using thread into rope-like sections?", answer: "Bantu Knots" },
  { question: "What sleek style involves pulling all hair away from the face tightly?", answer: "Slicked Back" },
  { question: "Which elegant style gathers hair into a low, coiled arrangement?", answer: "Chignon" },
  { question: "What creates ringlets or waves using a cylindrical iron?", answer: "Curling Iron Waves" },
  { question: "Which traditional Mohawk style leaves a central strip of upright hair?", answer: "Mohawk" },
  { question: "What loose, casual style involves a low ponytail at the nape?", answer: "Low Ponytail" },
  { question: "Which '80s style was teased and sprayed to extreme volume?", answer: "Big Hair / Teased Hair" },
  { question: "What Japanese technique wraps hair in a chopstick-secured bun?", answer: "Geisha Bun" },
  { question: "Which cornrow variation uses extensions for added length?", answer: "Box Braids" },
  { question: "What style drapes hair over one shoulder in a loose twist?", answer: "Side Twist" },
  { question: "Which cut is layered and feathered around the face?", answer: "Shag Cut" },
  { question: "What rockabilly style rolls the front section up and back?", answer: "Quiff" },
  { question: "Which crown braid wraps braided hair around the head like a halo?", answer: "Crown Braid" },
];

const DISTRACTORS = ["Fade","Top Knot","Man Bun","French Twist","Lob","Blunt Cut","Afro","Ponytail","Side Part","Buzz Cut","Caesar Cut","Space Buns","Fishtail Braid","Waterfall Braid","Cornrows"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: HairstylesQuizSettings): HairstylesQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(DISTRACTORS.filter(d => d !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: HairstylesQuizState, action: HairstylesQuizAction): HairstylesQuizState {
  if (state.done) return state;
  if (action.type === "select") {
    if (state.selected !== null) return state;
    const correct = state.entries[state.current]!.choices[action.index] === state.entries[state.current]!.answer;
    return { ...state, selected: action.index, score: correct ? state.score + 10 : state.score };
  }
  if (action.type === "next") {
    if (state.selected === null) return state;
    const next = state.current + 1;
    if (next >= state.entries.length) return { ...state, done: true };
    return { ...state, current: next, selected: null };
  }
  return state;
}

export function isTerminal(state: HairstylesQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
