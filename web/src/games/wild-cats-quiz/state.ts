import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WildCatsQuizSettings { questions: "10"; }
export interface WildCatsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WildCatsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the largest wild cat species?", choices: ["Lion", "Tiger", "Jaguar", "Leopard"], correct: 1 },
  { question: "Cheetahs are the fastest land animals, reaching?", choices: ["~50 mph", "~70 mph", "~100 mph", "~30 mph"], correct: 1 },
  { question: "Which big cat is the only social one, living in prides?", choices: ["Tiger", "Leopard", "Lion", "Jaguar"], correct: 2 },
  { question: "Jaguars are native to?", choices: ["Africa", "Asia", "Americas", "Australia"], correct: 2 },
  { question: "Snow leopards live in?", choices: ["Sahara", "Central Asian mountains", "Amazon", "Outback"], correct: 1 },
  { question: "Which cat has the strongest bite relative to size?", choices: ["Lion", "Jaguar", "Tiger", "Cougar"], correct: 1 },
  { question: "A black panther is typically a melanistic?", choices: ["Lion", "Tiger", "Leopard or jaguar", "Cheetah"], correct: 2 },
  { question: "Tigers are native to?", choices: ["Africa", "Asia", "South America", "Europe"], correct: 1 },
  { question: "Which subspecies is the largest tiger?", choices: ["Bengal", "Sumatran", "Siberian (Amur)", "Indochinese"], correct: 2 },
  { question: "Lynxes are characterized by?", choices: ["Tufted ears", "Spots", "Manes", "Stripes"], correct: 0 },
  { question: "Which big cat cannot retract its claws fully?", choices: ["Leopard", "Cheetah", "Tiger", "Lion"], correct: 1 },
  { question: "The cougar is also known as?", choices: ["Mountain lion", "Jaguarundi", "Margay", "Serval"], correct: 0 },
  { question: "Servals are known for their?", choices: ["Long legs", "Manes", "Stripes", "Spots only"], correct: 0 },
  { question: "Caracals have distinctive?", choices: ["Black ear tufts", "Stripes", "White paws", "Long manes"], correct: 0 },
  { question: "Ocelots are native to?", choices: ["Americas", "Africa", "Asia", "Australia"], correct: 0 },
  { question: "Which big cats can roar?", choices: ["Cheetahs", "Lions, tigers, leopards, jaguars", "All cats", "Only lions"], correct: 1 },
  { question: "The Iberian lynx is found in?", choices: ["Spain and Portugal", "Italy", "France", "Greece"], correct: 0 },
  { question: "Which wild cat has the most extensive range?", choices: ["Cougar", "Tiger", "Lion", "Leopard"], correct: 0 },
  { question: "Bobcats are named for their?", choices: ["Short tail", "Spots", "Color", "Size"], correct: 0 },
  { question: "Sand cats live in?", choices: ["Deserts", "Rainforests", "Tundra", "Mountains"], correct: 0 },
  { question: "Fishing cats are notable for?", choices: ["Swimming and hunting fish", "Climbing trees", "Living in deserts", "Hibernating"], correct: 0 },
  { question: "A clouded leopard has unusually long?", choices: ["Canine teeth", "Tail only", "Legs", "Whiskers"], correct: 0 },
  { question: "Which extinct cat was famous for saber teeth?", choices: ["Smilodon", "Panthera atrox", "Homotherium", "All of these"], correct: 3 },
  { question: "Pumas, panthers, and cougars are all the same species:", choices: ["True", "False", "Sometimes", "Only in zoos"], correct: 0 },
  { question: "Which is the smallest wild cat?", choices: ["Rusty-spotted cat", "Sand cat", "Black-footed cat", "All very small"], correct: 3 },
  { question: "Lions mainly live in which habitat?", choices: ["Rainforest", "Savanna", "Tundra", "Desert"], correct: 1 },
  { question: "Tigers are excellent at?", choices: ["Swimming", "Climbing only", "Burrowing", "Flying"], correct: 0 },
  { question: "Genus Panthera includes all of these except?", choices: ["Cheetah", "Lion", "Tiger", "Jaguar"], correct: 0 },
  { question: "A cheetah's tear marks help with?", choices: ["Reducing sun glare", "Camouflage", "Communication", "Smell"], correct: 0 },
  { question: "Which cat's population dropped most critically in the wild?", choices: ["Amur leopard", "Domestic cat", "Bobcat", "Lynx"], correct: 0 },
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
