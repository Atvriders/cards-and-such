import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BeersQuizSettings { questionCount: "5" | "10" | "15"; }

export interface QuizEntry { question: string; answer: string; choices: string[]; }

export interface BeersQuizState {
  settings: BeersQuizSettings;
  entries: QuizEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type BeersQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string }[] = [
  { question: "Which beer style uses top-fermenting yeast and is brewed at warmer temperatures?", answer: "Ale" },
  { question: "What German beer is traditionally brewed only in Bavaria and served at Oktoberfest?", answer: "Märzen / Oktoberfest Lager" },
  { question: "Which dark Irish stout is known for its creamy head and roasted flavor?", answer: "Guinness Stout" },
  { question: "What hop-heavy American beer style has very high bitterness and aroma?", answer: "India Pale Ale (IPA)" },
  { question: "Which Belgian beer is brewed by Trappist monks?", answer: "Trappist Ale" },
  { question: "What Czech beer style became the world's most popular lager?", answer: "Pilsner" },
  { question: "Which style uses wild yeast fermentation for a tart, sour flavor?", answer: "Lambic" },
  { question: "What wheat beer from Germany is known for banana and clove aromas?", answer: "Weizenbier (Hefeweizen)" },
  { question: "Which dark, sweet beer is brewed with caramelized or black malt?", answer: "Porter" },
  { question: "What extremely strong ale can exceed 12% ABV and has complex flavors?", answer: "Barleywine" },
  { question: "Which American style combines pale malt with West Coast hops for a crisp finish?", answer: "American Pale Ale" },
  { question: "What smoked beer style originates from Bamberg, Germany?", answer: "Rauchbier" },
  { question: "Which light-colored lager is the most sold beer in the world?", answer: "Pale Lager (e.g., Budweiser)" },
  { question: "What style is brewed with fruit additions like cherries or raspberries?", answer: "Fruit Beer / Kriek" },
  { question: "Which beer has a fresh, 'green' taste from dry-hopping with unprocessed hops?", answer: "Fresh Hop Ale" },
  { question: "What English style is served at cellar temperature via hand pump?", answer: "Cask Ale / Real Ale" },
  { question: "Which session beer is low in alcohol but full of flavor?", answer: "Session Beer" },
  { question: "What beer style is brewed with oats for a silky mouthfeel?", answer: "Oatmeal Stout" },
  { question: "Which amber lager is associated with Vienna, Austria?", answer: "Vienna Lager" },
  { question: "What style combines coffee, chocolate, and roasted malt flavors in a dark body?", answer: "Imperial Stout" },
];

const DISTRACTORS = ["Pilsner","Lager","Stout","Porter","Wheat Beer","Saison","Amber Ale","Blonde Ale","Kolsch","Dunkel","Bock","Doppelbock","Gose","Berliner Weisse","Altbier","Cream Ale","Schwarzbier","Mild Ale","Brown Ale","Red Ale"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: BeersQuizSettings): BeersQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(DISTRACTORS.filter(d => d !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: BeersQuizState, action: BeersQuizAction): BeersQuizState {
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

export function isTerminal(state: BeersQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
