import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface WinesQuizSettings { questionCount: "5" | "10" | "15"; }

export interface QuizEntry { question: string; answer: string; choices: string[]; }

export interface WinesQuizState {
  settings: WinesQuizSettings;
  entries: QuizEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type WinesQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string }[] = [
  { question: "Which grape variety produces Bordeaux's Château Pétrus?", answer: "Merlot" },
  { question: "What French region is famous for Chardonnay and Pinot Noir?", answer: "Burgundy (Bourgogne)" },
  { question: "Which sparkling wine comes only from the Champagne region of France?", answer: "Champagne" },
  { question: "What Italian red wine is made from Nebbiolo grapes?", answer: "Barolo" },
  { question: "Which Spanish wine comes from the Rioja region and is made from Tempranillo?", answer: "Rioja" },
  { question: "What is the primary grape in a White Burgundy (Bourgogne Blanc)?", answer: "Chardonnay" },
  { question: "Which wine style is made from grapes affected by noble rot (Botrytis)?", answer: "Sauternes" },
  { question: "What New Zealand wine region is famous for Sauvignon Blanc?", answer: "Marlborough" },
  { question: "Which Italian wine uses the term 'Classico' to denote its historic core zone?", answer: "Chianti Classico" },
  { question: "What grape produces the deep, tannic reds of Barossa Valley, Australia?", answer: "Shiraz (Syrah)" },
  { question: "Which German wine classification is the highest quality tier?", answer: "Prädikatswein" },
  { question: "What fortified wine from Porto, Portugal comes in Ruby and Tawny styles?", answer: "Port" },
  { question: "Which wine is made from frozen grapes harvested in winter?", answer: "Icewine (Eiswein)" },
  { question: "What region produces Napa Valley Cabernet Sauvignon?", answer: "California, USA" },
  { question: "Which light, peppery red wine is made from Gamay grapes?", answer: "Beaujolais" },
  { question: "What pink wine is made by limited skin contact with red grapes?", answer: "Rosé" },
  { question: "Which Argentine wine region is famous for Malbec at high altitude?", answer: "Mendoza" },
  { question: "What wine style has been oxidized intentionally for a nutty flavor?", answer: "Sherry (Oxidized)" },
  { question: "Which Italian sparkling wine uses Glera grapes and is lighter than Champagne?", answer: "Prosecco" },
  { question: "What term describes a wine aged in wood for at least two years in Spain?", answer: "Reserva" },
  { question: "What grape is the principal red of Tuscany's Chianti?", answer: "Sangiovese" },
  { question: "Which sweet, fortified wine is produced on the island of Madeira?", answer: "Madeira" },
  { question: "What is the term for the year a wine's grapes were harvested?", answer: "Vintage" },
  { question: "Which natural compound in red wines causes a drying mouthfeel?", answer: "Tannins" },
  { question: "What is the traditional method of making Champagne called in French?", answer: "Methode Champenoise" },
  { question: "Which white grape is most associated with Alsace and dry, aromatic wines?", answer: "Riesling" },
  { question: "What South African red grape is a cross between Pinot Noir and Cinsault?", answer: "Pinotage" },
  { question: "Which sparkling Spanish wine is made by the traditional method?", answer: "Cava" },
  { question: "What is the deepest, broadest part of the wine glass called?", answer: "Bowl" },
  { question: "Which French region produces the appellation Hermitage?", answer: "Northern Rhone" },
];

const DISTRACTORS = ["Cabernet Sauvignon","Pinot Noir","Chardonnay","Riesling","Sauvignon Blanc","Merlot","Syrah","Grenache","Malbec","Tempranillo","Zinfandel","Viognier","Albariño","Gewürztraminer","Pinot Grigio","Moscato","Chenin Blanc","Nebbiolo","Sangiovese","Primitivo"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: WinesQuizSettings): WinesQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(DISTRACTORS.filter(d => d !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: WinesQuizState, action: WinesQuizAction): WinesQuizState {
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

export function isTerminal(state: WinesQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
