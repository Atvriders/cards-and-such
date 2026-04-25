import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SnacksQuizSettings { questionCount: "5" | "10" | "15"; }
export interface SnacksEntry { question: string; answer: string; choices: string[]; }
export interface SnacksQuizState { settings: SnacksQuizSettings; entries: SnacksEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type SnacksQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK = [
  { question: "Which country invented potato chips?", answer: "United States" },
  { question: "What is the main ingredient in hummus?", answer: "Chickpeas" },
  { question: "Pretzels originated in which country?", answer: "Germany" },
  { question: "What nut is used in traditional marzipan?", answer: "Almonds" },
  { question: "Which country invented Pocky?", answer: "Japan" },
  { question: "What is a churro traditionally made from?", answer: "Choux pastry" },
  { question: "What snack is made from ground sesame seeds?", answer: "Tahini" },
  { question: "Which nut is commonly coated in chocolate in Nutella?", answer: "Hazelnuts" },
  { question: "Where did trail mix originate?", answer: "California" },
  { question: "What is the main grain in popcorn?", answer: "Corn" },
  { question: "Which country created the croissant?", answer: "Austria" },
  { question: "What snack is made from dried plums?", answer: "Prunes" },
  { question: "Rice crackers are most associated with which cuisine?", answer: "Japanese" },
  { question: "What is the protein content of peanuts compared to meat?", answer: "Similar" },
  { question: "Which snack brand uses a mustachioed man as its mascot?", answer: "Pringles" },
  { question: "What is guacamole made from?", answer: "Avocado" },
  { question: "Nachos were invented in which country?", answer: "Mexico" },
  { question: "What grain is used in rice cakes?", answer: "Rice" },
  { question: "Edamame are immature versions of which bean?", answer: "Soybean" },
  { question: "What sweet-salty snack is made from caramel-coated popcorn?", answer: "Cracker Jack" },
];

const WRONG = ["France", "Italy", "Spain", "China", "India", "Brazil", "Australia", "UK", "Canada", "Russia", "Peanuts", "Cashews", "Walnuts", "Pecans", "Pistachios", "Wheat", "Oats", "Barley", "Rye", "Corn", "Lentils", "Black beans", "White beans", "Kidney beans", "Peas", "Butter", "Cream", "Milk", "Eggs", "Flour"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: SnacksQuizSettings): SnacksQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const entries: SnacksEntry[] = shuffle(BANK, rng).slice(0, count).map((item) => {
    const wrong = shuffle(WRONG.filter(w => w !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: SnacksQuizState, action: SnacksQuizAction): SnacksQuizState {
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

export function isTerminal(state: SnacksQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
