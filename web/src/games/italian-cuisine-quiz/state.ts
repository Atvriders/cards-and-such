import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ItalianCuisineQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface ItalianCuisineQuizState { settings: ItalianCuisineQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type ItalianCuisineQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "Which Italian pasta is shaped like small ears?", answer: "Orecchiette", wrong: ["Fusilli", "Penne", "Rigatoni"] },
  { question: "What cheese is traditionally used in a classic Margherita pizza?", answer: "Mozzarella", wrong: ["Provolone", "Parmesan", "Ricotta"] },
  { question: "Risotto is traditionally made with which type of rice?", answer: "Arborio", wrong: ["Jasmine", "Basmati", "Carnaroli"] },
  { question: "What is the main ingredient in pesto alla Genovese?", answer: "Fresh basil", wrong: ["Parsley", "Spinach", "Arugula"] },
  { question: "Osso buco is a braised meat dish from which Italian city?", answer: "Milan", wrong: ["Rome", "Florence", "Naples"] },
  { question: "Carbonara sauce is made without which common ingredient?", answer: "Cream", wrong: ["Eggs", "Pancetta", "Pecorino cheese"] },
  { question: "Which region of Italy is most famous for truffles?", answer: "Umbria and Piedmont", wrong: ["Tuscany", "Sicily", "Lombardy"] },
  { question: "What does 'al dente' mean in Italian cooking?", answer: "Firm to the bite", wrong: ["Fully cooked", "Very soft", "Slightly raw"] },
  { question: "Cannoli originates from which Italian island?", answer: "Sicily", wrong: ["Sardinia", "Capri", "Elba"] },
  { question: "Which cured Italian ham is air-dried and not smoked?", answer: "Prosciutto", wrong: ["Guanciale", "Speck", "Capicola"] },
  { question: "What wine is used to make a classic risotto?", answer: "Dry white wine", wrong: ["Chianti", "Prosecco", "Marsala"] },
  { question: "Bolognese sauce originates from which Italian city?", answer: "Bologna", wrong: ["Naples", "Rome", "Florence"] },
  { question: "What is the classic pairing with Parmigiano-Reggiano cheese?", answer: "Balsamic vinegar", wrong: ["Olive oil", "Red wine", "Honey"] },
  { question: "Limoncello is a lemon liqueur most associated with which region?", answer: "Amalfi Coast", wrong: ["Tuscany", "Piedmont", "Veneto"] },
  { question: "Focaccia is a flatbread most associated with which Italian region?", answer: "Liguria", wrong: ["Puglia", "Lombardy", "Emilia-Romagna"] },
  { question: "What is the traditional cheese in Roman cacio e pepe?", answer: "Pecorino Romano", wrong: ["Parmesan", "Grana Padano", "Asiago"] },
  { question: "Which Italian dessert is made from espresso and ladyfinger biscuits?", answer: "Tiramisu", wrong: ["Panna cotta", "Zabaglione", "Cantucci"] },
  { question: "Saltimbocca is a veal dish prepared with which herb?", answer: "Sage", wrong: ["Rosemary", "Thyme", "Basil"] },
  { question: "Grana Padano cheese is produced in which Italian valley?", answer: "Po Valley", wrong: ["Arno Valley", "Adige Valley", "Tiber Valley"] },
  { question: "What grain is polenta made from?", answer: "Cornmeal", wrong: ["Semolina", "Buckwheat", "Spelt"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: ItalianCuisineQuizSettings): ItalianCuisineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(item.wrong, rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: ItalianCuisineQuizState, action: ItalianCuisineQuizAction): ItalianCuisineQuizState {
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

export function isTerminal(state: ItalianCuisineQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
