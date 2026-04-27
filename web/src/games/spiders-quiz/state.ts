import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpidersQuizSettings { questions: "10"; }
export interface SpidersQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpidersQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many legs does a spider have?", choices: ["6", "8", "10", "12"], correct: 1 },
  { question: "Spiders are members of the class?", choices: ["Insecta", "Arachnida", "Crustacea", "Myriapoda"], correct: 1 },
  { question: "The largest spider by leg span is the?", choices: ["Black Widow", "Brown Recluse", "Goliath Birdeater (tarantula)", "Wolf spider"], correct: 2 },
  { question: "Black widow venom mainly affects?", choices: ["Nervous system", "Skin", "Blood", "Bones"], correct: 0 },
  { question: "Orb weavers build what kind of web?", choices: ["Funnel", "Sheet", "Wheel-shaped", "Tangle"], correct: 2 },
  { question: "Jumping spiders have unusually good?", choices: ["Hearing", "Vision", "Smell", "Speed"], correct: 1 },
  { question: "Brown recluse venom causes?", choices: ["Necrosis", "Paralysis", "Hallucinations", "Itching"], correct: 0 },
  { question: "Tarantulas mainly live in?", choices: ["Cold climates", "Warm regions worldwide", "Caves only", "Underwater"], correct: 1 },
  { question: "Sydney funnel-web spider is native to?", choices: ["Australia", "Africa", "South America", "Asia"], correct: 0 },
  { question: "Spiders kill prey using?", choices: ["Venom", "Webs only", "Crushing", "Smothering"], correct: 0 },
  { question: "Most spiders have how many eyes?", choices: ["2", "4", "6", "8"], correct: 3 },
  { question: "Trapdoor spiders ambush prey from?", choices: ["Webs", "Burrows with hinged lids", "Trees", "Water"], correct: 1 },
  { question: "Spider silk is, by weight, stronger than?", choices: ["Cotton", "Steel", "Wool", "Plastic"], correct: 1 },
  { question: "Female black widows are famous for?", choices: ["Eating males after mating (sometimes)", "Living for 100 years", "Building social colonies", "Fluorescing"], correct: 0 },
  { question: "Wolf spiders carry their young?", choices: ["On their backs", "In webs", "Buried", "In trees"], correct: 0 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }

export function initialState(seed: number, _settings: SpidersQuizSettings): SpidersQuizState {
  const rng = mulberry32(seed);
  const count = 10;
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s = shuffle(idx,rng); const nc = s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: SpidersQuizState, action: SpidersQuizAction): SpidersQuizState {
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

export function isTerminal(state: SpidersQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
