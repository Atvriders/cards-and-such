import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MexicanCuisineQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface MexicanCuisineQuizState { settings: MexicanCuisineQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type MexicanCuisineQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "What type of corn dough is used to make tamales?", answer: "Masa", wrong: ["Hominy", "Cornmeal", "Polenta"] },
  { question: "Mole negro is a complex sauce that famously includes which unusual ingredient?", answer: "Dark chocolate", wrong: ["Coffee", "Vanilla", "Cinnamon"] },
  { question: "Chiles en nogada is a patriotic Mexican dish representing the colors of which flag?", answer: "Mexican flag", wrong: ["Spanish flag", "Aztec banner", "American flag"] },
  { question: "What is the primary difference between a burrito and a taco?", answer: "A burrito uses a flour tortilla, a taco uses corn or flour", wrong: ["Burritos are always fried", "Tacos always have cheese", "Burritos contain beans only"] },
  { question: "Pozole is a traditional soup made from which main ingredient?", answer: "Hominy corn", wrong: ["Black beans", "Chickpeas", "Lentils"] },
  { question: "Which Mexican state is famous for its mezcal production?", answer: "Oaxaca", wrong: ["Jalisco", "Puebla", "Yucatan"] },
  { question: "Tlayuda is a large tortilla dish associated with which Mexican state?", answer: "Oaxaca", wrong: ["Guerrero", "Chiapas", "Veracruz"] },
  { question: "What herb is used to make the classic green salsa verde?", answer: "Tomatillos", wrong: ["Cilantro", "Epazote", "Serrano pepper"] },
  { question: "Cochinita pibil is a slow-roasted pork dish from which Mexican region?", answer: "Yucatan Peninsula", wrong: ["Baja California", "Veracruz", "Sonora"] },
  { question: "What is the traditional Mexican celebration that features sugar skulls and pan de muerto?", answer: "Day of the Dead", wrong: ["Cinco de Mayo", "Carnival", "Christmas"] },
  { question: "Horchata is a Mexican drink made from which ingredient?", answer: "Rice and cinnamon", wrong: ["Corn and vanilla", "Oats and sugar", "Almond and milk"] },
  { question: "Tequila must be produced in which Mexican state to bear the name?", answer: "Jalisco", wrong: ["Oaxaca", "Nayarit", "Michoacan"] },
  { question: "What type of pepper is used to make chipotle?", answer: "Smoked dried jalapeno", wrong: ["Dried ancho chile", "Dried serrano", "Dried habanero"] },
  { question: "Torta ahogada is a drowned sandwich specialty from which Mexican city?", answer: "Guadalajara", wrong: ["Mexico City", "Monterrey", "Puebla"] },
  { question: "What is the Mexican flatbread used in most dishes?", answer: "Tortilla", wrong: ["Sope", "Tostada", "Tlayuda"] },
  { question: "Guacamole is made primarily from which fruit?", answer: "Avocado", wrong: ["Tomatillo", "Plantain", "Papaya"] },
  { question: "Which Mexican city is famous for mole poblano?", answer: "Puebla", wrong: ["Oaxaca", "Mexico City", "Guadalajara"] },
  { question: "What makes a chile relleno unique among Mexican dishes?", answer: "It is a stuffed and battered fried pepper", wrong: ["It is a roasted whole chili", "It is a chili-infused soup", "It is a dried chili sauce"] },
  { question: "Cemita is a sandwich style from which Mexican city?", answer: "Puebla", wrong: ["Oaxaca", "Veracruz", "Mexico City"] },
  { question: "Tacos al pastor are inspired by which immigrant community's cooking style?", answer: "Lebanese immigrants", wrong: ["Spanish immigrants", "German immigrants", "Chinese immigrants"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: MexicanCuisineQuizSettings): MexicanCuisineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(item.wrong, rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: MexicanCuisineQuizState, action: MexicanCuisineQuizAction): MexicanCuisineQuizState {
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

export function isTerminal(state: MexicanCuisineQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
