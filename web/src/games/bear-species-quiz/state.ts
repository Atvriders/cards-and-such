import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BearSpeciesQuizSettings { questions: "10"; }
export interface BearSpeciesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BearSpeciesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many bear species are alive today?", choices: ["6", "7", "8", "9"], correct: 2 },
  { question: "The largest bear species is?", choices: ["Polar bear", "Brown bear", "Both can be largest", "Black bear"], correct: 2 },
  { question: "Polar bears are native to?", choices: ["Arctic", "Antarctic", "Both poles", "Tropics"], correct: 0 },
  { question: "Giant pandas are native to?", choices: ["China", "Japan", "India", "Korea"], correct: 0 },
  { question: "Pandas eat almost exclusively?", choices: ["Bamboo", "Fish", "Bees", "Berries"], correct: 0 },
  { question: "The smallest bear species is the?", choices: ["Sun bear", "Sloth bear", "Spectacled bear", "Black bear"], correct: 0 },
  { question: "Sun bears are found in?", choices: ["Southeast Asia", "Africa", "Americas", "Europe"], correct: 0 },
  { question: "Sloth bears are native to?", choices: ["Indian subcontinent", "Africa", "South America", "Australia"], correct: 0 },
  { question: "Spectacled bears live in?", choices: ["Andes Mountains", "Himalayas", "Rockies", "Alps"], correct: 0 },
  { question: "Spectacled bears are the only bears native to?", choices: ["South America", "Africa", "Australia", "Antarctica"], correct: 0 },
  { question: "Grizzly bears are a subspecies of?", choices: ["Brown bear", "Black bear", "Polar bear", "Sun bear"], correct: 0 },
  { question: "Kodiak bears live on islands off?", choices: ["Alaska", "Russia", "Japan", "Norway"], correct: 0 },
  { question: "Polar bears' fur appears white but is actually?", choices: ["Translucent hollow hairs", "Pure white", "Gray", "Yellow"], correct: 0 },
  { question: "Polar bear skin is what color?", choices: ["Black", "White", "Pink", "Brown"], correct: 0 },
  { question: "Asiatic black bears are also called?", choices: ["Moon bears", "Sun bears", "Spectacled bears", "Sloth bears"], correct: 0 },
  { question: "A bear's ability to hibernate is called?", choices: ["Torpor", "Estivation", "Diapause", "Brumation"], correct: 0 },
  { question: "Which bear is most carnivorous?", choices: ["Polar bear", "Panda", "Sloth bear", "Sun bear"], correct: 0 },
  { question: "Sloth bears use their lips to?", choices: ["Suck up insects", "Sip nectar", "Catch fish", "Crush bamboo"], correct: 0 },
  { question: "Pandas have an extra \"thumb\" that is actually?", choices: ["Modified wrist bone", "Sixth digit", "Claw", "Toe"], correct: 0 },
  { question: "A baby bear is called a?", choices: ["Cub", "Calf", "Pup", "Kit"], correct: 0 },
  { question: "Which bear has the longest claws relative to body size?", choices: ["Sloth bear", "Polar bear", "Sun bear", "Black bear"], correct: 0 },
  { question: "Brown bears are found across?", choices: ["North America, Europe, and Asia", "Africa only", "Australia", "Antarctica"], correct: 0 },
  { question: "Polar bears are classified as which IUCN status?", choices: ["Vulnerable", "Least concern", "Extinct", "Domesticated"], correct: 0 },
  { question: "The Gobi bear is a critically endangered population of?", choices: ["Brown bear", "Black bear", "Sun bear", "Sloth bear"], correct: 0 },
  { question: "Pandas typically give birth to how many cubs?", choices: ["1-2", "5-6", "8-10", "12+"], correct: 0 },
  { question: "Bear group name is a?", choices: ["Sloth or sleuth", "Pack", "Pride", "Herd"], correct: 0 },
  { question: "American black bears are most common in?", choices: ["Forested areas of North America", "Deserts", "Tundra", "Tropics"], correct: 0 },
  { question: "Polar bears can be hybrids with brown bears, called?", choices: ["Pizzly or grolar bears", "Polizzly", "Brolar", "Albino bears"], correct: 0 },
  { question: "Which bear has a distinctive V or U-shaped chest mark?", choices: ["Sun bear", "Polar bear", "Panda", "Grizzly"], correct: 0 },
  { question: "The bear family is called?", choices: ["Ursidae", "Felidae", "Canidae", "Mustelidae"], correct: 0 },
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
