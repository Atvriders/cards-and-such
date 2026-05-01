import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PortmanteauQuizSettings { questions: "8" | "12"; }
export interface PortmanteauQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PortmanteauQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "'Brunch' is a blend of breakfast and...", choices: ["dinner","lunch","snack","tea"], correct: 1 },
  { question: "'Smog' is a blend of smoke and...", choices: ["log","fog","bog","cog"], correct: 1 },
  { question: "'Motel' is a blend of motor and...", choices: ["bottle","hotel","total","model"], correct: 1 },
  { question: "'Spork' is a blend of spoon and...", choices: ["pork","fork","cork","stork"], correct: 1 },
  { question: "'Brexit' is a blend of Britain and...", choices: ["entry","exit","trade","border"], correct: 1 },
  { question: "'Chillax' is a blend of chill and...", choices: ["max","relax","tax","wax"], correct: 1 },
  { question: "'Jeggings' is a blend of jeans and...", choices: ["leggings","trimmings","clothings","earrings"], correct: 0 },
  { question: "'Labradoodle' is a blend of Labrador and...", choices: ["noodle","poodle","doodle","oodle"], correct: 1 },
  { question: "'Mockumentary' is a blend of mock and...", choices: ["cinema","documentary","commentary","summary"], correct: 1 },
  { question: "'Sitcom' is a blend of situation and...", choices: ["comedy","compound","computer","commune"], correct: 0 },
  { question: "'Webinar' is a blend of web and...", choices: ["dinner","seminar","banner","planner"], correct: 1 },
  { question: "'Bromance' is a blend of brother and...", choices: ["romance","finance","chance","glance"], correct: 0 },
  { question: "'Frenemy' is a blend of friend and...", choices: ["army","enemy","jeremy","destiny"], correct: 1 },
  { question: "'Glamping' is a blend of glamorous and...", choices: ["camping","stamping","clamping","jamping"], correct: 0 },
  { question: "'Hangry' is a blend of hungry and...", choices: ["happy","angry","groggy","fuzzy"], correct: 1 },
  { question: "'Infomercial' is a blend of information and...", choices: ["material","commercial","celestial","financial"], correct: 1 },
  { question: "'Staycation' is a blend of stay and...", choices: ["donation","vacation","relation","creation"], correct: 1 },
  { question: "'Vlog' is a blend of video and...", choices: ["frog","blog","hog","dog"], correct: 1 },
  { question: "'Workaholic' is a blend of work and...", choices: ["catholic","alcoholic","melancholic","symbolic"], correct: 1 },
  { question: "'Pictionary' is a blend of picture and...", choices: ["dictionary","secretary","library","stationary"], correct: 0 },
  { question: "'Spanglish' is a blend of Spanish and...", choices: ["English","Polish","Swedish","Finnish"], correct: 0 },
  { question: "'Cosplay' is a blend of costume and...", choices: ["display","play","relay","essay"], correct: 1 },
  { question: "'Edutainment' is a blend of education and...", choices: ["containment","entertainment","attainment","statement"], correct: 1 },
  { question: "'Modem' is a blend of modulator and...", choices: ["demodulator","modeller","modulator","demonstrator"], correct: 0 },
  { question: "'Pixel' is a blend of picture and...", choices: ["pixel","element","metal","pencil"], correct: 1 },
  { question: "'Camcorder' is a blend of camera and...", choices: ["recorder","border","order","corder"], correct: 0 },
  { question: "'Sportscast' is a blend of sports and...", choices: ["broadcast","forecast","podcast","outcast"], correct: 0 },
  { question: "'Internet' is a blend of international and...", choices: ["network","intranet","interpret","interface"], correct: 0 },
  { question: "'Email' is a blend of electronic and...", choices: ["mail","email","trail","sail"], correct: 0 },
  { question: "'Wikipedia' is a blend of wiki and...", choices: ["media","encyclopedia","arcadia","comedia"], correct: 1 }
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
