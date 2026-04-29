import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HyperboleQuizSettings { questions: "8" | "12"; }
export interface HyperboleQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HyperboleQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which is hyperbole?", choices: ["I'm so hungry I could eat a horse","I'm hungry","I'd like a snack","I want food"], correct: 0 },
  { question: "'It took forever' is a hyperbole meaning:", choices: ["it was instant","it took a very long time","it was endless literally","it never finished"], correct: 1 },
  { question: "Which is hyperbole?", choices: ["I have a million things to do","I have lots to do","I'm busy today","I work hard"], correct: 0 },
  { question: "'I've told you a million times' means:", choices: ["literally a million","many times","once or twice","never"], correct: 1 },
  { question: "Which is hyperbole?", choices: ["My backpack weighs a ton","My backpack is heavy","I carry books","My bag is full"], correct: 0 },
  { question: "'I died of embarrassment' is hyperbole because:", choices: ["it really killed me","I was extremely embarrassed","I was sad","I felt fine"], correct: 1 },
  { question: "Which is hyperbole?", choices: ["He's faster than the speed of light","He runs fast","He's quick","He sprints"], correct: 0 },
  { question: "'It's raining cats and dogs' is hyperbole or idiom about:", choices: ["actual animals falling","heavy rain","pets","light drizzle"], correct: 1 },
  { question: "Which is hyperbole?", choices: ["I waited an eternity","I waited a few minutes","I was patient","I sat down"], correct: 0 },
  { question: "'My feet are killing me' means:", choices: ["my feet are mortal weapons","my feet hurt a lot","I'm in danger","my feet are alive"], correct: 1 },
  { question: "Which is hyperbole?", choices: ["He's older than dirt","He's old","He's elderly","He's senior"], correct: 0 },
  { question: "'I could sleep for a year' means I'm:", choices: ["bored","very tired","sick","calm"], correct: 1 },
  { question: "Hyperbole is mostly used to:", choices: ["lie","exaggerate for effect","write history","hide meaning"], correct: 1 },
  { question: "Which is hyperbole?", choices: ["This bag weighs a thousand pounds","This bag is twenty pounds","This is my bag","I'll carry it"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HyperboleQuizSettings): HyperboleQuizState {
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
export function reducer(state: HyperboleQuizState, action: HyperboleQuizAction): HyperboleQuizState {
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
export function isTerminal(state: HyperboleQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
