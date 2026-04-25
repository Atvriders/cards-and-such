import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DrinksQuizSettings { questionCount: "5" | "10" | "15"; }
export interface DrinksEntry { question: string; answer: string; choices: string[]; }
export interface DrinksQuizState { settings: DrinksQuizSettings; entries: DrinksEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type DrinksQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK = [
  { question: "What country invented Champagne?", answer: "France" },
  { question: "Which tea is known as 'red tea' in the West?", answer: "Rooibos" },
  { question: "What grain is Scotch whisky primarily made from?", answer: "Barley" },
  { question: "Which country is the largest producer of coffee?", answer: "Brazil" },
  { question: "What is the base spirit in a Margarita?", answer: "Tequila" },
  { question: "Sake is brewed from which grain?", answer: "Rice" },
  { question: "What is the main ingredient in a traditional Irish stout?", answer: "Roasted barley" },
  { question: "Which country drinks the most tea per capita?", answer: "Turkey" },
  { question: "What gives green tea its color?", answer: "Chlorophyll" },
  { question: "Which spirit is the base of a Negroni?", answer: "Gin" },
  { question: "Mezcal is primarily made from which plant?", answer: "Agave" },
  { question: "What is the primary fermentation agent in beer?", answer: "Yeast" },
  { question: "Which drink is traditionally served in a copper mug?", answer: "Moscow Mule" },
  { question: "Bourbon must be aged in what type of barrel?", answer: "New charred oak" },
  { question: "What country produces Prosecco?", answer: "Italy" },
  { question: "Which drink is made from fermented honey?", answer: "Mead" },
  { question: "What is the base spirit in a Daiquiri?", answer: "Rum" },
  { question: "Which country invented Earl Grey tea?", answer: "England" },
  { question: "What gives red wine its color?", answer: "Grape skin" },
  { question: "Calvados is a brandy made from which fruit?", answer: "Apples" },
];

const WRONG = ["Germany", "Japan", "USA", "China", "Mexico", "India", "Spain", "Portugal", "Russia", "Australia", "Corn", "Wheat", "Oats", "Vodka", "Whisky", "Brandy", "Bourbon", "Rum", "Gin", "Tequila", "Bacteria", "Sugar", "Hops", "Old oak", "White oak", "Peaches", "Pears", "Grapes", "Plums", "Cherries"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: DrinksQuizSettings): DrinksQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const entries: DrinksEntry[] = shuffle(BANK, rng).slice(0, count).map((item) => {
    const wrong = shuffle(WRONG.filter(w => w !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: DrinksQuizState, action: DrinksQuizAction): DrinksQuizState {
  if (state.done) return state;
  switch (action.type) {
    case "select": {
      if (state.selected !== null) return state;
      const correct = state.entries[state.current]!.choices[action.index] === state.entries[state.current]!.answer;
      return { ...state, selected: action.index, score: correct ? state.score + 10 : state.score };
    }
    case "next": {
      if (state.selected === null) return state;
      const next = state.current + 1;
      return next >= state.entries.length ? { ...state, done: true } : { ...state, current: next, selected: null };
    }
    default: return state;
  }
}

export function isTerminal(state: DrinksQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
