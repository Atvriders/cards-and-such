import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface QuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the most populous city in the world?", choices: ["Delhi", "Shanghai", "Tokyo", "Mumbai"], correct: 2 },
  { question: "Which city is known as the 'City of Light'?", choices: ["London", "New York", "Rome", "Paris"], correct: 3 },
  { question: "What is the capital of Australia?", choices: ["Sydney", "Melbourne", "Canberra", "Brisbane"], correct: 2 },
  { question: "Which city is the largest in South America by population?", choices: ["Buenos Aires", "São Paulo", "Rio de Janeiro", "Lima"], correct: 1 },
  { question: "Which city is known as the 'Big Apple'?", choices: ["Chicago", "Los Angeles", "New York City", "Boston"], correct: 2 },
  { question: "What is the highest capital city in the world?", choices: ["Quito", "Bogotá", "La Paz (administrative)", "Kathmandu"], correct: 2 },
  { question: "Which city has the world's busiest metro system?", choices: ["New York", "London", "Tokyo", "Beijing"], correct: 2 },
  { question: "What is the capital of Canada?", choices: ["Toronto", "Vancouver", "Montreal", "Ottawa"], correct: 3 },
  { question: "Which city is known for the Colosseum?", choices: ["Athens", "Rome", "Florence", "Naples"], correct: 1 },
  { question: "What city is 'The Venice of the North'?", choices: ["Copenhagen", "Stockholm", "Amsterdam", "Hamburg"], correct: 2 },
  { question: "Which city has the most Michelin-starred restaurants?", choices: ["Paris", "New York", "Tokyo", "London"], correct: 2 },
  { question: "What is the largest city by area?", choices: ["Moscow", "New York", "Chongqing", "Beijing"], correct: 2 },
  { question: "Which city is built on 118 islands?", choices: ["Stockholm", "Amsterdam", "Venice", "Copenhagen"], correct: 2 },
  { question: "What city hosts the largest Carnival celebration?", choices: ["Havana", "Buenos Aires", "Rio de Janeiro", "Port of Spain"], correct: 2 },
  { question: "Which city is called the 'City of Seven Hills'?", choices: ["Athens", "Jerusalem", "Istanbul", "Rome"], correct: 3 },
  { question: "What is the oldest continuously inhabited city?", choices: ["Athens", "Damascus", "Jericho", "Cairo"], correct: 1 },
  { question: "Which city is the fashion capital of the world?", choices: ["London", "New York", "Milan", "Paris"], correct: 3 },
  { question: "What city is known as 'Sin City'?", choices: ["Miami", "Las Vegas", "Los Angeles", "Atlantic City"], correct: 1 },
  { question: "Which is the northernmost capital city?", choices: ["Oslo", "Helsinki", "Reykjavik", "Stockholm"], correct: 2 },
  { question: "What city is the financial capital of Africa?", choices: ["Cairo", "Lagos", "Johannesburg", "Nairobi"], correct: 2 },
  { question: "Which city has the Sagrada Família?", choices: ["Madrid", "Seville", "Valencia", "Barcelona"], correct: 3 },
  { question: "What is the capital of Brazil?", choices: ["São Paulo", "Rio de Janeiro", "Brasília", "Manaus"], correct: 2 },
  { question: "Which city is known as the 'Eternal City'?", choices: ["Athens", "Jerusalem", "Rome", "Istanbul"], correct: 2 },
  { question: "What is the most visited city in the world?", choices: ["London", "Bangkok", "Paris", "Dubai"], correct: 2 },
  { question: "Which city sits on the Bosphorus Strait?", choices: ["Athens", "Beirut", "Istanbul", "Alexandria"], correct: 2 },
  { question: "What city is the world's largest by GDP?", choices: ["London", "New York City", "Tokyo", "Shanghai"], correct: 1 },
  { question: "Which city hosted the first modern Olympic Games?", choices: ["Paris", "London", "Athens", "Stockholm"], correct: 2 },
  { question: "What is the capital of South Korea?", choices: ["Busan", "Seoul", "Incheon", "Daegu"], correct: 1 },
  { question: "Which city is known as the 'Gateway to India'?", choices: ["Delhi", "Kolkata", "Chennai", "Mumbai"], correct: 3 },
  { question: "What city is called 'Windy City'?", choices: ["New York", "Boston", "Chicago", "Dallas"], correct: 2 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: QuizSettings): QuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  let pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => {
    const indexed = q.choices.map((c, i) => ({ c, i }));
    const shuffled = shuffle(indexed, rng);
    const newCorrect = shuffled.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: shuffled.map(x => x.c) as [string, string, string, string], correct: newCorrect };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: QuizState, action: QuizAction): QuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": if (state.submitted) return state; return { ...state, selected: action.choice };
    case "submit": { if (state.submitted || state.selected === null) return state; const q = state.questions[state.currentIndex]!; const ok = state.selected === q.correct; return { ...state, submitted: true, score: state.score + (ok ? 100 + Math.floor(state.timeLeft * 10) : 0), correctCount: state.correctCount + (ok ? 1 : 0), phase: "result" }; }
    case "tick": { if (state.submitted) return state; const t = state.timeLeft - 1; if (t <= 0) return { ...state, timeLeft: 0, submitted: true, phase: "result" }; return { ...state, timeLeft: t }; }
    case "next": { const n = state.currentIndex + 1; if (n >= state.questions.length) return { ...state, phase: "done" }; return { ...state, currentIndex: n, selected: null, submitted: false, timeLeft: 15, phase: "playing" }; }
    default: return state;
  }
}

export function isTerminal(state: QuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
