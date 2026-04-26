import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FashionErasQuizSettings { questionCount: "5" | "10" | "15"; }

export interface QuizEntry { question: string; answer: string; choices: string[]; }

export interface FashionErasQuizState {
  settings: FashionErasQuizSettings;
  entries: QuizEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type FashionErasQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string }[] = [
  { question: "Which era is known for corsets, bustles, and elaborate Victorian silhouettes?", answer: "Victorian Era (1837–1901)" },
  { question: "What decade introduced the flapper dress and dropped waistlines?", answer: "1920s" },
  { question: "Which era featured wide-shoulder power suits and neon colors?", answer: "1980s" },
  { question: "What period saw the rise of mini skirts and go-go boots?", answer: "1960s" },
  { question: "Which era brought bell-bottoms, platform shoes, and disco glamour?", answer: "1970s" },
  { question: "What era popularized grunge with flannel shirts and ripped jeans?", answer: "1990s" },
  { question: "Which decade saw poodle skirts and saddle shoes?", answer: "1950s" },
  { question: "What historical period featured powdered wigs and elaborate court dress?", answer: "18th Century / Georgian Era" },
  { question: "Which era introduced the New Look — cinched waists and full skirts — by Dior?", answer: "Post-WWII (late 1940s)" },
  { question: "What era brought cloaks, doublets, and ruffled collars?", answer: "Elizabethan Era (1558–1603)" },
  { question: "Which decade popularized hip-hop streetwear — baggy jeans, sneakers, and caps?", answer: "1990s Hip-Hop Era" },
  { question: "What era saw the rise of Art Nouveau-inspired flowing gowns?", answer: "Belle Époque (1890–1914)" },
  { question: "Which period featured togas and draped linen garments?", answer: "Ancient Rome / Greece" },
  { question: "What decade introduced the bikini and casual vacation wear?", answer: "1950s (post-war leisure)" },
  { question: "Which era is associated with the peacock revolution and men wearing bold colors?", answer: "Late 1960s / Mod Era" },
  { question: "What period brought Edwardian S-curve corsets and Gibson Girl aesthetics?", answer: "Edwardian Era (1901–1910)" },
  { question: "Which era popularized athleisure and minimalist fashion?", answer: "2010s" },
  { question: "What decade saw zoot suits and wartime utility clothing?", answer: "1940s" },
  { question: "Which medieval era featured pointed shoes called poulaines?", answer: "Late Medieval (14th–15th century)" },
  { question: "What era brought the rise of punk fashion — mohawks, safety pins, leather?", answer: "Late 1970s Punk Era" },
];

const DISTRACTORS = ["Renaissance","Baroque","Rococo","Regency Era","Jazz Age","Roaring Twenties","Space Age","Mod Era","New Wave","Post-modern","Cyber Fashion","Streetwear Era","Normcore","Y2K Fashion","Cottagecore"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: FashionErasQuizSettings): FashionErasQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(DISTRACTORS.filter(d => d !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: FashionErasQuizState, action: FashionErasQuizAction): FashionErasQuizState {
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

export function isTerminal(state: FashionErasQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
