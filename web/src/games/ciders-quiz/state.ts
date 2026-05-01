import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CidersQuizSettings { questionCount: "5" | "10" | "15"; }

export interface QuizEntry { question: string; answer: string; choices: string[]; }

export interface CidersQuizState {
  settings: CidersQuizSettings;
  entries: QuizEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type CidersQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string }[] = [
  { question: "What is the main ingredient in traditional apple cider?", answer: "Fermented Apple Juice" },
  { question: "Which English county is famous for its dry, tannic farmhouse ciders?", answer: "Herefordshire" },
  { question: "What French region produces Calvados and is famous for cider?", answer: "Normandy" },
  { question: "Which cider style is made exclusively from one apple variety?", answer: "Single Varietal Cider" },
  { question: "What is the process of allowing cider to re-ferment in the bottle called?", answer: "Méthode Traditionnelle" },
  { question: "Which fruit is used to make perry, a cider-like drink?", answer: "Pears" },
  { question: "What style of cider uses wild/natural yeast rather than commercial yeast?", answer: "Wild-Fermented Cider" },
  { question: "Which term describes cider that has been pasteurized and filtered?", answer: "Commercial / Processed Cider" },
  { question: "What is 'keeving' in cider-making?", answer: "A technique to naturally arrest fermentation for sweetness" },
  { question: "Which Spanish region produces Sidra, a traditional still, tart cider?", answer: "Asturias" },
  { question: "What tannin-rich apple variety is traditionally used in English cider?", answer: "Bittersweet / Bittersharp Apple" },
  { question: "Which term describes the layer of yeast that settles at the bottom of cider tanks?", answer: "Lees" },
  { question: "What is the alcoholic strength range of most commercial hard ciders?", answer: "4–8% ABV" },
  { question: "Which American state is known as the cradle of craft cider production?", answer: "Vermont" },
  { question: "What is ice cider (cidre de glace)?", answer: "Cider made from concentrated frozen apple juice" },
  { question: "Which traditional British farmhouse cider was called 'scrumpy'?", answer: "Rough Unfiltered Farmhouse Cider" },
  { question: "What gives some ciders a honey-like or floral aroma?", answer: "Aromatic Apple Varieties / Yeast Esters" },
  { question: "Which country is the largest per-capita consumer of cider in the world?", answer: "United Kingdom" },
  { question: "What device is used to press apples into juice for cider-making?", answer: "Cider Press" },
  { question: "Which low-alcohol cider variant is popular in the UK as a casual drink?", answer: "Session Cider (under 4% ABV)" },
  { question: "What apple brandy is distilled from cider in Normandy?", answer: "Calvados" },
  { question: "Which American apple brandy is similar to Calvados?", answer: "Applejack" },
  { question: "What is the Spanish word for cider?", answer: "Sidra" },
  { question: "Which traditional pouring style splashes Asturian sidra from height?", answer: "Escanciar" },
  { question: "What term describes a cider with no residual sugar?", answer: "Dry Cider" },
  { question: "What is the leftover apple pulp after pressing called?", answer: "Pomace" },
  { question: "Which French region of Brittany is famous for Cidre Breton?", answer: "Brittany" },
  { question: "What does ABV measure in a cider?", answer: "Alcohol By Volume" },
  { question: "Which cider style adds hops for an aromatic, bitter character?", answer: "Hopped Cider" },
  { question: "What is the bottled-conditioned naturally sparkling cider style called?", answer: "Methode Traditionnelle" },
];

const DISTRACTORS = ["Sweet Cider","Dry Cider","Fruit Cider","Hard Cider","Rosé Cider","Barrel-Aged Cider","Hopped Cider","Spiced Cider","Ice Cider","Perry","Pear Cider","Calvados","Applejack","Pomace","Scrumpy","Keeving","Wild Cider","Heritage Cider","Craft Cider","Still Cider"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: CidersQuizSettings): CidersQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(DISTRACTORS.filter(d => d !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: CidersQuizState, action: CidersQuizAction): CidersQuizState {
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

export function isTerminal(state: CidersQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
