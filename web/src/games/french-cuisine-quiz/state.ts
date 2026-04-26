import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FrenchCuisineQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface FrenchCuisineQuizState { settings: FrenchCuisineQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type FrenchCuisineQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "What pastry is made by layering dough with butter, creating a flaky texture?", answer: "Croissant", wrong: ["Brioche", "Baguette", "Eclair"] },
  { question: "Coq au vin is a classic French dish made with which meat?", answer: "Chicken braised in wine", wrong: ["Beef braised in wine", "Duck confit", "Rabbit stew"] },
  { question: "What is the French term for a light, airy egg-white dessert baked in a dish?", answer: "Souffle", wrong: ["Mousse", "Meringue", "Clafoutis"] },
  { question: "Bechamel is one of the five French mother sauces. What is its base?", answer: "Butter, flour, and milk", wrong: ["Butter and egg yolks", "Stock and roux", "Cream and shallots"] },
  { question: "Which region of France is famous for producing foie gras?", answer: "Gascony and Perigord", wrong: ["Burgundy", "Normandy", "Alsace"] },
  { question: "What is a classic French onion soup topped with?", answer: "Melted Gruyere cheese", wrong: ["Parmesan bread crumbs", "Cream and herbs", "Brie and croutons"] },
  { question: "Tarte Tatin is an upside-down pastry made with which fruit?", answer: "Apples", wrong: ["Pears", "Peaches", "Plums"] },
  { question: "Which French city is famous for its mustard?", answer: "Dijon", wrong: ["Lyon", "Bordeaux", "Strasbourg"] },
  { question: "Ratatouille is a vegetable dish from which French region?", answer: "Provence", wrong: ["Burgundy", "Alsace", "Brittany"] },
  { question: "What is the French term for a restaurant's fixed-price multi-course meal?", answer: "Menu du jour", wrong: ["A la carte", "Plat du jour", "Carte blanche"] },
  { question: "Crepes originated in which French region?", answer: "Brittany", wrong: ["Normandy", "Loire Valley", "Burgundy"] },
  { question: "What cheese is used in a classic French croque-monsieur?", answer: "Gruyere", wrong: ["Brie", "Camembert", "Roquefort"] },
  { question: "Hollandaise sauce is made with which primary ingredient?", answer: "Egg yolks and butter", wrong: ["Cream and herbs", "Mustard and vinegar", "White wine and shallots"] },
  { question: "Escargot in French cuisine refers to what?", answer: "Cooked snails", wrong: ["Oysters", "Sea urchin", "Frogs' legs"] },
  { question: "Pot-au-feu is a traditional French dish consisting of what?", answer: "Boiled beef and vegetables", wrong: ["Braised pork belly", "Slow-roasted lamb", "Poached whole chicken"] },
  { question: "Which French pastry is a choux dough shell filled with cream?", answer: "Eclair", wrong: ["Profiterole", "Madeleine", "Macaron"] },
  { question: "Bouillabaisse is a seafood stew originally from which French city?", answer: "Marseille", wrong: ["Nice", "Bordeaux", "La Rochelle"] },
  { question: "What wine region gives its name to a rich beef stew with wine and mushrooms?", answer: "Burgundy", wrong: ["Bordeaux", "Champagne", "Provence"] },
  { question: "What is the key flavoring in a traditional French cassoulet?", answer: "Slow-cooked white beans and duck confit", wrong: ["Beef and lentils", "Pork and chickpeas", "Lamb and flageolet beans"] },
  { question: "A financier is a small French cake made primarily with what?", answer: "Brown butter and almond flour", wrong: ["Olive oil and orange zest", "Cocoa and hazelnut", "Cream cheese and vanilla"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: FrenchCuisineQuizSettings): FrenchCuisineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(item.wrong, rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: FrenchCuisineQuizState, action: FrenchCuisineQuizAction): FrenchCuisineQuizState {
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

export function isTerminal(state: FrenchCuisineQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
