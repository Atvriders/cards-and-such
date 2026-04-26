import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BrazilianCuisineQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface BrazilianCuisineQuizState { settings: BrazilianCuisineQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type BrazilianCuisineQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "Feijoada is considered Brazil's national dish. What is it made from?", answer: "Black bean stew with pork", wrong: ["Cassava soup with beef", "Rice and chicken stew", "Lentil stew with sausage"] },
  { question: "Churrasco is the Brazilian name for what style of cooking?", answer: "Wood-fire or charcoal grilled meat", wrong: ["Slow-braised meats", "Marinated fried meats", "Steamed meats"] },
  { question: "What is pao de queijo?", answer: "Brazilian cheese bread made from cassava flour", wrong: ["Cornbread with cheese", "Wheat rolls with cream cheese", "Fried dough with cheese filling"] },
  { question: "Brigadeiro is a popular Brazilian sweet made from what?", answer: "Condensed milk, cocoa, and chocolate sprinkles", wrong: ["Caramelized sugar and cream", "Coconut milk and coconut flakes", "Almond paste and cinnamon"] },
  { question: "Caipirinha is Brazil's national cocktail made with which spirit?", answer: "Cachaca", wrong: ["Rum", "Pisco", "Vodka"] },
  { question: "Moqueca is a Brazilian fish stew from which region?", answer: "Bahia and Espirito Santo", wrong: ["Rio de Janeiro", "Sao Paulo", "Amazonas"] },
  { question: "What is tucupi, an ingredient in Amazonian cuisine?", answer: "Fermented cassava juice", wrong: ["Wild river fish sauce", "Palm heart extract", "Guarana syrup"] },
  { question: "Coxinha is a popular Brazilian street food shaped like what?", answer: "A teardrop or chicken thigh shape", wrong: ["A crescent", "A cylinder", "A flat disc"] },
  { question: "What is tapioca in Brazilian cuisine?", answer: "A flatbread made from cassava starch", wrong: ["A pudding made from rice", "A fermented drink", "A type of sticky rice cake"] },
  { question: "Acaraje is a Bahian street food made from black-eyed peas fried in?", answer: "Dende (palm oil)", wrong: ["Coconut oil", "Vegetable oil", "Lard"] },
  { question: "Guarana is a Brazilian fruit used commonly in what?", answer: "Soft drinks and energy beverages", wrong: ["Traditional stews", "Fruit desserts", "Salad dressings"] },
  { question: "Picanha is a popular cut of beef in Brazilian churrasco from which part?", answer: "Sirloin cap (rump)", wrong: ["Rib eye", "T-bone", "Chuck"] },
  { question: "What is farofa, commonly served alongside feijoada?", answer: "Toasted cassava flour mixture", wrong: ["Fried cornmeal", "Roasted breadcrumbs", "Ground plantain"] },
  { question: "Acai bowls are made from berries from which region of Brazil?", answer: "Amazon rainforest", wrong: ["Cerrado savanna", "Atlantic coast", "Pantanal wetlands"] },
  { question: "Quindim is a Brazilian dessert made primarily from what?", answer: "Egg yolks, sugar, and coconut", wrong: ["Condensed milk and agar", "Corn and vanilla custard", "Tapioca and guava paste"] },
  { question: "Vatapa is a creamy paste dish from Bahia made with bread and?", answer: "Shrimp, peanuts, and coconut milk", wrong: ["Fish, cashews, and palm oil", "Crab, almonds, and cream", "Lobster, walnuts, and butter"] },
  { question: "What is caldo verde-inspired soup adapted to Brazilian cooking called?", answer: "Caldo de couve", wrong: ["Sopa de mandioca", "Caldo verde baiano", "Feijao tropeiro"] },
  { question: "Pastel is a Brazilian fried pastry traditionally filled with what?", answer: "Cheese and meat", wrong: ["Sweet potato and cinnamon", "Bean paste and sugar", "Cream and guava"] },
  { question: "Beijinho is a Brazilian sweet similar to brigadeiro but made with?", answer: "Coconut instead of cocoa", wrong: ["Caramel and toffee", "Strawberry and cream", "Banana and vanilla"] },
  { question: "What Portuguese-influenced cooking tradition is evident in Brazilian cuisine?", answer: "Use of olive oil, codfish, and egg-based sweets", wrong: ["Preference for raw fish", "Heavy use of saffron", "Clay pot slow cooking"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: BrazilianCuisineQuizSettings): BrazilianCuisineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(item.wrong, rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: BrazilianCuisineQuizState, action: BrazilianCuisineQuizAction): BrazilianCuisineQuizState {
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

export function isTerminal(state: BrazilianCuisineQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
