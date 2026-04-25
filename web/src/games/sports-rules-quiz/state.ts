import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface SportsRulesQuizSettings { questionCount: "5" | "10" | "15"; }
export interface SportsRulesEntry { question: string; answer: string; choices: string[]; }
export interface SportsRulesQuizState { settings: SportsRulesQuizSettings; entries: SportsRulesEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type SportsRulesQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "How many players are on a basketball team on the court?", answer: "5" },
  { question: "How many holes are in a standard round of golf?", answer: "18" },
  { question: "How many points is a touchdown worth in American football?", answer: "6" },
  { question: "What is the diameter of a basketball hoop in inches?", answer: "18" },
  { question: "How many sets must a player win to win a tennis Grand Slam match (men's)?", answer: "3" },
  { question: "In soccer, how many players per team are on the field?", answer: "11" },
  { question: "How long is a standard NBA quarter in minutes?", answer: "12" },
  { question: "In cricket, how many balls are in a standard over?", answer: "6" },
  { question: "How many strikes to get out in baseball?", answer: "3" },
  { question: "What is the maximum score per frame in bowling?", answer: "30" },
  { question: "In volleyball, how many touches are allowed per side?", answer: "3" },
  { question: "How many points does a field goal score in American football?", answer: "3" },
  { question: "What is the distance of a marathon in kilometers?", answer: "42.195" },
  { question: "In rugby union, how many players are on a team?", answer: "15" },
  { question: "How many periods are in an NHL hockey game?", answer: "3" },
  { question: "In boxing, how many rounds are in a world championship fight?", answer: "12" },
  { question: "How many red balls are used in snooker?", answer: "15" },
  { question: "What is the height of a standard tennis net at the center?", answer: "0.914m" },
  { question: "How many outs does each team get per inning in baseball?", answer: "3" },
  { question: "In swimming, how many lengths make up a 100m race in a 50m pool?", answer: "2" },
];
const WRONG = ["4", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "20", "2", "21", "4.5", "40", "36", "50", "60", "100", "30m", "1m", "3m", "2.4m", "25", "6", "100"];
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a;
}
export function initialState(seed: number, settings: SportsRulesQuizSettings): SportsRulesQuizState {
  const rng = mulberry32(seed); const count = parseInt(settings.questionCount, 10);
  const entries: SportsRulesEntry[] = shuffle(BANK, rng).slice(0, count).map((item) => {
    const wrong = shuffle(WRONG.filter(w => w !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}
export function reducer(state: SportsRulesQuizState, action: SportsRulesQuizAction): SportsRulesQuizState {
  if (state.done) return state;
  switch (action.type) {
    case "select": { if (state.selected !== null) return state; const correct = state.entries[state.current]!.choices[action.index] === state.entries[state.current]!.answer; return { ...state, selected: action.index, score: correct ? state.score + 10 : state.score }; }
    case "next": { if (state.selected === null) return state; const next = state.current + 1; return next >= state.entries.length ? { ...state, done: true } : { ...state, current: next, selected: null }; }
    default: return state;
  }
}
export function isTerminal(state: SportsRulesQuizState): { score: number } | null { return state.done ? { score: state.score } : null; }
