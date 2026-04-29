import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OnomatopoeiaQuizSettings { questions: "8" | "12"; }
export interface OnomatopoeiaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OnomatopoeiaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The word 'buzz' imitates the sound of:", choices: ["a bee","a dog","a bell","wind"], correct: 0 },
  { question: "The word 'meow' is the sound of:", choices: ["a dog","a cat","a cow","a duck"], correct: 1 },
  { question: "The word 'crash' suggests:", choices: ["soft splash","loud collision","gentle breeze","whisper"], correct: 1 },
  { question: "The word 'sizzle' suggests:", choices: ["frying food","a snowfall","a rainstorm","a gust"], correct: 0 },
  { question: "The word 'whoosh' suggests:", choices: ["a slow drip","fast-moving air","metal clang","a whisper"], correct: 1 },
  { question: "The word 'tick-tock' suggests:", choices: ["a clock","a horse","an engine","a footstep"], correct: 0 },
  { question: "The word 'splash' suggests:", choices: ["paper tearing","water hitting","wood snapping","metal grinding"], correct: 1 },
  { question: "The word 'roar' is the sound of:", choices: ["a kitten","a lion","a mouse","a sparrow"], correct: 1 },
  { question: "The word 'plop' suggests something:", choices: ["bouncing high","falling into liquid","whirring","cracking"], correct: 1 },
  { question: "The word 'crunch' suggests:", choices: ["liquid pouring","crispy biting","silk tearing","steam hissing"], correct: 1 },
  { question: "The word 'hiss' is the sound of:", choices: ["a snake","an owl","a horse","a cricket"], correct: 0 },
  { question: "The word 'thud' suggests:", choices: ["a heavy fall","a quick whistle","a pop","a clink"], correct: 0 },
  { question: "The word 'clang' suggests:", choices: ["paper rustling","metal striking","water dripping","cloth tearing"], correct: 1 },
  { question: "The word 'pop' suggests:", choices: ["a small burst","a long roar","a slow drip","a gentle sigh"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OnomatopoeiaQuizSettings): OnomatopoeiaQuizState {
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
export function reducer(state: OnomatopoeiaQuizState, action: OnomatopoeiaQuizAction): OnomatopoeiaQuizState {
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
export function isTerminal(state: OnomatopoeiaQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
