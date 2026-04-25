import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SpicesQuizSettings {
  questionCount: "5" | "10" | "15";
}

export interface SpicesEntry {
  question: string;
  answer: string;
  choices: string[];
}

export interface SpicesQuizState {
  settings: SpicesQuizSettings;
  entries: SpicesEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type SpicesQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string }[] = [
  { question: "Which spice comes from dried crocus stigmas?", answer: "Saffron" },
  { question: "What spice is made from dried tree bark?", answer: "Cinnamon" },
  { question: "Which spice comes from the Piper nigrum plant?", answer: "Black Pepper" },
  { question: "What gives turmeric its yellow color?", answer: "Curcumin" },
  { question: "Which spice is also called 'Spanish saffron'?", answer: "Safflower" },
  { question: "What spice is extracted from vanilla orchid pods?", answer: "Vanilla" },
  { question: "Cardamom is native to which continent?", answer: "Asia" },
  { question: "Which spice is ground from dried chili peppers?", answer: "Paprika" },
  { question: "What spice comes from the nutmeg tree's seed covering?", answer: "Mace" },
  { question: "Which spice is known as 'the queen of spices'?", answer: "Cardamom" },
  { question: "Cloves are the dried flower buds of which tree?", answer: "Syzygium aromaticum" },
  { question: "What spice is derived from the seeds of Coriandrum sativum?", answer: "Coriander" },
  { question: "Which spice is produced from the dried bark of Cinnamomum cassia?", answer: "Cassia" },
  { question: "What is the hottest commonly used spice by Scoville units?", answer: "Cayenne" },
  { question: "Which spice was historically worth more than gold?", answer: "Saffron" },
  { question: "Fenugreek seeds taste similar to which sweetener?", answer: "Maple syrup" },
  { question: "What spice gives curry its yellow color?", answer: "Turmeric" },
  { question: "Which spice is called 'the king of spices'?", answer: "Black Pepper" },
  { question: "What spice is made from dried, ground allspice berries?", answer: "Allspice" },
  { question: "Sumac is commonly used in which cuisine?", answer: "Middle Eastern" },
  { question: "Which spice is also called 'Mexican saffron'?", answer: "Safflower" },
  { question: "Star anise is native to which country?", answer: "China" },
  { question: "What spice is ground from dried mustard seeds?", answer: "Mustard powder" },
  { question: "Which country produces the most vanilla?", answer: "Madagascar" },
  { question: "Caraway seeds are used prominently in which bread?", answer: "Rye bread" },
];

const WRONG: string[] = [
  "Africa", "Europe", "Americas", "Oceania", "Capsaicin", "Lycopene", "Allicin",
  "Eugenol", "Thymol", "Linalool", "Ginger root", "Basil", "Oregano", "Rosemary",
  "Thyme", "Nutmeg", "Cloves", "Anise", "Fennel", "Dill", "Caraway", "Tarragon",
  "Lavender", "Mint", "Sage", "Bay leaf", "Chives", "Marjoram", "India", "Sri Lanka",
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: SpicesQuizSettings): SpicesQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const shuffled = shuffle(BANK, rng).slice(0, count);
  const entries: SpicesEntry[] = shuffled.map((item) => {
    const wrong = shuffle(WRONG.filter((w) => w !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: SpicesQuizState, action: SpicesQuizAction): SpicesQuizState {
  if (state.done) return state;
  switch (action.type) {
    case "select": {
      if (state.selected !== null) return state;
      const entry = state.entries[state.current]!;
      const correct = entry.choices[action.index] === entry.answer;
      return { ...state, selected: action.index, score: correct ? state.score + 10 : state.score };
    }
    case "next": {
      if (state.selected === null) return state;
      const next = state.current + 1;
      if (next >= state.entries.length) return { ...state, done: true };
      return { ...state, current: next, selected: null };
    }
    default: return state;
  }
}

export function isTerminal(state: SpicesQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
