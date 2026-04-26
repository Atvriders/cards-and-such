import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AsianCuisineQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface AsianCuisineQuizState { settings: AsianCuisineQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type AsianCuisineQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "Which Japanese dish consists of raw fish on vinegared rice?", answer: "Sushi", wrong: ["Sashimi", "Tempura", "Ramen"] },
  { question: "Pad Thai is a noodle dish originating from which country?", answer: "Thailand", wrong: ["Vietnam", "Malaysia", "Indonesia"] },
  { question: "What is the main ingredient in Japanese miso soup?", answer: "Fermented soybean paste", wrong: ["Fish stock", "Seaweed extract", "Rice flour"] },
  { question: "Dim sum is traditionally associated with which cuisine?", answer: "Cantonese Chinese", wrong: ["Japanese", "Korean", "Vietnamese"] },
  { question: "Which Indian bread is baked in a tandoor oven?", answer: "Naan", wrong: ["Chapati", "Paratha", "Puri"] },
  { question: "Pho is a broth-based noodle soup from which country?", answer: "Vietnam", wrong: ["Thailand", "Cambodia", "Laos"] },
  { question: "What spice gives turmeric its yellow color?", answer: "Curcumin", wrong: ["Saffron", "Annatto", "Paprika"] },
  { question: "Bibimbap is a mixed rice dish from which country?", answer: "Korea", wrong: ["Japan", "China", "Vietnam"] },
  { question: "Which Chinese sauce is made from fermented black soybeans?", answer: "Black bean sauce", wrong: ["Oyster sauce", "Hoisin sauce", "Fish sauce"] },
  { question: "Laksa is a spicy noodle soup popular in which region?", answer: "Southeast Asia", wrong: ["South Asia", "East Asia", "Central Asia"] },
  { question: "What is the Japanese term for grilled skewered meat?", answer: "Yakitori", wrong: ["Tonkatsu", "Teriyaki", "Karaage"] },
  { question: "Rendang is a slow-cooked dry curry originating from which country?", answer: "Indonesia", wrong: ["Malaysia", "Thailand", "Philippines"] },
  { question: "Which grain is central to most East Asian cuisines?", answer: "Rice", wrong: ["Wheat", "Millet", "Barley"] },
  { question: "Tom Yum is a sour and spicy soup from which country?", answer: "Thailand", wrong: ["Vietnam", "Myanmar", "Laos"] },
  { question: "What is natto in Japanese cuisine?", answer: "Fermented soybeans", wrong: ["Pickled vegetables", "Dried fish", "Salted plum"] },
  { question: "Gyoza is a type of dumpling most associated with which cuisine?", answer: "Japanese", wrong: ["Chinese", "Korean", "Thai"] },
  { question: "Which Asian country uses fish sauce most prominently?", answer: "Vietnam", wrong: ["Japan", "India", "China"] },
  { question: "What type of rice wine is used in Japanese cooking?", answer: "Sake", wrong: ["Mirin", "Soju", "Baijiu"] },
  { question: "Banh mi is a type of sandwich from which country?", answer: "Vietnam", wrong: ["Cambodia", "Laos", "Thailand"] },
  { question: "Which spice is the key flavoring in Chinese five-spice powder?", answer: "Star anise", wrong: ["Cardamom", "Cloves", "Turmeric"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: AsianCuisineQuizSettings): AsianCuisineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(item.wrong, rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: AsianCuisineQuizState, action: AsianCuisineQuizAction): AsianCuisineQuizState {
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

export function isTerminal(state: AsianCuisineQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
