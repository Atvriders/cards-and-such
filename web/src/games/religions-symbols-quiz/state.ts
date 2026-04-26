import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ReligionsSymbolsQuizSettings { questionCount: "5" | "10" | "15"; }

export interface QuizEntry { question: string; answer: string; choices: string[]; }

export interface ReligionsSymbolsQuizState {
  settings: ReligionsSymbolsQuizSettings;
  entries: QuizEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type ReligionsSymbolsQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string }[] = [
  { question: "The cross is the primary symbol of which religion?", answer: "Christianity" },
  { question: "The Star of David (Magen David) is associated with which faith?", answer: "Judaism" },
  { question: "The crescent moon and star is a common symbol of which religion?", answer: "Islam" },
  { question: "The Dharma Wheel (Dharmachakra) represents which religion?", answer: "Buddhism" },
  { question: "The Om (Aum) symbol is sacred in which tradition?", answer: "Hinduism" },
  { question: "The Khanda is the symbol of which religion?", answer: "Sikhism" },
  { question: "The Faravahar depicts a winged figure and belongs to which faith?", answer: "Zoroastrianism" },
  { question: "The Torii gate is associated with which Japanese religion?", answer: "Shinto" },
  { question: "The Bahá'í star (nine-pointed star) represents which faith?", answer: "Bahá'í Faith" },
  { question: "The Ankh was the symbol of life in which ancient religion?", answer: "Ancient Egyptian Religion" },
  { question: "The Menorah (seven-branched candlestick) is a sacred symbol of which religion?", answer: "Judaism" },
  { question: "The fish (Ichthys) symbol was an early emblem of which faith?", answer: "Christianity" },
  { question: "The lotus flower is a common symbol in which Eastern religions?", answer: "Buddhism / Hinduism" },
  { question: "The Triple Moon symbol is associated with which modern spiritual path?", answer: "Wicca / Paganism" },
  { question: "The Jain Hand with a wheel in the palm is the symbol of which religion?", answer: "Jainism" },
  { question: "What symbol represents the unity of heaven and earth in Taoism?", answer: "Yin and Yang" },
  { question: "The Eye of Providence (all-seeing eye in triangle) is often linked to which context?", answer: "Freemasonry / Occultism" },
  { question: "The pentagram (five-pointed star) is used in which tradition?", answer: "Wicca / Paganism" },
  { question: "The Dharma Wheel with eight spokes represents which path in Buddhism?", answer: "The Noble Eightfold Path" },
  { question: "The conch shell is a sacred symbol in which Hindu context?", answer: "Hinduism (Vishnu)" },
];

const DISTRACTORS = ["Islam","Christianity","Hinduism","Buddhism","Sikhism","Judaism","Taoism","Shinto","Jainism","Zoroastrianism","Bahá'í Faith","Animism","Confucianism","Scientology","Shamanism"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: ReligionsSymbolsQuizSettings): ReligionsSymbolsQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(DISTRACTORS.filter(d => d !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: ReligionsSymbolsQuizState, action: ReligionsSymbolsQuizAction): ReligionsSymbolsQuizState {
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

export function isTerminal(state: ReligionsSymbolsQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
