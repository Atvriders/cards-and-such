import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AbbreviationQuizSettings { questions: "8" | "12"; }
export interface AbbreviationQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AbbreviationQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "'etc.' stands for:", choices: ["et cetera","etcetera Latin","extra time count","early travel coach"], correct: 0 },
  { question: "'e.g.' means:", choices: ["even greater","for example","essentially good","every group"], correct: 1 },
  { question: "'i.e.' means:", choices: ["in essence","that is","important entry","initial example"], correct: 1 },
  { question: "'a.m.' stands for:", choices: ["after midday","ante meridiem","always morning","at midnight"], correct: 1 },
  { question: "'p.m.' stands for:", choices: ["post meridiem","past midnight","prime morning","perfectly mostly"], correct: 0 },
  { question: "'PhD' typically means:", choices: ["public health degree","Doctor of Philosophy","past hard day","Physics doctor"], correct: 1 },
  { question: "'Mr.' is short for:", choices: ["Mister","Master","Mainor","Monsieur"], correct: 0 },
  { question: "'Mrs.' is short for:", choices: ["Mistress (married)","Misters","Mostess","Mighters"], correct: 0 },
  { question: "'St.' before a name typically means:", choices: ["Street","Saint","Stay","Stop"], correct: 1 },
  { question: "'Dr.' before a name means:", choices: ["Drive","Doctor","Daredevil","Dear"], correct: 1 },
  { question: "'vs.' stands for:", choices: ["very small","versus","verses","via"], correct: 1 },
  { question: "'Inc.' usually stands for:", choices: ["Incident","Incorporated","Income","Increase"], correct: 1 },
  { question: "'Ltd.' stands for:", choices: ["Limited","Latitude","Listed","Liability"], correct: 0 },
  { question: "'NB' or 'N.B.' means:", choices: ["new born","nota bene (note well)","not bad","nothing bigger"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AbbreviationQuizSettings): AbbreviationQuizState {
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
export function reducer(state: AbbreviationQuizState, action: AbbreviationQuizAction): AbbreviationQuizState {
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
export function isTerminal(state: AbbreviationQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
