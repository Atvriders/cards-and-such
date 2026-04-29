import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AlliterationQuizSettings { questions: "8" | "12"; }
export interface AlliterationQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AlliterationQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which phrase is alliterative?", choices: ["Big blue boat","Little red car","Tall green tree","Old gray cat"], correct: 0 },
  { question: "Which phrase is alliterative?", choices: ["Sally sells seashells","Tom buys cars","Anna eats apples","Bob runs fast"], correct: 0 },
  { question: "What initial sound alliterates 'Peter Piper picked'?", choices: ["t","p","i","s"], correct: 1 },
  { question: "Which phrase is alliterative?", choices: ["red roses","blue sky","green grass","yellow sun"], correct: 0 },
  { question: "Which phrase is alliterative?", choices: ["Mickey Mouse","Donald Duck","Peter Pan","all of the above"], correct: 3 },
  { question: "Which is alliterative?", choices: ["calm cool collected","hot bothered busy","wild loud free","tall short brave"], correct: 0 },
  { question: "What letter alliterates 'wicked witch'?", choices: ["c","w","i","k"], correct: 1 },
  { question: "Which is alliterative?", choices: ["Donald duck","Bob's burgers","Linda's loft","all of the above"], correct: 3 },
  { question: "Which is alliterative?", choices: ["sweet smell of success","busy buzzing bees","bold brave brothers","all of the above"], correct: 3 },
  { question: "Which is alliterative?", choices: ["fast food","slow start","hot hatch","all of the above"], correct: 3 },
  { question: "The alliterating sound in 'silly Sally sang' is:", choices: ["l","s","a","ng"], correct: 1 },
  { question: "Which alliterates?", choices: ["bright burning brave","quick short small","slow steady stream","s words alliterate"], correct: 2 },
  { question: "Which is alliterative?", choices: ["winter wind whistles","summer rain falls","autumn leaves drop","spring birds sing"], correct: 0 },
  { question: "Which is alliterative?", choices: ["Mighty Morphin","Power Rangers","Action Heroes","all famous"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AlliterationQuizSettings): AlliterationQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => {
    const idx = q.choices.map((c, i) => ({ c, i }));
    const s = shuffle(idx, rng);
    const nc = s.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: s.map(x => x.c) as [string, string, string, string], correct: nc };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: AlliterationQuizState, action: AlliterationQuizAction): AlliterationQuizState {
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
export function isTerminal(state: AlliterationQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
