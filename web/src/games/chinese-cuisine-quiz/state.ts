import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ChineseCuisineQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface ChineseCuisineQuizState { settings: ChineseCuisineQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type ChineseCuisineQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "Peking duck originates from which Chinese city?", answer: "Beijing", wrong: ["Shanghai", "Guangzhou", "Nanjing"] },
  { question: "What is the key ingredient that makes mapo tofu unique?", answer: "Tofu and ground meat in spicy sauce", wrong: ["Fermented black bean curd", "Silken tofu in broth", "Fried tofu with vegetables"] },
  { question: "Dim sum is a tradition associated with which meal time?", answer: "Brunch or late morning", wrong: ["Dinner", "Late night snack", "Midnight feast"] },
  { question: "What is the traditional Chinese cooking vessel with a round bottom?", answer: "Wok", wrong: ["Claypot", "Iron skillet", "Bamboo steamer"] },
  { question: "Char siu refers to what type of food preparation?", answer: "Cantonese BBQ pork", wrong: ["Steamed pork buns", "Stir-fried pork belly", "Braised pork shoulder"] },
  { question: "What makes Sichuan cuisine distinct from other Chinese regional cuisines?", answer: "Numbing spiciness from Sichuan peppercorns", wrong: ["Sweetness from rice wine", "Saltiness from soy", "Sourness from vinegar"] },
  { question: "Hot pot is a Chinese cooking style where diners cook food in what?", answer: "Simmering broth at the table", wrong: ["A clay oven", "A dry wok", "An earthenware pot in an oven"] },
  { question: "What are xiaolongbao?", answer: "Soup dumplings", wrong: ["Steamed buns", "Crispy wontons", "Pan-fried dumplings"] },
  { question: "Century eggs are preserved eggs with what distinctive appearance?", answer: "Dark green or black interior", wrong: ["Bright orange yolk", "Translucent white", "Creamy yellow center"] },
  { question: "Lo mein and chow mein differ mainly in how the noodles are?", answer: "Lo mein is soft-tossed, chow mein is pan-fried crispy", wrong: ["Lo mein is rice-based, chow mein is wheat-based", "Lo mein uses thick noodles, chow mein uses thin", "They are identical"] },
  { question: "What sauce is central to Peking duck's serving tradition?", answer: "Hoisin sauce with scallions in crepes", wrong: ["Oyster sauce with ginger", "Sweet chili with cucumber", "Soy sauce with vinegar"] },
  { question: "General Tso's chicken was actually created in which country?", answer: "United States", wrong: ["Taiwan", "Mainland China", "Hong Kong"] },
  { question: "What is congee in Chinese cuisine?", answer: "Rice porridge", wrong: ["Mung bean soup", "Glutinous rice cake", "Fermented rice drink"] },
  { question: "Shanghainese cuisine is known for which cooking technique?", answer: "Red braising (hong shao)", wrong: ["Deep frying", "Dry roasting", "High-heat stir-frying"] },
  { question: "What are the four main regional schools of Chinese cuisine?", answer: "Cantonese, Shandong, Huaiyang, and Sichuan", wrong: ["Beijing, Shanghai, Wuhan, and Guangzhou", "Chongqing, Fujian, Yunnan, and Xinjiang", "Northern, Southern, Eastern, Western"] },
  { question: "Wonton soup is made with dumplings in what type of broth?", answer: "Light pork or chicken broth", wrong: ["Spicy Sichuan broth", "Miso broth", "Rich beef bone broth"] },
  { question: "What is the traditional Chinese method of cooking using smoke and spices?", answer: "Tea smoking", wrong: ["Clay sealing", "Wok charring", "Rice smoking"] },
  { question: "Five-spice powder typically includes which combination?", answer: "Star anise, cloves, cinnamon, Sichuan pepper, fennel seeds", wrong: ["Ginger, garlic, cumin, coriander, chili", "Turmeric, cardamom, pepper, mustard, curry"] },
  { question: "What is a scallion pancake (cong you bing)?", answer: "Flaky pan-fried flatbread with scallions", wrong: ["Steamed scallion bun", "Fried wonton wrapper with chives", "Crispy egg crepe with spring onion"] },
  { question: "What city is famous for its sweet and vinegar-braised pork ribs?", answer: "Shanghai", wrong: ["Suzhou", "Hangzhou", "Wuxi"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: ChineseCuisineQuizSettings): ChineseCuisineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(item.wrong, rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: ChineseCuisineQuizState, action: ChineseCuisineQuizAction): ChineseCuisineQuizState {
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

export function isTerminal(state: ChineseCuisineQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
