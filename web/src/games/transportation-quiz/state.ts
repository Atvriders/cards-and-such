import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface TransportationQuizSettings { questionCount: "5" | "10" | "15"; }
export interface TransportationEntry { question: string; answer: string; choices: string[]; }
export interface TransportationQuizState { settings: TransportationQuizSettings; entries: TransportationEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type TransportationQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "The first commercial airline flight took place in which year?", answer: "1914" },
  { question: "Which country invented the bullet train?", answer: "Japan" },
  { question: "What does GPS stand for?", answer: "Global Positioning System" },
  { question: "The Panama Canal connects which two oceans?", answer: "Atlantic and Pacific" },
  { question: "Which country has the world's longest rail network?", answer: "United States" },
  { question: "What was the first country to build a highway system (Autobahn)?", answer: "Germany" },
  { question: "In aviation, what does IFR stand for?", answer: "Instrument Flight Rules" },
  { question: "The Suez Canal connects the Mediterranean to which sea?", answer: "Red Sea" },
  { question: "What type of engine powers most commercial aircraft?", answer: "Turbofan" },
  { question: "Which city has the world's busiest airport by passenger count?", answer: "Atlanta" },
  { question: "What year was the first commercial jet airliner introduced?", answer: "1952" },
  { question: "Hyperloop technology was proposed by which entrepreneur?", answer: "Elon Musk" },
  { question: "What is the maximum speed of Japan's Maglev train?", answer: "603 km/h" },
  { question: "The Concorde flew at what multiple of the speed of sound?", answer: "Mach 2" },
  { question: "Which type of ship uses sails and oars?", answer: "Galley" },
  { question: "What country invented the bicycle?", answer: "Germany" },
  { question: "How many wheels does a standard 18-wheeler truck have?", answer: "18" },
  { question: "What powers a hybrid electric vehicle in addition to a battery?", answer: "Gasoline engine" },
  { question: "Which city has the oldest subway system?", answer: "London" },
  { question: "What does VTOL mean in aviation?", answer: "Vertical Take-Off and Landing" },
];
const WRONG = ["1903", "1920", "1930", "1945", "France", "Germany", "China", "USA", "UK", "Russia", "Geographic Positioning Satellite", "Global Position System", "General Purpose System", "Atlantic and Arctic", "Pacific and Indian", "Indian and Atlantic", "Turbojet", "Turboprop", "Piston", "Ramjet", "Dubai", "Beijing", "Chicago", "London", "1940", "1958", "1965", "Mach 1", "Mach 3", "300 km/h", "500 km/h", "700 km/h", "Paris", "New York", "Tokyo"];
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a;
}
export function initialState(seed: number, settings: TransportationQuizSettings): TransportationQuizState {
  const rng = mulberry32(seed); const count = parseInt(settings.questionCount, 10);
  const entries: TransportationEntry[] = shuffle(BANK, rng).slice(0, count).map((item) => {
    const wrong = shuffle(WRONG.filter(w => w !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}
export function reducer(state: TransportationQuizState, action: TransportationQuizAction): TransportationQuizState {
  if (state.done) return state;
  switch (action.type) {
    case "select": { if (state.selected !== null) return state; const correct = state.entries[state.current]!.choices[action.index] === state.entries[state.current]!.answer; return { ...state, selected: action.index, score: correct ? state.score + 10 : state.score }; }
    case "next": { if (state.selected === null) return state; const next = state.current + 1; return next >= state.entries.length ? { ...state, done: true } : { ...state, current: next, selected: null }; }
    default: return state;
  }
}
export function isTerminal(state: TransportationQuizState): { score: number } | null { return state.done ? { score: state.score } : null; }
