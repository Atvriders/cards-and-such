import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HomonymQuizSettings { questions: "8" | "12"; }
export interface HomonymQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HomonymQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which homophone of 'flower' grows on a tree?", choices: ["flour","flower","flouwer","flowor"], correct: 1 },
  { question: "Which spelling means 'belonging to them'?", choices: ["there","their","they're","theyre"], correct: 1 },
  { question: "A 'bow' is to a violin as an arrow is to a:", choices: ["bough","bow","beau","boe"], correct: 1 },
  { question: "Which word means 'a sound'?", choices: ["peace","piece","peas","please"], correct: 0 },
  { question: "Which spelling means 'a portion' (as of pie)?", choices: ["peace","piece","peas","please"], correct: 1 },
  { question: "Which spelling describes ocean motion?", choices: ["sea","see","seal","sa"], correct: 0 },
  { question: "Which spelling means 'to perceive with eyes'?", choices: ["sea","see","sigh","sai"], correct: 1 },
  { question: "A 'bank' can be a financial institution or:", choices: ["river edge","mountain top","cloud","star"], correct: 0 },
  { question: "Which spelling is the past tense of 'read'?", choices: ["red","read","reed","reade"], correct: 1 },
  { question: "Which spelling means 'a writing instrument' or 'enclosure'?", choices: ["pin","pen","pawn","pane"], correct: 1 },
  { question: "Which spelling means 'to pull or carry'?", choices: ["hall","haul","hail","hull"], correct: 1 },
  { question: "A 'pitcher' can mean a baseball player or a:", choices: ["jug","cake","car","trunk"], correct: 0 },
  { question: "Which homophone means 'allowed'?", choices: ["aloud","allowed","alowed","alloud"], correct: 1 },
  { question: "Which spelling means 'a unit of weight'?", choices: ["pour","pore","poor","poure"], correct: 0 },
  { question: "A 'bat' can be a flying mammal or a:", choices: ["club for hitting","fish","tree","bird"], correct: 0 },
  { question: "A 'spring' can mean a season or a:", choices: ["coil/source of water","leaf","stone","song"], correct: 0 },
  { question: "A 'match' can be for fire or a:", choices: ["contest","shoe","house","fruit"], correct: 0 },
  { question: "A 'bark' can be a tree's covering or a:", choices: ["dog's sound","cat's meow","fish scale","insect"], correct: 0 },
  { question: "A 'ring' can be jewelry or a:", choices: ["sound from a bell","tree leaf","shape only","shoe"], correct: 0 },
  { question: "A 'park' can be green space or a:", choices: ["place to leave a car","tall building","river bend","shoe"], correct: 0 },
  { question: "A 'date' can be a fruit or a:", choices: ["calendar day","fish","metal","bird"], correct: 0 },
  { question: "A 'right' can mean correct or:", choices: ["a direction","a fish","a song","a fruit"], correct: 0 },
  { question: "A 'palm' can be a hand part or a:", choices: ["tree","shoe","river","insect"], correct: 0 },
  { question: "Which spelling means 'opposite of 'wrong''?", choices: ["write","right","rite","wright"], correct: 1 },
  { question: "Which spelling means 'to compose words'?", choices: ["write","right","rite","wright"], correct: 0 },
  { question: "Which spelling means 'a ceremony'?", choices: ["write","right","rite","wright"], correct: 2 },
  { question: "Which spelling means 'a male sheep'?", choices: ["ram","rams","raam","rame"], correct: 0 },
  { question: "A 'fly' can be an insect or:", choices: ["to move through air","to swim","to dig","to crawl"], correct: 0 },
  { question: "A 'trunk' can be a tree's stem or a:", choices: ["car storage area","bird wing","shoe","leaf"], correct: 0 },
  { question: "Which spelling means 'a small body of water'?", choices: ["pond","pawned","ponned","pondd"], correct: 0 }

];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HomonymQuizSettings): HomonymQuizState {
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
export function reducer(state: HomonymQuizState, action: HomonymQuizAction): HomonymQuizState {
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
export function isTerminal(state: HomonymQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
