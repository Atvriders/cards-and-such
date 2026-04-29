import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PortmanteauQuizSettings { questions: "8" | "12"; }
export interface PortmanteauQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PortmanteauQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "'Brunch' is a blend of:", choices: ["breakfast + lunch","brown + lunch","brink + lunch","brave + lunch"], correct: 0 },
  { question: "'Smog' is a blend of:", choices: ["smoke + fog","small + foggy","smell + grog","smudge + fog"], correct: 0 },
  { question: "'Motel' is a blend of:", choices: ["motor + hotel","mom + tel","model + hotel","more + tel"], correct: 0 },
  { question: "'Spork' is a blend of:", choices: ["spoon + fork","spike + fork","speak + fork","spy + fork"], correct: 0 },
  { question: "'Chillax' is a blend of:", choices: ["chill + relax","chill + ax","child + relax","chill + max"], correct: 0 },
  { question: "'Brangelina' was a blend of:", choices: ["Brad + Angelina","Brian + Angelina","Bryce + Angelina","Brent + Angelina"], correct: 0 },
  { question: "'Frenemy' is a blend of:", choices: ["friend + enemy","French + enemy","fresh + enemy","fierce + enemy"], correct: 0 },
  { question: "'Webinar' is a blend of:", choices: ["web + seminar","web + dinner","weather + seminar","wedge + seminar"], correct: 0 },
  { question: "'Hangry' is a blend of:", choices: ["hungry + angry","happy + angry","hard + angry","heavy + angry"], correct: 0 },
  { question: "'Sitcom' is a blend of:", choices: ["situation + comedy","sit + comedy","silly + comedy","scene + comedy"], correct: 0 },
  { question: "'Bromance' is a blend of:", choices: ["brother + romance","bro + romance","broad + romance","brave + romance"], correct: 1 },
  { question: "'Sheeple' is a blend of:", choices: ["sheep + people","sheet + people","shed + people","sheer + people"], correct: 0 },
  { question: "'Glamping' is a blend of:", choices: ["glamorous + camping","glass + camping","glove + camping","glade + camping"], correct: 0 },
  { question: "'Podcast' is a blend of:", choices: ["pod + broadcast","pop + cast","post + cast","point + cast"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PortmanteauQuizSettings): PortmanteauQuizState {
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
export function reducer(state: PortmanteauQuizState, action: PortmanteauQuizAction): PortmanteauQuizState {
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
export function isTerminal(state: PortmanteauQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
