import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TelestrationsQuizSettings { dummy: boolean; }
export interface TelestrationsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TelestrationsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many players is classic Telestrations designed for?", choices: ["2-4", "4-8", "8-12", "Up to 20"], correct: 1 },
  { question: "Each player passes their sketchbook how often per round?", choices: ["Once total", "After each phase", "Only at the end", "Never"], correct: 1 },
  { question: "Telestrations alternates between which two actions?", choices: ["Sing and hum", "Draw and guess", "Act and shout", "Roll and read"], correct: 1 },
  { question: "Telestrations is published by which company?", choices: ["Mattel", "USAopoly", "Hasbro", "Asmodee"], correct: 1 },
  { question: "How long is each turn in classic Telestrations?", choices: ["30 seconds", "60 seconds", "90 seconds", "3 minutes"], correct: 1 },
  { question: "The After Dark edition is targeted at?", choices: ["Children", "Adults", "Toddlers", "Pets"], correct: 1 },
  { question: "What does each player receive at the start?", choices: ["Cards only", "A sketchbook and dry-erase pen", "Dice", "A board"], correct: 1 },
  { question: "Upside Drawn challenges players to draw?", choices: ["Left-handed", "Upside-down", "Eyes closed", "On their forehead"], correct: 1 },
  { question: "The party game Telestrations evolved from?", choices: ["Pictionary", "The telephone game with sketches", "Charades", "Scattergories"], correct: 1 },
  { question: "Maximum players in standard Telestrations is?", choices: ["6", "8", "12", "20"], correct: 1 },
  { question: "Drawing books in the original box number?", choices: ["4", "6", "8", "12"], correct: 2 },
  { question: "Telestrations was first released in?", choices: ["2000", "2009", "2015", "1995"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _s: TelestrationsQuizSettings): TelestrationsQuizState {
  const rng = mulberry32(seed);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(10, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s=shuffle(idx,rng); const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: TelestrationsQuizState, action: TelestrationsQuizAction): TelestrationsQuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": return state.submitted ? state : { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const ok = state.selected === q.correct;
      return { ...state, submitted: true, score: state.score + (ok ? 100 : 0), correctCount: state.correctCount + (ok ? 1 : 0), phase: "result" };
    }
    case "next": {
      const ni = state.currentIndex + 1;
      return ni >= state.questions.length ? { ...state, phase: "done" } : { ...state, currentIndex: ni, selected: null, submitted: false, phase: "playing" };
    }
    default: return state;
  }
}
export function isTerminal(state: TelestrationsQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
