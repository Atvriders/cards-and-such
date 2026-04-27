import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PrimatesQuizSettings { questions: "10"; }
export interface PrimatesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PrimatesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which is the largest primate species?", choices: ["Chimpanzee", "Gorilla", "Orangutan", "Bonobo"], correct: 1 },
  { question: "The closest living relatives to humans are?", choices: ["Gorillas", "Chimpanzees and bonobos", "Orangutans", "Gibbons"], correct: 1 },
  { question: "Lemurs are native exclusively to?", choices: ["Africa", "Madagascar", "Asia", "Australia"], correct: 1 },
  { question: "Orangutans are native to?", choices: ["Africa", "South America", "Borneo and Sumatra", "Madagascar"], correct: 2 },
  { question: "What is a key difference between monkeys and apes?", choices: ["Apes are larger", "Apes lack tails", "Apes live in Africa only", "Apes are nocturnal"], correct: 1 },
  { question: "Bonobos are known for their?", choices: ["Aggression", "Peaceful, matriarchal society", "Tool use", "Solitary lifestyle"], correct: 1 },
  { question: "Tarsiers are unique for their?", choices: ["Long tails", "Huge eyes", "Striped fur", "Wing flaps"], correct: 1 },
  { question: "Spider monkeys use their tail as a?", choices: ["Weapon", "Fifth limb (prehensile)", "Display", "Heat regulator"], correct: 1 },
  { question: "Mountain gorillas live in?", choices: ["Congo and Rwanda", "West Africa", "Madagascar", "Asia"], correct: 0 },
  { question: "Howler monkeys are famous for?", choices: ["Speed", "Their loud calls", "Climbing", "Color"], correct: 1 },
  { question: "Macaques are native to?", choices: ["Asia mainly", "Africa", "Americas", "Europe"], correct: 0 },
  { question: "Old World monkeys differ from New World by having?", choices: ["Prehensile tails", "Non-prehensile tails", "Larger size", "Brighter colors"], correct: 1 },
  { question: "Mandrills are famous for their?", choices: ["Long tails", "Brightly colored faces", "Speed", "Tool use"], correct: 1 },
  { question: "Aye-aye is a famous?", choices: ["Lemur", "Chimp", "Bonobo", "Tarsier"], correct: 0 },
  { question: "Jane Goodall is most known for studying?", choices: ["Gorillas", "Chimpanzees", "Bonobos", "Orangutans"], correct: 1 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }

export function initialState(seed: number, _settings: PrimatesQuizSettings): PrimatesQuizState {
  const rng = mulberry32(seed);
  const count = 10;
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s = shuffle(idx,rng); const nc = s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: PrimatesQuizState, action: PrimatesQuizAction): PrimatesQuizState {
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

export function isTerminal(state: PrimatesQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
