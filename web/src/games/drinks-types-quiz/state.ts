import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DrinksTypesQuizSettings { questionCount: "5" | "10" | "15"; }

export interface QuizEntry { question: string; answer: string; choices: string[]; }

export interface DrinksTypesQuizState {
  settings: DrinksTypesQuizSettings;
  entries: QuizEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type DrinksTypesQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string }[] = [
  { question: "What is the base spirit of a classic Mojito?", answer: "White Rum" },
  { question: "Which drink is made by fermenting apples?", answer: "Cider" },
  { question: "What type of tea is fermented with a SCOBY culture?", answer: "Kombucha" },
  { question: "Which drink is distilled from agave plants?", answer: "Tequila" },
  { question: "What is the primary grain used in bourbon whiskey?", answer: "Corn" },
  { question: "Which carbonated soft drink is often used in a Tom Collins?", answer: "Club Soda" },
  { question: "What drink is made from fermented grape juice?", answer: "Wine" },
  { question: "Which beverage is brewed from malted barley, hops, water, and yeast?", answer: "Beer" },
  { question: "What type of coffee is made by forcing hot water through finely-ground beans?", answer: "Espresso" },
  { question: "Which spirit is triple-distilled and associated with Ireland?", answer: "Irish Whiskey" },
  { question: "What Japanese rice wine is served warm or cold?", answer: "Sake" },
  { question: "Which herbal drink from South America is drunk through a metal straw?", answer: "Yerba Mate" },
  { question: "What milky cocktail combines vodka and coffee liqueur?", answer: "White Russian" },
  { question: "Which non-alcoholic syrup drink is made from pomegranate?", answer: "Grenadine" },
  { question: "What drink is produced by distilling fermented grain mash and often aged in oak?", answer: "Whiskey" },
  { question: "Which fizzy drink is made with ginger and is often spicy in taste?", answer: "Ginger Beer" },
  { question: "What drink is made by steeping roasted barley in hot water without fermentation?", answer: "Barley Tea" },
  { question: "Which fortified wine comes from the Jerez region of Spain?", answer: "Sherry" },
  { question: "What Italian bitter liqueur is made with artichoke?", answer: "Cynar" },
  { question: "Which Southeast Asian drink blends condensed milk with strong coffee?", answer: "Vietnamese Iced Coffee" },
];

const DISTRACTORS = ["Vodka","Gin","Brandy","Tequila","Rum","Whiskey","Beer","Wine","Champagne","Cider","Prosecco","Absinthe","Sambuca","Vermouth","Bitters","Lager","Stout","Porter","Saison","Pilsner"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: DrinksTypesQuizSettings): DrinksTypesQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(DISTRACTORS.filter(d => d !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: DrinksTypesQuizState, action: DrinksTypesQuizAction): DrinksTypesQuizState {
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

export function isTerminal(state: DrinksTypesQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
