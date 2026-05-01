import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AlliterationQuizSettings { questions: "8" | "12"; }
export interface AlliterationQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AlliterationQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which phrase uses alliteration?", choices: ["Big bad wolf","Old gray wolf","Hungry wolf","Forest wolf"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Sweet smile","Soft slippers","Bright eyes","Loud noise"], correct: 1 },
  { question: "Which phrase uses alliteration?", choices: ["Curious cat","Brown dog","Yellow bird","Tall tree"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Calm sea","Peter Piper","Blue sky","Fast train"], correct: 1 },
  { question: "Which phrase uses alliteration?", choices: ["Wild flower","Whispering wind","Cold morning","Bright moon"], correct: 1 },
  { question: "Which phrase uses alliteration?", choices: ["Silent sky","Heavy rain","Strong rope","Tall hill"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Empty room","Dark night","Dancing daffodils","Yellow sun"], correct: 2 },
  { question: "Which phrase uses alliteration?", choices: ["Smooth stone","Rough wood","Quick rabbit","Warm fire"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Mighty mountain","Tall tower","Big house","Old book"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Roaring river","Calm lake","Clear sky","Green field"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Loud bang","Bouncing ball","Quiet voice","Fast car"], correct: 1 },
  { question: "Which phrase uses alliteration?", choices: ["Silver moon","Slithering snake","Bright star","Rough sea"], correct: 1 },
  { question: "Which phrase uses alliteration?", choices: ["Tall mountain","Crystal clear","Old tree","Dark cave"], correct: 1 },
  { question: "Which phrase uses alliteration?", choices: ["Funny face","Wicked witch","Tall man","Big dog"], correct: 1 },
  { question: "Which phrase uses alliteration?", choices: ["Hungry hippo","Lonely cat","Tired horse","Old goat"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Pretty picture","Old book","New car","Fast horse"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Silly Sally","Tom and Jerry","Bob the builder","Yellow door"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Heavy rain","Donald Duck","Big bear","Fast train"], correct: 1 },
  { question: "Which phrase uses alliteration?", choices: ["Mickey Mouse","Old cat","Dark night","Bright moon"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Flickering flame","Burning ember","Glowing coal","Hot fire"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Bright morning","Misty mountain","Cool breeze","Warm sun"], correct: 1 },
  { question: "Which phrase uses alliteration?", choices: ["Sliding snail","Walking ant","Flying bee","Crawling worm"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Tall tree","Old castle","Fresh bread","Cold milk"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Warm wind","Cold rain","Bright light","Dark cloud"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Crispy crust","Soft bread","Sweet cake","Cold soup"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Glittering gold","Heavy iron","Shiny silver","Dull lead"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Bright light","Loud sound","Cool color","Frantic flight"], correct: 3 },
  { question: "Which phrase uses alliteration?", choices: ["Silent night","Slow shadow","Bright day","Cold rain"], correct: 1 },
  { question: "Which phrase uses alliteration?", choices: ["Whispering willows","Falling leaves","Cold wind","Dry grass"], correct: 0 },
  { question: "Which phrase uses alliteration?", choices: ["Brave bear","Tall giraffe","Spotted dog","Striped cat"], correct: 0 }
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
