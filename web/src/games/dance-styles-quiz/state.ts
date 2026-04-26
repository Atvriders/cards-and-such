import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DanceStylesQuizSettings { questionCount: "5" | "10" | "15"; }

export interface QuizEntry { question: string; answer: string; choices: string[]; }

export interface DanceStylesQuizState {
  settings: DanceStylesQuizSettings;
  entries: QuizEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type DanceStylesQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string }[] = [
  { question: "Which dance originated in Buenos Aires, Argentina?", answer: "Tango" },
  { question: "What Cuban dance features a distinctive hip-swaying motion called 'Cuban motion'?", answer: "Salsa" },
  { question: "Which dance is characterized by rapid footwork and comes from Ireland?", answer: "Irish Step Dance" },
  { question: "What street dance style originated in the South Bronx in the 1970s?", answer: "Breaking (Breakdance)" },
  { question: "Which ballroom dance comes from Brazil and features a bouncy feel?", answer: "Samba" },
  { question: "What dance style involves strict timing and is performed to country music?", answer: "Line Dancing" },
  { question: "Which dance involves a partner lift and is associated with Dirty Dancing?", answer: "Mambo" },
  { question: "What classical dance form uses pointe shoes and is associated with Swan Lake?", answer: "Ballet" },
  { question: "Which dance involves a quick side-to-side hip motion and originated in Havana?", answer: "Cha-Cha" },
  { question: "What energetic swing dance was popular in the 1930s and 40s?", answer: "Lindy Hop" },
  { question: "Which dance features a flowing skirt and is from Andalusia, Spain?", answer: "Flamenco" },
  { question: "What dance uses hand fans or a veil and originated in the Middle East?", answer: "Belly Dance" },
  { question: "Which contemporary dance style blends classical and modern techniques?", answer: "Contemporary Dance" },
  { question: "What partner dance from Colombia features complex footwork and hip movement?", answer: "Cumbia" },
  { question: "Which Japanese performance art combines dance and drama?", answer: "Kabuki" },
  { question: "What dance craze swept the US in the 1960s with a twisting hip motion?", answer: "The Twist" },
  { question: "Which Latin dance is known as the 'dance of love' and has a slow-slow-quick-quick rhythm?", answer: "Foxtrot" },
  { question: "What African-American dance incorporates mime, comedy, and precise rhythm?", answer: "Tap Dance" },
  { question: "Which dance involves swinging a partner overhead and originated in the 1940s?", answer: "Jive" },
  { question: "What Indian classical dance form uses mudras (hand gestures)?", answer: "Bharatanatyam" },
];

const DISTRACTORS = ["Waltz","Polka","Quickstep","Rumba","Paso Doble","Viennese Waltz","Electric Slide","Moonwalk","Krump","Popping","Locking","Voguing","Disco","Hip-Hop","Jazz Dance","Lyrical Dance"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: DanceStylesQuizSettings): DanceStylesQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(DISTRACTORS.filter(d => d !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: DanceStylesQuizState, action: DanceStylesQuizAction): DanceStylesQuizState {
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

export function isTerminal(state: DanceStylesQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
