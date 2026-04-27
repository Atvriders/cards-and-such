import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BearSpeciesQuizSettings { questions: "10"; }
export interface BearSpeciesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BearSpeciesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many species of bear exist worldwide?", choices: ["6", "7", "8", "9"], correct: 2 },
  { question: "Polar bears are native to?", choices: ["Arctic", "Antarctic", "Both poles", "Tundra in Asia"], correct: 0 },
  { question: "Giant pandas live primarily in?", choices: ["China", "Tibet", "India", "Russia"], correct: 0 },
  { question: "Sun bears are the smallest bear and live in?", choices: ["South America", "Southeast Asia", "Africa", "Australia"], correct: 1 },
  { question: "Spectacled bears live in?", choices: ["South America", "Africa", "Asia", "Europe"], correct: 0 },
  { question: "Sloth bears are native to?", choices: ["Africa", "South America", "Indian subcontinent", "Russia"], correct: 2 },
  { question: "Brown bears include which famous North American population?", choices: ["Grizzlies", "Black bears", "Pandas", "Polar bears"], correct: 0 },
  { question: "Asiatic black bears have a distinctive?", choices: ["White V-shaped chest patch", "Spectacles", "Tusks", "Mane"], correct: 0 },
  { question: "Which bear is considered the largest land carnivore?", choices: ["Grizzly", "Polar Bear", "Kodiak", "Sun Bear"], correct: 1 },
  { question: "Pandas eat almost exclusively?", choices: ["Bamboo", "Honey", "Salmon", "Fruit"], correct: 0 },
  { question: "Black bears in North America are most widespread in?", choices: ["Forests", "Tundra", "Deserts", "Coastal plains"], correct: 0 },
  { question: "Polar bears prey primarily on?", choices: ["Seals", "Fish", "Caribou", "Whales"], correct: 0 },
  { question: "Bears that hibernate enter a state of?", choices: ["True hibernation", "Torpor", "Sleep", "Death-like state"], correct: 1 },
  { question: "Sun bears are sometimes called the 'honey bear' because?", choices: ["They eat lots of honey", "They look like honey", "They live in honey trees", "Their fur is honey-colored"], correct: 0 },
  { question: "The largest brown bear subspecies lives on which Alaskan island?", choices: ["Kodiak", "Admiralty", "Baranof", "Chichagof"], correct: 0 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }

export function initialState(seed: number, _settings: BearSpeciesQuizSettings): BearSpeciesQuizState {
  const rng = mulberry32(seed);
  const count = 10;
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s = shuffle(idx,rng); const nc = s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: BearSpeciesQuizState, action: BearSpeciesQuizAction): BearSpeciesQuizState {
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

export function isTerminal(state: BearSpeciesQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
