import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WordRootsQuizSettings { questions: "8" | "12"; }
export interface WordRootsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WordRootsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The root 'aqua' means:", choices: ["fire","water","earth","sky"], correct: 1 },
  { question: "The root 'bio' means:", choices: ["death","life","place","sound"], correct: 1 },
  { question: "The root 'chrono' means:", choices: ["color","time","space","shape"], correct: 1 },
  { question: "The root 'geo' means:", choices: ["fire","earth","water","air"], correct: 1 },
  { question: "The root 'photo' means:", choices: ["sound","light","heat","speed"], correct: 1 },
  { question: "The root 'tele' means:", choices: ["far","near","under","over"], correct: 0 },
  { question: "The root 'graph' means:", choices: ["sound","write/draw","speak","see"], correct: 1 },
  { question: "The root 'phon' means:", choices: ["light","sound","heat","place"], correct: 1 },
  { question: "The root 'therm' means:", choices: ["cold","heat","light","speed"], correct: 1 },
  { question: "The root 'astro' means:", choices: ["star","earth","sea","tree"], correct: 0 },
  { question: "The root 'logo' means:", choices: ["place","word/study","time","color"], correct: 1 },
  { question: "The root 'micro' means:", choices: ["small","large","fast","slow"], correct: 0 },
  { question: "The root 'macro' means:", choices: ["small","large","fast","slow"], correct: 1 },
  { question: "The root 'mort' means:", choices: ["life","death","time","love"], correct: 1 },
  { question: "The root 'aud' means:", choices: ["see","hear","speak","feel"], correct: 1 },
  { question: "The root 'vid/vis' means:", choices: ["hear","see","speak","touch"], correct: 1 },
  { question: "The root 'dict' means:", choices: ["read","say/speak","see","hear"], correct: 1 },
  { question: "The root 'scrib/script' means:", choices: ["read","write","speak","hear"], correct: 1 },
  { question: "The root 'ped' (Latin) means:", choices: ["hand","foot","head","eye"], correct: 1 },
  { question: "The root 'man' (Latin) means:", choices: ["foot","hand","head","heart"], correct: 1 },
  { question: "The root 'cardio' means:", choices: ["mind","heart","lung","bone"], correct: 1 },
  { question: "The root 'derm' means:", choices: ["bone","skin","blood","muscle"], correct: 1 },
  { question: "The root 'hydro' means:", choices: ["fire","water","earth","air"], correct: 1 },
  { question: "The root 'pyro' means:", choices: ["water","fire","earth","air"], correct: 1 },
  { question: "The root 'cosmo' means:", choices: ["earth","universe","sea","sky"], correct: 1 },
  { question: "The root 'demo' means:", choices: ["state","people","land","time"], correct: 1 },
  { question: "The root 'auto' means:", choices: ["other","self","many","few"], correct: 1 },
  { question: "The root 'biblio' means:", choices: ["paper","book","ink","pen"], correct: 1 },
  { question: "The root 'psych' means:", choices: ["body","mind/soul","heart","blood"], correct: 1 },
  { question: "The root 'spec/spect' means:", choices: ["hear","look/see","touch","smell"], correct: 1 }

];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WordRootsQuizSettings): WordRootsQuizState {
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
export function reducer(state: WordRootsQuizState, action: WordRootsQuizAction): WordRootsQuizState {
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
export function isTerminal(state: WordRootsQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
