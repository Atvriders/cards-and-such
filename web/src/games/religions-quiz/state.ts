import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface ReligionsQuizSettings { questionCount: "5" | "10" | "15"; }
export interface ReligionsEntry { question: string; answer: string; choices: string[]; }
export interface ReligionsQuizState { settings: ReligionsQuizSettings; entries: ReligionsEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type ReligionsQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "What is the holy book of Islam?", answer: "Quran" },
  { question: "Buddhism was founded in which century BCE?", answer: "5th century BCE" },
  { question: "What is the largest religion by followers?", answer: "Christianity" },
  { question: "The Torah is the holy text of which religion?", answer: "Judaism" },
  { question: "Hinduism originated in which region?", answer: "Indian subcontinent" },
  { question: "What does 'Islam' mean in Arabic?", answer: "Submission" },
  { question: "The Five Pillars are central to which faith?", answer: "Islam" },
  { question: "Sikhism was founded in which century?", answer: "15th century" },
  { question: "What is the sacred city of Islam?", answer: "Mecca" },
  { question: "Confucianism originated in which country?", answer: "China" },
  { question: "What is the central concept of karma in?", answer: "Hinduism" },
  { question: "The Eightfold Path belongs to which religion?", answer: "Buddhism" },
  { question: "What is the Jewish day of rest called?", answer: "Shabbat" },
  { question: "Zoroastrianism originated in which region?", answer: "Persia" },
  { question: "What is the primary text of Hinduism?", answer: "Vedas" },
  { question: "Shintoism is the indigenous religion of which country?", answer: "Japan" },
  { question: "What is the Sikh holy book called?", answer: "Guru Granth Sahib" },
  { question: "The Vatican is the center of which branch of Christianity?", answer: "Catholicism" },
  { question: "Taoism was founded by which philosopher?", answer: "Laozi" },
  { question: "What is the second largest religion by followers?", answer: "Islam" },
];
const WRONG = ["Bible", "Torah", "Vedas", "Tripitaka", "Guru Granth Sahib", "1st century BCE", "3rd century BCE", "7th century BCE", "10th century", "16th century", "Islam", "Christianity", "Buddhism", "Judaism", "Hinduism", "Sikhism", "Taoism", "Confucianism", "Zoroastrianism", "Shinto", "Jerusalem", "Medina", "Rome", "Athens", "India", "Arabia", "China", "Japan", "Egypt", "Greece"];
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a;
}
export function initialState(seed: number, settings: ReligionsQuizSettings): ReligionsQuizState {
  const rng = mulberry32(seed); const count = parseInt(settings.questionCount, 10);
  const entries: ReligionsEntry[] = shuffle(BANK, rng).slice(0, count).map((item) => {
    const wrong = shuffle(WRONG.filter(w => w !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}
export function reducer(state: ReligionsQuizState, action: ReligionsQuizAction): ReligionsQuizState {
  if (state.done) return state;
  switch (action.type) {
    case "select": { if (state.selected !== null) return state; const correct = state.entries[state.current]!.choices[action.index] === state.entries[state.current]!.answer; return { ...state, selected: action.index, score: correct ? state.score + 10 : state.score }; }
    case "next": { if (state.selected === null) return state; const next = state.current + 1; return next >= state.entries.length ? { ...state, done: true } : { ...state, current: next, selected: null }; }
    default: return state;
  }
}
export function isTerminal(state: ReligionsQuizState): { score: number } | null { return state.done ? { score: state.score } : null; }
