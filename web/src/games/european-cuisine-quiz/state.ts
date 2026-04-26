import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface EuropeanCuisineQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface EuropeanCuisineQuizState { settings: EuropeanCuisineQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type EuropeanCuisineQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "Croissant is most closely associated with which country?", answer: "France", wrong: ["Austria", "Belgium", "Switzerland"] },
  { question: "Paella originates from which European country?", answer: "Spain", wrong: ["Portugal", "Italy", "France"] },
  { question: "Which country is the origin of wiener schnitzel?", answer: "Austria", wrong: ["Germany", "Hungary", "Poland"] },
  { question: "Moussaka is a layered casserole from which country?", answer: "Greece", wrong: ["Turkey", "Bulgaria", "Cyprus"] },
  { question: "What is the national dish of Scotland?", answer: "Haggis", wrong: ["Bangers and mash", "Fish and chips", "Beef stew"] },
  { question: "Carbonara pasta originates from which Italian city?", answer: "Rome", wrong: ["Milan", "Naples", "Bologna"] },
  { question: "Bouillabaisse is a traditional fish stew from which city?", answer: "Marseille", wrong: ["Bordeaux", "Lyon", "Nice"] },
  { question: "Which cheese is a key ingredient in Swiss fondue?", answer: "Gruyere", wrong: ["Gouda", "Brie", "Manchego"] },
  { question: "Pierogi are stuffed dumplings from which country?", answer: "Poland", wrong: ["Ukraine", "Russia", "Czech Republic"] },
  { question: "Goulash originates from which European country?", answer: "Hungary", wrong: ["Romania", "Austria", "Slovakia"] },
  { question: "What type of bread is used for Bruschetta?", answer: "Toasted Italian bread", wrong: ["Pita", "Baguette", "Rye bread"] },
  { question: "Tapas are small dishes that originated in which country?", answer: "Spain", wrong: ["Portugal", "Italy", "France"] },
  { question: "Which Scandinavian country is known for gravlax?", answer: "Sweden", wrong: ["Norway", "Denmark", "Finland"] },
  { question: "Ratatouille is a vegetable dish from which French region?", answer: "Provence", wrong: ["Burgundy", "Alsace", "Brittany"] },
  { question: "Tiramisu is an Italian dessert that uses which liqueur?", answer: "Coffee liqueur", wrong: ["Amaretto", "Limoncello", "Grappa"] },
  { question: "Borscht is a beet soup associated with which country?", answer: "Ukraine", wrong: ["Russia", "Poland", "Romania"] },
  { question: "Which country produces Prosciutto di Parma?", answer: "Italy", wrong: ["Spain", "France", "Portugal"] },
  { question: "Fish and chips is the national dish of which country?", answer: "England", wrong: ["Ireland", "Scotland", "Wales"] },
  { question: "What is the main flavoring in Greek tzatziki?", answer: "Cucumber and garlic", wrong: ["Lemon and herbs", "Yogurt and mint", "Olive and feta"] },
  { question: "Stroopwafel is a thin waffle cookie from which country?", answer: "Netherlands", wrong: ["Belgium", "Germany", "Denmark"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: EuropeanCuisineQuizSettings): EuropeanCuisineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(item.wrong, rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: EuropeanCuisineQuizState, action: EuropeanCuisineQuizAction): EuropeanCuisineQuizState {
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

export function isTerminal(state: EuropeanCuisineQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
