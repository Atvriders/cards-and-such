import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RhymeQuizSettings { questions: "8" | "12"; }
export interface RhymeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RhymeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which word rhymes with 'cat'?", choices: ["cup","hat","cog","car"], correct: 1 },
  { question: "Which word rhymes with 'tree'?", choices: ["trip","bee","tray","two"], correct: 1 },
  { question: "Which word rhymes with 'star'?", choices: ["stop","car","sip","stir"], correct: 1 },
  { question: "Which word rhymes with 'moon'?", choices: ["man","spoon","mine","mop"], correct: 1 },
  { question: "Which word rhymes with 'fly'?", choices: ["flag","sky","fop","fan"], correct: 1 },
  { question: "Which word rhymes with 'sun'?", choices: ["sat","run","sip","star"], correct: 1 },
  { question: "Which word rhymes with 'red'?", choices: ["row","bed","rot","ride"], correct: 1 },
  { question: "Which word rhymes with 'bake'?", choices: ["band","lake","bug","ban"], correct: 1 },
  { question: "Which word rhymes with 'hop'?", choices: ["help","top","hut","ham"], correct: 1 },
  { question: "Which word rhymes with 'ring'?", choices: ["road","sing","rust","run"], correct: 1 },
  { question: "Which word rhymes with 'cake'?", choices: ["cob","make","cup","cad"], correct: 1 },
  { question: "Which word rhymes with 'bed'?", choices: ["box","red","big","bug"], correct: 1 },
  { question: "Which word rhymes with 'snow'?", choices: ["snip","glow","snug","sat"], correct: 1 },
  { question: "Which word rhymes with 'goat'?", choices: ["green","boat","grin","gum"], correct: 1 },
  { question: "Which word rhymes with 'mouse'?", choices: ["moss","house","mash","must"], correct: 1 },
  { question: "Which word rhymes with 'duck'?", choices: ["dim","truck","deep","dare"], correct: 1 },
  { question: "Which word rhymes with 'play'?", choices: ["plot","day","plug","pin"], correct: 1 },
  { question: "Which word rhymes with 'frog'?", choices: ["fan","log","fig","fun"], correct: 1 },
  { question: "Which word rhymes with 'bug'?", choices: ["beg","rug","bog","big"], correct: 1 },
  { question: "Which word rhymes with 'pen'?", choices: ["pat","ten","pop","put"], correct: 1 },
  { question: "Which word rhymes with 'night'?", choices: ["nap","light","nut","nod"], correct: 1 },
  { question: "Which word rhymes with 'rain'?", choices: ["rip","train","ran","rod"], correct: 1 },
  { question: "Which word rhymes with 'shoe'?", choices: ["ship","blue","shy","shop"], correct: 1 },
  { question: "Which word rhymes with 'sock'?", choices: ["sip","rock","sad","sub"], correct: 1 },
  { question: "Which word rhymes with 'jail'?", choices: ["jam","sail","jog","jot"], correct: 1 },
  { question: "Which word rhymes with 'tape'?", choices: ["tip","grape","tar","tin"], correct: 1 },
  { question: "Which word rhymes with 'pie'?", choices: ["pop","tie","pat","pen"], correct: 1 },
  { question: "Which word rhymes with 'queen'?", choices: ["quit","green","quack","quip"], correct: 1 },
  { question: "Which word rhymes with 'wall'?", choices: ["win","ball","weed","wig"], correct: 1 },
  { question: "Which word rhymes with 'stone'?", choices: ["stop","bone","stick","step"], correct: 1 }

];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: RhymeQuizSettings): RhymeQuizState {
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
export function reducer(state: RhymeQuizState, action: RhymeQuizAction): RhymeQuizState {
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
export function isTerminal(state: RhymeQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
