import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SpanishCuisineQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface SpanishCuisineQuizState { settings: SpanishCuisineQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type SpanishCuisineQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "What is the essential ingredient that gives paella its yellow color?", answer: "Saffron", wrong: ["Turmeric", "Paprika", "Annatto"] },
  { question: "Gazpacho is a cold soup most associated with which Spanish region?", answer: "Andalusia", wrong: ["Catalonia", "Basque Country", "Galicia"] },
  { question: "Jamon Iberico is made from which type of pig?", answer: "Iberian black pig", wrong: ["Duroc pig", "Mangalica pig", "Berkshire pig"] },
  { question: "What is the traditional Spanish potato omelette called?", answer: "Tortilla Espanola", wrong: ["Fritatta", "Revuelto", "Pincho"] },
  { question: "Patatas bravas are fried potatoes served with which sauce?", answer: "Spicy tomato sauce and aioli", wrong: ["Garlic butter", "Saffron cream", "Paprika vinaigrette"] },
  { question: "Which region of Spain is famous for its pintxos?", answer: "Basque Country", wrong: ["Catalonia", "Aragon", "Valencia"] },
  { question: "Pulpo a la Gallega is an octopus dish from which Spanish region?", answer: "Galicia", wrong: ["Andalusia", "Murcia", "Asturias"] },
  { question: "What gives chorizo its distinctive red color and flavor?", answer: "Smoked paprika (pimenton)", wrong: ["Cayenne pepper", "Saffron and tomato", "Ancho chili"] },
  { question: "Churros are traditionally served with what in Spain?", answer: "Thick hot chocolate for dipping", wrong: ["Whipped cream", "Honey and cinnamon", "Jam and butter"] },
  { question: "What is the main ingredient in pan con tomate (pa amb tomaquet)?", answer: "Bread rubbed with tomato and olive oil", wrong: ["Toast with tomato puree", "Bread with sun-dried tomatoes", "Flatbread with pico de gallo"] },
  { question: "Fabada Asturiana is a hearty bean stew from which region?", answer: "Asturias", wrong: ["Galicia", "Cantabria", "Navarra"] },
  { question: "What type of rice is traditionally used in authentic paella?", answer: "Bomba rice", wrong: ["Arborio", "Calasparra", "Long-grain white rice"] },
  { question: "Pimentos de Padron are small green peppers associated with which region?", answer: "Galicia", wrong: ["Catalonia", "Extremadura", "Andalusia"] },
  { question: "Manchego cheese is made from the milk of which animal?", answer: "Sheep", wrong: ["Goat", "Cow", "Buffalo"] },
  { question: "Crema Catalana is often compared to which French dessert?", answer: "Creme brulee", wrong: ["Panna cotta", "Mousse au chocolat", "Ile flottante"] },
  { question: "What is sofrito, a base widely used in Spanish cooking?", answer: "Slowly cooked onion, garlic, and tomato sauce", wrong: ["Herb oil with garlic", "Vinegar and pepper marinade", "Spiced meat drippings"] },
  { question: "Cava is a Spanish sparkling wine produced primarily in which region?", answer: "Catalonia", wrong: ["Rioja", "Ribera del Duero", "Priorat"] },
  { question: "Salmorejo is a thick cold soup similar to gazpacho but made with mostly?", answer: "Tomato and bread", wrong: ["Cucumber and pepper", "Watermelon and tomato", "Carrot and ginger"] },
  { question: "What is albondigas in Spanish cuisine?", answer: "Meatballs in sauce", wrong: ["Stuffed peppers", "Fried sardines", "Breaded veal cutlets"] },
  { question: "Turron is a traditional Spanish sweet most enjoyed at which time of year?", answer: "Christmas", wrong: ["Easter", "Carnival", "Summer festivals"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: SpanishCuisineQuizSettings): SpanishCuisineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(item.wrong, rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: SpanishCuisineQuizState, action: SpanishCuisineQuizAction): SpanishCuisineQuizState {
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

export function isTerminal(state: SpanishCuisineQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
