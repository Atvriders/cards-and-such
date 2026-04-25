import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FestivalsQuizSettings { questionCount: "5" | "10" | "15"; }
export interface FestivalsEntry { question: string; answer: string; choices: string[]; }
export interface FestivalsQuizState { settings: FestivalsQuizSettings; entries: FestivalsEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type FestivalsQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK = [
  { question: "Diwali is the festival of what?", answer: "Lights" },
  { question: "Mardi Gras is most famous in which US city?", answer: "New Orleans" },
  { question: "Holi is a Hindu festival celebrating what season?", answer: "Spring" },
  { question: "Carnival in Rio de Janeiro is held before which religious period?", answer: "Lent" },
  { question: "Oktoberfest is held primarily in which German city?", answer: "Munich" },
  { question: "Songkran is a water festival in which country?", answer: "Thailand" },
  { question: "La Tomatina is a tomato-throwing festival in which country?", answer: "Spain" },
  { question: "Eid al-Fitr celebrates the end of which month?", answer: "Ramadan" },
  { question: "The Day of the Dead is celebrated in which country?", answer: "Mexico" },
  { question: "Burns Night celebrates which Scottish poet?", answer: "Robert Burns" },
  { question: "Hanami is a Japanese tradition involving which tree?", answer: "Cherry blossom" },
  { question: "Nowruz is the New Year of which calendar?", answer: "Persian" },
  { question: "The Running of the Bulls occurs during which festival?", answer: "San Fermin" },
  { question: "Glastonbury is famous for which type of festival?", answer: "Music" },
  { question: "Bonfire Night in the UK commemorates which event?", answer: "Gunpowder Plot" },
  { question: "Tet is the New Year celebration of which country?", answer: "Vietnam" },
  { question: "Ganesh Chaturthi celebrates the birth of which deity?", answer: "Ganesha" },
  { question: "The Notting Hill Carnival celebrates which culture?", answer: "Caribbean" },
  { question: "Midsommar is a summer solstice festival in which country?", answer: "Sweden" },
  { question: "Lantern Festival marks the end of which Chinese celebration?", answer: "Chinese New Year" },
];

const WRONG = ["Chicago", "London", "Paris", "Berlin", "Madrid", "Rome", "Tokyo", "Cairo", "Sydney", "Toronto", "Winter", "Summer", "Autumn", "Advent", "Christmas", "Easter", "Passover", "Ramadan", "Diwali", "Eid", "India", "Japan", "Brazil", "Germany", "France", "Italy", "Portugal", "Greece", "Turkey", "Egypt"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: FestivalsQuizSettings): FestivalsQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const entries: FestivalsEntry[] = shuffle(BANK, rng).slice(0, count).map((item) => {
    const wrong = shuffle(WRONG.filter(w => w !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: FestivalsQuizState, action: FestivalsQuizAction): FestivalsQuizState {
  if (state.done) return state;
  switch (action.type) {
    case "select": {
      if (state.selected !== null) return state;
      const correct = state.entries[state.current]!.choices[action.index] === state.entries[state.current]!.answer;
      return { ...state, selected: action.index, score: correct ? state.score + 10 : state.score };
    }
    case "next": {
      if (state.selected === null) return state;
      const next = state.current + 1;
      return next >= state.entries.length ? { ...state, done: true } : { ...state, current: next, selected: null };
    }
    default: return state;
  }
}

export function isTerminal(state: FestivalsQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
