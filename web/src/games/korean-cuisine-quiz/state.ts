import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface KoreanCuisineQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface KoreanCuisineQuizState { settings: KoreanCuisineQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type KoreanCuisineQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "Kimchi is made from which fermented vegetable most commonly?", answer: "Cabbage", wrong: ["Radish", "Cucumber", "Bok choy"] },
  { question: "Bibimbap means what in Korean?", answer: "Mixed rice", wrong: ["Spicy stew", "Cold noodles", "Rice soup"] },
  { question: "What is the spicy red pepper paste central to Korean cooking?", answer: "Gochujang", wrong: ["Doenjang", "Ssamjang", "Ganjang"] },
  { question: "Bulgogi is a Korean dish made from what type of meat?", answer: "Thinly sliced marinated beef", wrong: ["Pork belly", "Chicken thighs", "Lamb ribs"] },
  { question: "Korean BBQ (KBBQ) is typically cooked how?", answer: "On a grill built into the dining table", wrong: ["In a clay pot in the kitchen", "In a stone oven", "Over an open fire pit"] },
  { question: "Samgyeopsal is Korean grilled pork belly usually served with what?", answer: "Lettuce wraps and garlic", wrong: ["Rice and kimchi only", "Noodles and sauce", "Steamed buns"] },
  { question: "What is doenjang?", answer: "Korean fermented soybean paste", wrong: ["Korean soy sauce", "Fermented rice wine", "Salted sesame oil"] },
  { question: "Japchae is a Korean dish made with which type of noodle?", answer: "Glass noodles made from sweet potato starch", wrong: ["Rice noodles", "Wheat noodles", "Buckwheat noodles"] },
  { question: "What is sundubu jjigae?", answer: "Soft tofu stew", wrong: ["Pork rib soup", "Fermented cabbage soup", "Beef bone broth"] },
  { question: "Korean fried chicken (yangnyeom chicken) is known for being coated twice in what?", answer: "Batter for extra crispiness", wrong: ["Cornstarch alone", "Rice flour only", "Panko breadcrumbs"] },
  { question: "Tteokbokki are spicy stir-fried what?", answer: "Rice cakes", wrong: ["Fish cakes", "Pork dumplings", "Potato noodles"] },
  { question: "Galbitang is a Korean soup made from which meat?", answer: "Beef short ribs", wrong: ["Pork spine", "Chicken feet", "Oxtail"] },
  { question: "What is makgeolli?", answer: "Traditional Korean rice wine", wrong: ["Barley beer", "Fermented plum liquor", "Distilled grain spirit"] },
  { question: "Haemul pajeon is a Korean pancake made with what?", answer: "Seafood and green onion", wrong: ["Kimchi and pork", "Mung bean and pork", "Zucchini and beef"] },
  { question: "What is the traditional Korean stone pot used to serve bibimbap?", answer: "Dolsot", wrong: ["Onggi", "Ttukbaegi", "Gamasot"] },
  { question: "Ramyeon is the Korean version of which dish?", answer: "Instant ramen noodles", wrong: ["Cold buckwheat noodles", "Thick udon noodles", "Hand-pulled noodles"] },
  { question: "Bokkeumbap is the Korean word for what dish?", answer: "Fried rice", wrong: ["Rice porridge", "Steamed rice rolls", "Rice noodle soup"] },
  { question: "What is the main vegetable used in oi sobagi?", answer: "Cucumber", wrong: ["Radish", "Spinach", "Bean sprouts"] },
  { question: "Soju is a Korean distilled spirit traditionally made from which ingredient?", answer: "Rice, wheat, or barley", wrong: ["Yams and corn", "Millet and sorghum", "Sugar cane"] },
  { question: "What is the significance of seolleongtang in Korean cuisine?", answer: "Long-simmered ox bone soup eaten for centuries", wrong: ["A royal court feast dish", "A Buddhist temple soup", "A harvest festival meal"] },
  { question: "What is the Korean side dish category that includes kimchi and pickled vegetables?", answer: "Banchan", wrong: ["Anju", "Jeotgal", "Namul"] },
  { question: "Naengmyeon is a Korean dish of what?", answer: "Cold buckwheat noodles in broth", wrong: ["Hot wheat noodles", "Stir-fried glass noodles", "Spicy rice noodles"] },
  { question: "What is gimbap?", answer: "Seaweed-wrapped rice rolls with fillings", wrong: ["Fried rice balls", "Steamed rice cakes", "Rice porridge"] },
  { question: "Mandu is the Korean name for what?", answer: "Dumplings", wrong: ["Rice cakes", "Pancakes", "Steamed buns"] },
  { question: "What ingredient gives gochugaru its color and heat?", answer: "Korean red chili pepper flakes", wrong: ["Smoked paprika", "Cayenne", "Sichuan peppercorn"] },
  { question: "Kalbi refers to which cut of meat?", answer: "Marinated beef short ribs", wrong: ["Pork shoulder", "Chicken thigh", "Beef brisket"] },
  { question: "What is samgyetang traditionally eaten to combat?", answer: "Summer heat (boknal)", wrong: ["Winter cold", "Spring fatigue", "Autumn dryness"] },
  { question: "Jjajangmyeon is a Korean-Chinese noodle dish topped with what sauce?", answer: "Black bean sauce", wrong: ["Sweet chili sauce", "Soy garlic sauce", "Spicy bean paste"] },
  { question: "What is hoeddeok?", answer: "A sweet stuffed Korean pancake", wrong: ["A spicy fish cake", "A savory dumpling", "A rice porridge"] },
  { question: "Banchan are typically served how?", answer: "Many small dishes shared at the table", wrong: ["One large platter per person", "Sequentially as courses", "Only with rice porridge"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: KoreanCuisineQuizSettings): KoreanCuisineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(item.wrong, rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: KoreanCuisineQuizState, action: KoreanCuisineQuizAction): KoreanCuisineQuizState {
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

export function isTerminal(state: KoreanCuisineQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
