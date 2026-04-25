import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface OlympicEventsQuizSettings { questionCount: "5" | "10" | "15"; }
export interface OlympicEventsEntry { question: string; answer: string; choices: string[]; }
export interface OlympicEventsQuizState { settings: OlympicEventsQuizSettings; entries: OlympicEventsEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type OlympicEventsQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "In which city were the first modern Olympic Games held?", answer: "Athens" },
  { question: "How often are the Summer Olympics held?", answer: "Every 4 years" },
  { question: "How many rings are on the Olympic flag?", answer: "5" },
  { question: "What metal is a third-place Olympic medal made from?", answer: "Bronze" },
  { question: "The decathlon consists of how many events?", answer: "10" },
  { question: "In which year were women first allowed to compete in the Olympics?", answer: "1900" },
  { question: "The marathon distance in the Olympics is approximately how many km?", answer: "42.2" },
  { question: "What sport uses a foil, epee, or sabre?", answer: "Fencing" },
  { question: "Gymnastics scoring uses a maximum base score of?", answer: "10" },
  { question: "The pentathlon consists of how many sports?", answer: "5" },
  { question: "In which country did the 2016 Summer Olympics take place?", answer: "Brazil" },
  { question: "Synchronized swimming is performed in which Olympic venue?", answer: "Aquatics center" },
  { question: "Taekwondo is an Olympic sport from which country?", answer: "South Korea" },
  { question: "The Olympic torch relay traditionally begins in which country?", answer: "Greece" },
  { question: "Which country has won the most all-time Olympic gold medals?", answer: "United States" },
  { question: "Judo originated in which country?", answer: "Japan" },
  { question: "The triathlon combines swimming, cycling, and which third sport?", answer: "Running" },
  { question: "How many athletes are on an Olympic rowing eight crew?", answer: "9" },
  { question: "The biathlon combines cross-country skiing with which other activity?", answer: "Rifle shooting" },
  { question: "The Olympic creed emphasizes participation over what?", answer: "Winning" },
];
const WRONG = ["Rome", "Paris", "London", "Berlin", "Every 2 years", "Every 3 years", "Every 5 years", "4", "6", "7", "8", "12", "1896", "1920", "1936", "1952", "26.2 miles", "40 km", "Swimming", "Shooting", "Archery", "Wrestling", "Boxing", "Russia", "China", "Germany", "France", "UK", "Australia", "Italy"];
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a;
}
export function initialState(seed: number, settings: OlympicEventsQuizSettings): OlympicEventsQuizState {
  const rng = mulberry32(seed); const count = parseInt(settings.questionCount, 10);
  const entries: OlympicEventsEntry[] = shuffle(BANK, rng).slice(0, count).map((item) => {
    const wrong = shuffle(WRONG.filter(w => w !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}
export function reducer(state: OlympicEventsQuizState, action: OlympicEventsQuizAction): OlympicEventsQuizState {
  if (state.done) return state;
  switch (action.type) {
    case "select": { if (state.selected !== null) return state; const correct = state.entries[state.current]!.choices[action.index] === state.entries[state.current]!.answer; return { ...state, selected: action.index, score: correct ? state.score + 10 : state.score }; }
    case "next": { if (state.selected === null) return state; const next = state.current + 1; return next >= state.entries.length ? { ...state, done: true } : { ...state, current: next, selected: null }; }
    default: return state;
  }
}
export function isTerminal(state: OlympicEventsQuizState): { score: number } | null { return state.done ? { score: state.score } : null; }
