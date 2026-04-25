import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface DictatorsQuizSettings { questionCount: "5" | "10" | "15"; }
export interface DictatorsEntry { question: string; answer: string; choices: string[]; }
export interface DictatorsQuizState { settings: DictatorsQuizSettings; entries: DictatorsEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type DictatorsQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "Adolf Hitler led which political party?", answer: "Nazi Party" },
  { question: "Joseph Stalin ruled which country?", answer: "Soviet Union" },
  { question: "Mao Zedong was leader of which country?", answer: "China" },
  { question: "Benito Mussolini's title 'Il Duce' means what in English?", answer: "The Leader" },
  { question: "Kim Jong-un is the leader of which country?", answer: "North Korea" },
  { question: "Fidel Castro ruled which Caribbean country?", answer: "Cuba" },
  { question: "Francisco Franco ruled which European country?", answer: "Spain" },
  { question: "Saddam Hussein was the leader of which country?", answer: "Iraq" },
  { question: "Nicolae Ceausescu was the communist leader of which country?", answer: "Romania" },
  { question: "Idi Amin Dada was the dictator of which African country?", answer: "Uganda" },
  { question: "Robert Mugabe ruled which African country?", answer: "Zimbabwe" },
  { question: "Augusto Pinochet led a coup in which South American country?", answer: "Chile" },
  { question: "Pol Pot led which extremist regime?", answer: "Khmer Rouge" },
  { question: "Muammar Gaddafi ruled which North African country?", answer: "Libya" },
  { question: "The Khmer Rouge took power in which Southeast Asian country?", answer: "Cambodia" },
  { question: "Kim Il-sung was the founding leader of which country?", answer: "North Korea" },
  { question: "Juan Peron led which South American country?", answer: "Argentina" },
  { question: "Slobodan Milosevic was president of which country?", answer: "Serbia" },
  { question: "Enver Hoxha ruled which isolated European country?", answer: "Albania" },
  { question: "Rafael Trujillo was the dictator of which Caribbean country?", answer: "Dominican Republic" },
];
const WRONG = ["Communist Party", "Fascist Party", "Socialist Party", "Democratic Party", "Russia", "Germany", "Italy", "Romania", "Poland", "Hungary", "The Commander", "The Chief", "The General", "The Boss", "South Korea", "Vietnam", "Cambodia", "Laos", "Puerto Rico", "Haiti", "Jamaica", "Portugal", "Italy", "Greece", "Turkey", "Iran", "Syria", "Jordan", "Pakistan", "Afghanistan", "Brazil", "Peru", "Colombia", "Venezuela", "Ecuador", "Bosnia", "Croatia", "Slovenia", "Bulgaria", "Viet Cong", "Red Army", "Black Shirts"];
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a;
}
export function initialState(seed: number, settings: DictatorsQuizSettings): DictatorsQuizState {
  const rng = mulberry32(seed); const count = parseInt(settings.questionCount, 10);
  const entries: DictatorsEntry[] = shuffle(BANK, rng).slice(0, count).map((item) => {
    const wrong = shuffle(WRONG.filter(w => w !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}
export function reducer(state: DictatorsQuizState, action: DictatorsQuizAction): DictatorsQuizState {
  if (state.done) return state;
  switch (action.type) {
    case "select": { if (state.selected !== null) return state; const correct = state.entries[state.current]!.choices[action.index] === state.entries[state.current]!.answer; return { ...state, selected: action.index, score: correct ? state.score + 10 : state.score }; }
    case "next": { if (state.selected === null) return state; const next = state.current + 1; return next >= state.entries.length ? { ...state, done: true } : { ...state, current: next, selected: null }; }
    default: return state;
  }
}
export function isTerminal(state: DictatorsQuizState): { score: number } | null { return state.done ? { score: state.score } : null; }
