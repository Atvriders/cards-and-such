import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WildCatsQuizSettings { questions: "10"; }
export interface WildCatsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WildCatsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which wild cat is the largest by weight?", choices: ["Lion", "Tiger", "Jaguar", "Leopard"], correct: 1 },
  { question: "The cheetah is known for its?", choices: ["Strength", "Speed", "Stealth", "Climbing"], correct: 1 },
  { question: "Snow leopards live primarily in which mountain range?", choices: ["Andes", "Himalaya", "Atlas", "Rockies"], correct: 1 },
  { question: "Lions live in social groups called?", choices: ["Packs", "Prides", "Tribes", "Clans"], correct: 1 },
  { question: "Which cat has tear-line markings on its face?", choices: ["Cheetah", "Leopard", "Lion", "Tiger"], correct: 0 },
  { question: "Jaguars are native to which continent?", choices: ["Africa", "Asia", "Americas", "Europe"], correct: 2 },
  { question: "Tigers are native to which continent?", choices: ["Africa", "Asia", "Americas", "Australia"], correct: 1 },
  { question: "Which cat has tufted ears and a short tail?", choices: ["Lynx", "Leopard", "Cheetah", "Lion"], correct: 0 },
  { question: "Black panthers are usually melanistic forms of?", choices: ["Lions", "Tigers", "Leopards or jaguars", "Cougars"], correct: 2 },
  { question: "Which cat cannot roar but purrs continuously?", choices: ["Lion", "Tiger", "Cheetah", "Leopard"], correct: 2 },
  { question: "Mountain lions are also known as?", choices: ["Cougars", "Pumas", "Catamounts", "All of the above"], correct: 3 },
  { question: "Which large cat has the most powerful bite for its size?", choices: ["Lion", "Tiger", "Jaguar", "Cheetah"], correct: 2 },
  { question: "Servals are native to?", choices: ["Africa", "Asia", "Americas", "Europe"], correct: 0 },
  { question: "The Iberian lynx is native to?", choices: ["Iberia/Spain", "Russia", "Canada", "China"], correct: 0 },
  { question: "Which cat has the widest range — up to 11 countries native?", choices: ["Tiger", "Snow Leopard", "Cheetah", "Leopard"], correct: 3 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }

export function initialState(seed: number, _settings: WildCatsQuizSettings): WildCatsQuizState {
  const rng = mulberry32(seed);
  const count = 10;
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s = shuffle(idx,rng); const nc = s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: WildCatsQuizState, action: WildCatsQuizAction): WildCatsQuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": return state.submitted ? state : { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const ok = state.selected === q.correct;
      const pts = ok ? 100 + Math.floor(state.timeLeft * 10) : 0;
      return { ...state, submitted: true, score: state.score + pts, correctCount: state.correctCount + (ok ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const t = state.timeLeft - 1;
      return t <= 0 ? { ...state, timeLeft: 0, submitted: true, phase: "result" } : { ...state, timeLeft: t };
    }
    case "next": {
      const ni = state.currentIndex + 1;
      return ni >= state.questions.length ? { ...state, phase: "done" } : { ...state, currentIndex: ni, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: WildCatsQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
