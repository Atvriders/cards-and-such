import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AmericanCuisineQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface AmericanCuisineQuizState { settings: AmericanCuisineQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type AmericanCuisineQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "Which US city is famous for deep-dish pizza?", answer: "Chicago", wrong: ["New York", "Detroit", "Los Angeles"] },
  { question: "What is the main ingredient in New England clam chowder?", answer: "Clams and cream", wrong: ["Fish and tomato", "Oysters and butter", "Shrimp and potato"] },
  { question: "Gumbo is a stew closely associated with which US state?", answer: "Louisiana", wrong: ["Mississippi", "Alabama", "Georgia"] },
  { question: "Which city is famous for its Philly cheesesteak?", answer: "Philadelphia", wrong: ["Pittsburgh", "Baltimore", "Washington DC"] },
  { question: "What bread is commonly used in a classic BLT?", answer: "White sandwich bread", wrong: ["Rye bread", "Sourdough", "Whole wheat toast"] },
  { question: "Tex-Mex cuisine blends American cooking with traditions from which country?", answer: "Mexico", wrong: ["Guatemala", "Cuba", "Puerto Rico"] },
  { question: "Buffalo wings originated in which US city?", answer: "Buffalo, New York", wrong: ["Nashville, Tennessee", "Atlanta, Georgia", "Kansas City, Missouri"] },
  { question: "What is the key ingredient that gives key lime pie its flavor?", answer: "Key limes", wrong: ["Meyer lemons", "Persian limes", "Sour oranges"] },
  { question: "Which US city is known for its BBQ burnt ends?", answer: "Kansas City", wrong: ["Memphis", "Austin", "Nashville"] },
  { question: "Cajun cuisine is most associated with which US state?", answer: "Louisiana", wrong: ["Texas", "Mississippi", "South Carolina"] },
  { question: "What type of bean is used in traditional Boston baked beans?", answer: "Navy beans", wrong: ["Pinto beans", "Kidney beans", "Black beans"] },
  { question: "Clam bake is a traditional cooking method from which US region?", answer: "New England", wrong: ["Pacific Northwest", "Deep South", "Great Plains"] },
  { question: "Which US state is most famous for peach production?", answer: "Georgia", wrong: ["South Carolina", "California", "Florida"] },
  { question: "What is a po'boy?", answer: "A New Orleans submarine sandwich", wrong: ["A Louisiana gumbo", "A Cajun rice dish", "A deep-fried shrimp dish"] },
  { question: "Frito pie is a snack dish most associated with which US region?", answer: "Southwest", wrong: ["Midwest", "Southeast", "Northeast"] },
  { question: "Which cheese is traditionally used on a classic cheeseburger?", answer: "American cheese", wrong: ["Cheddar", "Swiss", "Provolone"] },
  { question: "What is the primary ingredient in southern cornbread?", answer: "Cornmeal", wrong: ["Grits", "Wheat flour", "Masa"] },
  { question: "Eggs Benedict is typically served on what type of bread?", answer: "English muffin", wrong: ["Croissant", "Bagel", "Toast"] },
  { question: "Which US state is famous for Dungeness crab?", answer: "Washington", wrong: ["Alaska", "California", "Oregon"] },
  { question: "What is apple pie often served with in the United States?", answer: "Vanilla ice cream", wrong: ["Whipped cream", "Cheddar cheese", "Caramel sauce"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: AmericanCuisineQuizSettings): AmericanCuisineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(item.wrong, rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: AmericanCuisineQuizState, action: AmericanCuisineQuizAction): AmericanCuisineQuizState {
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

export function isTerminal(state: AmericanCuisineQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
