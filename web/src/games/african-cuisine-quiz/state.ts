import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AfricanCuisineQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface AfricanCuisineQuizState { settings: AfricanCuisineQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type AfricanCuisineQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "Injera is a spongy sourdough flatbread from which country?", answer: "Ethiopia", wrong: ["Somalia", "Kenya", "Sudan"] },
  { question: "Jollof rice is most closely associated with which region?", answer: "West Africa", wrong: ["East Africa", "North Africa", "Southern Africa"] },
  { question: "What is the main protein in Nigerian egusi soup?", answer: "Ground melon seeds", wrong: ["Groundnuts", "Palm oil", "Smoked fish"] },
  { question: "Tagine is a slow-cooked stew from which North African country?", answer: "Morocco", wrong: ["Egypt", "Tunisia", "Algeria"] },
  { question: "Biltong is a dried cured meat originating from which country?", answer: "South Africa", wrong: ["Zimbabwe", "Botswana", "Namibia"] },
  { question: "Fufu is a starchy staple eaten with the hands in which region?", answer: "West Africa", wrong: ["East Africa", "Central Africa", "North Africa"] },
  { question: "Bunny chow is a curry-filled bread dish from which country?", answer: "South Africa", wrong: ["Mozambique", "Tanzania", "Kenya"] },
  { question: "Harissa is a spicy paste originating from which country?", answer: "Tunisia", wrong: ["Morocco", "Libya", "Algeria"] },
  { question: "What grain is teff, used to make injera?", answer: "An ancient Ethiopian cereal grain", wrong: ["Millet", "Sorghum", "Amaranth"] },
  { question: "Suya is a spiced grilled meat skewer from which country?", answer: "Nigeria", wrong: ["Ghana", "Senegal", "Cameroon"] },
  { question: "Couscous is a staple grain dish associated with which region?", answer: "North Africa", wrong: ["West Africa", "East Africa", "Central Africa"] },
  { question: "Piri piri sauce originates from which country?", answer: "Mozambique", wrong: ["Angola", "South Africa", "Zimbabwe"] },
  { question: "What is ugali, a staple in East African cuisine?", answer: "Stiff maize porridge", wrong: ["Fermented millet cake", "Steamed yam", "Cassava bread"] },
  { question: "Koshari is a popular street food from which country?", answer: "Egypt", wrong: ["Sudan", "Libya", "Morocco"] },
  { question: "Which spice blend is central to Ethiopian cuisine?", answer: "Berbere", wrong: ["Ras el hanout", "Za'atar", "Chermoula"] },
  { question: "Chakalaka is a spicy vegetable relish from which country?", answer: "South Africa", wrong: ["Lesotho", "Swaziland", "Malawi"] },
  { question: "What is the main flavor in Moroccan preserved lemons?", answer: "Salt and citrus", wrong: ["Sweet and tangy", "Spicy and sour", "Herbal and bitter"] },
  { question: "Mafe is a peanut stew associated with which country?", answer: "Senegal", wrong: ["Gambia", "Guinea", "Mali"] },
  { question: "Which East African staple is made from matoke?", answer: "Cooked green banana", wrong: ["Boiled cassava", "Steamed yam", "Dried plantain"] },
  { question: "Mechoui refers to what style of cooking in North Africa?", answer: "Whole roasted lamb", wrong: ["Slow-stewed chicken", "Grilled fish", "Clay pot vegetables"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: AfricanCuisineQuizSettings): AfricanCuisineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(item.wrong, rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: AfricanCuisineQuizState, action: AfricanCuisineQuizAction): AfricanCuisineQuizState {
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

export function isTerminal(state: AfricanCuisineQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
