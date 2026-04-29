import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MetaphorQuizSettings { questions: "8" | "12"; }
export interface MetaphorQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MetaphorQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "'The classroom was a zoo' means the classroom was:", choices: ["full of animals","chaotic and noisy","outside","beautiful"], correct: 1 },
  { question: "'Her words were music to my ears' means her words were:", choices: ["literally music","very pleasant","loud","unclear"], correct: 1 },
  { question: "'He has a heart of stone' means he is:", choices: ["sick","unfeeling","strong","brave"], correct: 1 },
  { question: "'Time is money' means time is:", choices: ["expensive","precious like money","slow","tiring"], correct: 1 },
  { question: "'Life is a journey' means life:", choices: ["involves trips","is a process with stages","is short","ends in death"], correct: 1 },
  { question: "'The world is a stage' compares the world to:", choices: ["a building","a theatre","a school","a playground"], correct: 1 },
  { question: "'She is a night owl' means she:", choices: ["owns owls","stays up late","is wise","wears black"], correct: 1 },
  { question: "'The snow is a blanket' compares snow to:", choices: ["paper","a blanket","ice","cold"], correct: 1 },
  { question: "'He is a couch potato' means he:", choices: ["loves potatoes","is lazy","cooks well","relaxes outside"], correct: 1 },
  { question: "A metaphor differs from a simile in that it:", choices: ["uses 'like' or 'as'","does not use 'like' or 'as'","is always shorter","is always longer"], correct: 1 },
  { question: "'Her smile is a sunrise' means her smile is:", choices: ["always early","warm and bright","yellow","fading"], correct: 1 },
  { question: "'Knowledge is power' means knowledge:", choices: ["is electric","gives ability and influence","is heavy","is expensive"], correct: 1 },
  { question: "Which is a metaphor?", choices: ["He runs like the wind","Time is a thief","She is as brave as a lion","both 1 and 3"], correct: 1 },
  { question: "'America is a melting pot' compares America to:", choices: ["a kitchen","a mixture of cultures","hot weather","a desert"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MetaphorQuizSettings): MetaphorQuizState {
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
export function reducer(state: MetaphorQuizState, action: MetaphorQuizAction): MetaphorQuizState {
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
export function isTerminal(state: MetaphorQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
