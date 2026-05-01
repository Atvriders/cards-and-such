import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OnomatopoeiaQuizSettings { questions: "8" | "12"; }
export interface OnomatopoeiaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OnomatopoeiaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which word is onomatopoeic for a clock?", choices: ["tap","tick-tock","ring","beep"], correct: 1 },
  { question: "Which word is onomatopoeic for a cat?", choices: ["squeal","meow","quack","bark"], correct: 1 },
  { question: "Which word is onomatopoeic for a dog?", choices: ["moo","woof","tweet","oink"], correct: 1 },
  { question: "Which word is onomatopoeic for a cow?", choices: ["bleat","moo","cluck","neigh"], correct: 1 },
  { question: "Which word is onomatopoeic for a bee?", choices: ["hiss","buzz","chirp","croak"], correct: 1 },
  { question: "Which word is onomatopoeic for a snake?", choices: ["roar","hiss","yelp","caw"], correct: 1 },
  { question: "Which word is onomatopoeic for thunder?", choices: ["fizz","boom","plop","drip"], correct: 1 },
  { question: "Which word is onomatopoeic for water dripping?", choices: ["clang","drip","whoosh","crash"], correct: 1 },
  { question: "Which word is onomatopoeic for a balloon popping?", choices: ["whir","pop","thump","tinkle"], correct: 1 },
  { question: "Which word is onomatopoeic for sizzling food?", choices: ["sizzle","slosh","squelch","squish"], correct: 0 },
  { question: "Which word is onomatopoeic for a duck?", choices: ["quack","caw","cluck","peep"], correct: 0 },
  { question: "Which word is onomatopoeic for a sheep?", choices: ["bleat","bray","squawk","howl"], correct: 0 },
  { question: "Which word is onomatopoeic for paper tearing?", choices: ["thud","rip","clank","whoosh"], correct: 1 },
  { question: "Which word is onomatopoeic for a bell?", choices: ["ding","blip","crackle","gurgle"], correct: 0 },
  { question: "Which word is onomatopoeic for laughter?", choices: ["sob","haha","yawn","sigh"], correct: 1 },
  { question: "Which word is onomatopoeic for a phone ringing?", choices: ["tap","ring","clap","slam"], correct: 1 },
  { question: "Which word is onomatopoeic for footsteps?", choices: ["clop","whirl","glide","stretch"], correct: 0 },
  { question: "Which word is onomatopoeic for fire?", choices: ["splash","crackle","squish","drip"], correct: 1 },
  { question: "Which word is onomatopoeic for a heart?", choices: ["thump","hiss","ping","slash"], correct: 0 },
  { question: "Which word is onomatopoeic for a chick?", choices: ["roar","peep","bleat","oink"], correct: 1 },
  { question: "Which word is onomatopoeic for a horse?", choices: ["neigh","quack","baa","caw"], correct: 0 },
  { question: "Which word is onomatopoeic for a frog?", choices: ["chirp","ribbit","whoosh","moo"], correct: 1 },
  { question: "Which word is onomatopoeic for a pig?", choices: ["oink","cheep","baa","meow"], correct: 0 },
  { question: "Which word is onomatopoeic for a crow?", choices: ["caw","baa","tweet","hoot"], correct: 0 },
  { question: "Which word is onomatopoeic for an owl?", choices: ["hoot","quack","oink","hiss"], correct: 0 },
  { question: "Which word is onomatopoeic for a small bird?", choices: ["tweet","moo","woof","bleat"], correct: 0 },
  { question: "Which word is onomatopoeic for a hen?", choices: ["cluck","neigh","roar","baa"], correct: 0 },
  { question: "Which word is onomatopoeic for a falling object?", choices: ["thud","tweet","ping","ring"], correct: 0 },
  { question: "Which word is onomatopoeic for breaking glass?", choices: ["smash","yawn","ribbit","oink"], correct: 0 },
  { question: "Which word is onomatopoeic for a soda can opening?", choices: ["fizz","baa","caw","hoot"], correct: 0 }
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
