import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ThaiCuisineQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface ThaiCuisineQuizState { settings: ThaiCuisineQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type ThaiCuisineQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "What are the four key flavors that Thai cuisine aims to balance?", answer: "Sweet, sour, salty, and spicy", wrong: ["Bitter, sour, salty, umami", "Sweet, bitter, salty, spicy", "Sour, umami, spicy, savory"] },
  { question: "Pad Thai is made with which type of noodle?", answer: "Rice noodles", wrong: ["Egg noodles", "Glass noodles", "Wheat noodles"] },
  { question: "What herb is essential to Thai green curry?", answer: "Fresh basil and kaffir lime leaves", wrong: ["Cilantro and lemongrass", "Mint and galangal", "Pandanus and turmeric"] },
  { question: "Tom Kha Gai is a Thai soup made with which distinctive ingredient?", answer: "Coconut milk and galangal", wrong: ["Tamarind and palm sugar", "Fish sauce and lime", "Shrimp paste and chili"] },
  { question: "Som tam is a Thai green papaya salad from which region?", answer: "Northeastern Thailand (Isaan)", wrong: ["Southern Thailand", "Central Thailand", "Northern Thailand"] },
  { question: "What is the primary protein source in traditional Pad Thai?", answer: "Shrimp or tofu", wrong: ["Chicken", "Pork", "Beef"] },
  { question: "Khao pad is the Thai name for which popular dish?", answer: "Fried rice", wrong: ["Sticky rice", "Rice congee", "Steamed jasmine rice"] },
  { question: "What gives Thai green curry its green color?", answer: "Fresh green chilis and herbs", wrong: ["Spinach puree", "Green cardamom", "Kaffir lime rind"] },
  { question: "Massaman curry is distinctive because it incorporates spices from which tradition?", answer: "Indian Muslim cuisine", wrong: ["Chinese five spice", "Malaysian bumbu", "Persian spice routes"] },
  { question: "What is mango sticky rice typically served with?", answer: "Coconut cream sauce", wrong: ["Palm sugar syrup", "Sweetened condensed milk", "Honey and sesame"] },
  { question: "Larb is a minced meat salad most commonly associated with which region?", answer: "Northern Thailand and Laos", wrong: ["Southern Thailand", "Bangkok", "Cambodia border region"] },
  { question: "What gives Thai fish sauce its pungent flavor?", answer: "Fermented anchovies and salt", wrong: ["Dried shrimp and vinegar", "Fermented shrimp paste", "Salted mackerel brine"] },
  { question: "Kanom jeen is Thai fermented rice noodles traditionally served at what events?", answer: "Festivals and Buddhist ceremonies", wrong: ["Funerals only", "Royal banquets", "Morning markets"] },
  { question: "Satay is commonly served with which sauce in Thai cuisine?", answer: "Peanut sauce", wrong: ["Sweet chili sauce", "Tamarind dip", "Fish sauce and lime"] },
  { question: "What is the traditional Thai dessert made from glutinous rice and coconut?", answer: "Sticky rice in bamboo", wrong: ["Rice pudding with banana", "Tapioca with palm sugar", "Coconut jelly with fruit"] },
  { question: "Boat noodles (kuay teow rua) get their name from where?", answer: "Being sold from boats on Bangkok canals", wrong: ["The shape of the bowl", "A region called Rua", "The noodle's curved shape"] },
  { question: "What makes Thai basil different from Italian basil?", answer: "Anise-like flavor and purple stems", wrong: ["It has smaller leaves", "It grows near rice paddies", "It has a citrus scent"] },
  { question: "Gaeng daeng is the Thai name for which color curry?", answer: "Red curry", wrong: ["Green curry", "Yellow curry", "Orange curry"] },
  { question: "What is a common snack made from dried squid in Thailand?", answer: "Grilled seasoned squid strips", wrong: ["Squid tempura", "Calamari fritto", "Squid ink crackers"] },
  { question: "Roti in Thai cuisine is a fried flatbread typically served with?", answer: "Condensed milk or banana filling", wrong: ["Green curry sauce", "Spicy dipping sauce", "Coconut soup"] },
  { question: "Pad See Ew is stir-fried with which type of noodle?", answer: "Wide flat rice noodles", wrong: ["Thin rice vermicelli", "Egg noodles", "Glass noodles"] },
  { question: "What is the Thai name for the chili-lime dipping condiment with fish sauce?", answer: "Nam pla prik", wrong: ["Nam jim", "Nam prik pao", "Nam tok"] },
  { question: "Khao soi is a coconut curry noodle soup from which region?", answer: "Northern Thailand (Chiang Mai)", wrong: ["Southern Thailand", "Central Thailand", "Isaan"] },
  { question: "What protein traditionally tops a bowl of khao soi?", answer: "Braised chicken or beef", wrong: ["Shrimp", "Duck", "Tofu"] },
  { question: "Yum nua is a Thai salad featuring which main ingredient?", answer: "Grilled beef", wrong: ["Squid", "Glass noodles", "Papaya"] },
  { question: "What is the Thai sweet shaved-ice dessert with toppings called?", answer: "Nam kang sai", wrong: ["Bua loi", "Khanom krok", "Sangkaya"] },
  { question: "Tom yum gets its sour note primarily from which ingredient?", answer: "Lime juice and tamarind", wrong: ["Vinegar", "Green mango", "Lemon zest"] },
  { question: "What does the Thai word phat (pad) mean?", answer: "Stir-fried", wrong: ["Steamed", "Grilled", "Boiled"] },
  { question: "Khanom krok are small coconut pancakes cooked in what?", answer: "A dimpled cast-iron griddle", wrong: ["A bamboo steamer", "A clay tandoor", "A flat skillet"] },
  { question: "Pla pao is a Thai street-food dish of fish prepared how?", answer: "Salt-crusted and grilled over charcoal", wrong: ["Steamed in banana leaf", "Deep-fried whole", "Poached in coconut milk"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: ThaiCuisineQuizSettings): ThaiCuisineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(item.wrong, rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: ThaiCuisineQuizState, action: ThaiCuisineQuizAction): ThaiCuisineQuizState {
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

export function isTerminal(state: ThaiCuisineQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
