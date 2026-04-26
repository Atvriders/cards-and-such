import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface JapaneseCuisineQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface JapaneseCuisineQuizState { settings: JapaneseCuisineQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type JapaneseCuisineQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "What is the difference between sushi and sashimi?", answer: "Sushi includes vinegared rice, sashimi is raw fish alone", wrong: ["Sashimi is cooked, sushi is raw", "Sushi uses saltwater fish, sashimi freshwater", "They are identical"] },
  { question: "What is umami, the fifth taste, associated with in Japanese cooking?", answer: "Savory depth from glutamates", wrong: ["Spicy heat from peppers", "Sourness from fermentation", "Sweetness from mirin"] },
  { question: "Dashi is a Japanese stock made primarily from what?", answer: "Kombu and bonito flakes", wrong: ["Chicken bones and vegetables", "Pork and soy", "Miso and tofu"] },
  { question: "What is the main ingredient in Japanese tempura?", answer: "Battered and deep-fried seafood or vegetables", wrong: ["Grilled fish on skewers", "Simmered vegetables in dashi", "Stir-fried meat and noodles"] },
  { question: "Yakitori refers to what type of food?", answer: "Grilled chicken skewers", wrong: ["Grilled pork slices", "Steamed dumplings", "Battered fried shrimp"] },
  { question: "What is miso paste made from?", answer: "Fermented soybeans and salt", wrong: ["Ground sesame seeds", "Fermented rice and barley", "Dried fish powder"] },
  { question: "Tonkatsu is a Japanese dish of what?", answer: "Breaded and deep-fried pork cutlet", wrong: ["Grilled chicken thigh", "Steamed pork belly", "Pan-fried beef patty"] },
  { question: "What type of noodle is used in ramen?", answer: "Wheat noodles", wrong: ["Buckwheat noodles", "Rice noodles", "Glass noodles"] },
  { question: "What is the function of wasabi in sushi?", answer: "Antibacterial agent and condiment", wrong: ["Thickening the sauce", "Coloring the rice", "Preserving the fish"] },
  { question: "Onigiri is a Japanese food made of rice formed into what shape?", answer: "Triangle or ball", wrong: ["Log roll", "Flat circle", "Square patty"] },
  { question: "What is the Japanese term for the art of food presentation?", answer: "Moritsuke", wrong: ["Ikebana", "Omakase", "Kaiseki"] },
  { question: "Shabu-shabu is a type of Japanese hot pot where meat is cooked how?", answer: "Briefly swirled in simmering broth", wrong: ["Deep-fried in oil", "Grilled at the table", "Steamed in bamboo"] },
  { question: "What is natto, a traditional Japanese breakfast food?", answer: "Fermented soybeans with strong smell and sticky texture", wrong: ["Pickled bamboo shoots", "Dried kelp strips", "Salted fish roe"] },
  { question: "Okonomiyaki is often described as a Japanese savory?", answer: "Pancake", wrong: ["Dumpling", "Crepe", "Flatbread"] },
  { question: "What is the Japanese seven-spice blend called?", answer: "Shichimi togarashi", wrong: ["Furikake", "Karashi", "Ponzu"] },
  { question: "Karaage is a Japanese cooking method where chicken is?", answer: "Marinated and deep-fried", wrong: ["Grilled over charcoal", "Steamed in foil", "Simmered in soy sauce"] },
  { question: "What is the traditional Japanese New Year's dish?", answer: "Osechi ryori", wrong: ["Toshi koshi soba", "Mochi soup", "Zoni stew"] },
  { question: "Tamagoyaki is a Japanese dish made from what?", answer: "Rolled layered egg omelette", wrong: ["Scrambled egg on rice", "Soft-boiled seasoned egg", "Poached egg in broth"] },
  { question: "Kaiseki is a traditional Japanese multicourse meal associated with which culture?", answer: "Tea ceremony culture", wrong: ["Sumo wrestler diet", "Buddhist temple cuisine", "Samurai feast tradition"] },
  { question: "What gives green tea its distinct astringent flavor?", answer: "Catechins and tannins", wrong: ["Caffeine", "Chlorophyll", "Amino acids"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: JapaneseCuisineQuizSettings): JapaneseCuisineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(item.wrong, rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: JapaneseCuisineQuizState, action: JapaneseCuisineQuizAction): JapaneseCuisineQuizState {
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

export function isTerminal(state: JapaneseCuisineQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
