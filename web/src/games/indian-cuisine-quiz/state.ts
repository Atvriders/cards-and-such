import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface IndianCuisineQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface IndianCuisineQuizState { settings: IndianCuisineQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type IndianCuisineQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "Which spice gives biryani its distinctive yellow color?", answer: "Saffron or turmeric", wrong: ["Paprika", "Fenugreek", "Cumin"] },
  { question: "Dal is made from which ingredient?", answer: "Cooked lentils or legumes", wrong: ["Ground spices", "Fermented rice", "Dried vegetables"] },
  { question: "Dosa is a crispy crepe popular in which region of India?", answer: "South India", wrong: ["North India", "East India", "West India"] },
  { question: "What type of clay oven is used to cook naan and tandoori dishes?", answer: "Tandoor", wrong: ["Chulha", "Sigri", "Bhatti"] },
  { question: "Butter chicken was invented in which Indian city?", answer: "Delhi", wrong: ["Mumbai", "Amritsar", "Lucknow"] },
  { question: "What is the main ingredient in chana masala?", answer: "Chickpeas", wrong: ["Kidney beans", "Black lentils", "Mung beans"] },
  { question: "Sambar is a South Indian lentil stew traditionally served with what?", answer: "Idli or dosa", wrong: ["Roti", "Biryani", "Paratha"] },
  { question: "Which Indian state is known for its rogan josh curry?", answer: "Kashmir", wrong: ["Rajasthan", "Punjab", "Goa"] },
  { question: "What does 'masala' mean in Indian cooking?", answer: "A blend of spices", wrong: ["A cooking method", "A type of rice", "A fermented sauce"] },
  { question: "Paneer is a type of fresh cheese most similar to which Western cheese?", answer: "Cottage cheese or ricotta", wrong: ["Feta", "Queso fresco", "Halloumi"] },
  { question: "Vada pav is a popular street food from which Indian city?", answer: "Mumbai", wrong: ["Delhi", "Kolkata", "Chennai"] },
  { question: "Fish curry is most associated with which coastal Indian state?", answer: "Kerala", wrong: ["Karnataka", "Tamil Nadu", "Goa"] },
  { question: "What is the main ingredient in raita?", answer: "Yogurt", wrong: ["Buttermilk", "Sour cream", "Cream"] },
  { question: "Pani puri is a popular street snack made with what?", answer: "Hollow crispy shells filled with spiced water", wrong: ["Fried dough balls", "Steamed dumplings", "Flatbread triangles"] },
  { question: "Which Indian bread is made by deep-frying dough?", answer: "Puri", wrong: ["Chapati", "Naan", "Paratha"] },
  { question: "What is the key spice in garam masala that gives warmth?", answer: "Black pepper and cloves", wrong: ["Cumin and coriander", "Chili and paprika", "Turmeric and ginger"] },
  { question: "Biryani traditionally uses which type of rice?", answer: "Basmati", wrong: ["Sona masuri", "Ponni", "Parboiled"] },
  { question: "What is the typical sweet made for Diwali celebrations?", answer: "Barfi or ladoo", wrong: ["Jalebi", "Gulab jamun", "Halwa"] },
  { question: "Idli is a steamed rice cake that is popular for breakfast in which region?", answer: "South India", wrong: ["North India", "East India", "Central India"] },
  { question: "What gives vindaloo its distinctively sour flavor?", answer: "Vinegar", wrong: ["Tamarind", "Lemon juice", "Green mango"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: IndianCuisineQuizSettings): IndianCuisineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(item.wrong, rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: IndianCuisineQuizState, action: IndianCuisineQuizAction): IndianCuisineQuizState {
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

export function isTerminal(state: IndianCuisineQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
