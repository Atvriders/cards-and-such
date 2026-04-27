import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WhalesDolphinsQuizSettings { questions: "10"; }
export interface WhalesDolphinsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WhalesDolphinsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the largest animal on Earth?", choices: ["Sperm Whale", "Blue Whale", "Fin Whale", "Orca"], correct: 1 },
  { question: "Orcas are members of which family?", choices: ["Whales", "Dolphins", "Porpoises", "Seals"], correct: 1 },
  { question: "Sperm whales famously dive deep to hunt?", choices: ["Krill", "Squid", "Salmon", "Plankton"], correct: 1 },
  { question: "Bottlenose dolphins are known for their?", choices: ["Migration", "Intelligence", "Long lifespan", "Bioluminescence"], correct: 1 },
  { question: "Humpback whales are famous for their?", choices: ["Songs", "Speed", "Diving depth", "Color"], correct: 0 },
  { question: "Beluga whales live in which waters primarily?", choices: ["Tropical", "Arctic", "Mediterranean", "South Pacific"], correct: 1 },
  { question: "Narwhals are known for their?", choices: ["Tusks", "Speed", "Color", "Migration"], correct: 0 },
  { question: "Baleen whales feed by?", choices: ["Toothed predation", "Filter feeding", "Echolocation hunting", "Scavenging"], correct: 1 },
  { question: "The smallest dolphin species is the?", choices: ["Maui dolphin", "Bottlenose", "Spinner", "Common"], correct: 0 },
  { question: "Killer whales are at risk in some areas due to?", choices: ["Pollution and prey loss", "Hunting", "Disease", "All of these"], correct: 3 },
  { question: "Whale songs are produced by?", choices: ["Vocal cords", "Blowhole movements", "Tail slaps", "All cetaceans"], correct: 1 },
  { question: "Dolphins use what to navigate and hunt?", choices: ["Vision only", "Echolocation", "Smell", "Magnetism"], correct: 1 },
  { question: "A pod is a group of?", choices: ["Whales/dolphins", "Sharks", "Fish", "Seals"], correct: 0 },
  { question: "Gray whales make one of the longest migrations of any mammal — between?", choices: ["Mexico and Alaska", "Norway and Florida", "Brazil and Iceland", "Japan and Australia"], correct: 0 },
  { question: "Blue whales can weigh as much as approximately?", choices: ["50 tons", "100 tons", "200 tons", "20 tons"], correct: 2 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }

export function initialState(seed: number, _settings: WhalesDolphinsQuizSettings): WhalesDolphinsQuizState {
  const rng = mulberry32(seed);
  const count = 10;
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s = shuffle(idx,rng); const nc = s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: WhalesDolphinsQuizState, action: WhalesDolphinsQuizAction): WhalesDolphinsQuizState {
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

export function isTerminal(state: WhalesDolphinsQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
