import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface GreekCuisineQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface GreekCuisineQuizState { settings: GreekCuisineQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type GreekCuisineQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "What is the main ingredient in Greek tzatziki?", answer: "Strained yogurt, cucumber, garlic", wrong: ["Cream cheese and dill", "Tahini and lemon", "Hummus and paprika"] },
  { question: "Moussaka is a layered dish traditionally including which vegetable?", answer: "Eggplant", wrong: ["Zucchini", "Potato", "Artichoke"] },
  { question: "Spanakopita is a Greek pastry filled with what?", answer: "Spinach and feta cheese", wrong: ["Meat and onion", "Cheese and tomato", "Olive and herb"] },
  { question: "What type of cheese is traditionally used in Greek salad?", answer: "Feta", wrong: ["Halloumi", "Mizithra", "Manouri"] },
  { question: "Souvlaki is small pieces of meat cooked on what?", answer: "Skewers", wrong: ["A clay pot", "Stone slabs", "Banana leaves"] },
  { question: "Horiatiki is the Greek name for which salad?", answer: "Traditional Greek village salad", wrong: ["Tabbouleh", "Fattoush", "Caesar salad"] },
  { question: "What is baklava made from?", answer: "Layers of phyllo dough, nuts, and honey", wrong: ["Semolina cake with syrup", "Rice flour with rosewater", "Almond paste in pastry"] },
  { question: "Taramasalata is a dip made from which ingredient?", answer: "Fish roe", wrong: ["Smoked eggplant", "Chickpea paste", "Roasted red pepper"] },
  { question: "Dolmades are grape leaves stuffed with what filling?", answer: "Rice and herbs", wrong: ["Ground lamb and onion", "Cheese and spinach", "Minced pork and garlic"] },
  { question: "What type of bread is served with Greek meze?", answer: "Pita bread", wrong: ["Tsoureki", "Lagana", "Koulouria"] },
  { question: "Pastitsio is a Greek baked pasta dish similar to which Italian dish?", answer: "Lasagna", wrong: ["Cannelloni", "Baked ziti", "Manicotti"] },
  { question: "What is the Greek equivalent of the Italian aperitivo tradition?", answer: "Meze with ouzo", wrong: ["Sketo with mezedes", "Tsipouro with pita", "Retsina with cheese"] },
  { question: "Kritharaki is a Greek pasta shaped like what?", answer: "Rice or barley grains (orzo)", wrong: ["Small tubes", "Spirals", "Flat ribbons"] },
  { question: "Which island is famous for its mastiha, a unique resin used in cooking?", answer: "Chios", wrong: ["Santorini", "Crete", "Rhodes"] },
  { question: "What is the traditional Greek Easter soup made from lamb offal?", answer: "Magiritsa", wrong: ["Fasolada", "Kakavia", "Avgolemono"] },
  { question: "Galaktoboureko is a Greek custard pie made with what pastry?", answer: "Phyllo dough", wrong: ["Shortcrust pastry", "Puff pastry", "Choux pastry"] },
  { question: "What gives Greek lemon rice soup (avgolemono) its creamy texture?", answer: "Egg and lemon juice emulsion", wrong: ["Cream and cornstarch", "Butter and flour roux", "Yogurt and olive oil"] },
  { question: "Which Greek region is known for producing the finest olive oil?", answer: "Crete and Peloponnese", wrong: ["Thessaly", "Macedonia", "Epirus"] },
  { question: "What herbs are most associated with Greek cooking?", answer: "Oregano and thyme", wrong: ["Basil and rosemary", "Parsley and tarragon", "Dill and chives"] },
  { question: "Loukoumades are traditional Greek what?", answer: "Deep-fried honey dough balls", wrong: ["Almond cookies", "Sesame brittle", "Nut-filled pastries"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: GreekCuisineQuizSettings): GreekCuisineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(item.wrong, rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: GreekCuisineQuizState, action: GreekCuisineQuizAction): GreekCuisineQuizState {
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

export function isTerminal(state: GreekCuisineQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
