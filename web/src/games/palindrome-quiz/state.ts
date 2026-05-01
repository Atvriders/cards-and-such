import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PalindromeQuizSettings { questions: "8" | "12"; }
export interface PalindromeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PalindromeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which of these is a palindrome?", choices: ["hello","level","world","apple"], correct: 1 },
  { question: "Which of these is a palindrome?", choices: ["banana","racecar","kitchen","window"], correct: 1 },
  { question: "Which of these is a palindrome?", choices: ["dog","mom","cat","bird"], correct: 1 },
  { question: "Which of these is a palindrome?", choices: ["chair","table","kayak","sofa"], correct: 2 },
  { question: "Which of these is a palindrome?", choices: ["radar","sonar","laser","video"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["evil","civic","brave","funny"], correct: 1 },
  { question: "Which of these is a palindrome?", choices: ["happy","sunny","noon","cloudy"], correct: 2 },
  { question: "Which of these is a palindrome?", choices: ["pop","run","jump","skip"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["river","stats","ocean","stream"], correct: 1 },
  { question: "Which of these is a palindrome?", choices: ["green","blue","yellow","wow"], correct: 3 },
  { question: "Which of these is a palindrome?", choices: ["father","mother","sister","tenet"], correct: 3 },
  { question: "Which of these is a palindrome?", choices: ["solos","violin","piano","drum"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["rotor","engine","piston","wheel"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["repaper","reload","reread","reset"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["refer","prefer","defer","infer"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["madam","sister","father","cousin"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["pizza","pasta","pup","steak"], correct: 2 },
  { question: "Which of these is a palindrome?", choices: ["bib","cap","hat","scarf"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["dad","son","aunt","niece"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["eye","ear","nose","chin"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["deed","said","done","made"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["bus","car","sees","truck"], correct: 2 },
  { question: "Which of these is a palindrome?", choices: ["tot","kid","baby","child"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["red","blue","peep","gold"], correct: 2 },
  { question: "Which of these is a palindrome?", choices: ["Anna","Bella","Cathy","Diana"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["Otto","Peter","Quinn","Ralph"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["pup","fox","owl","bat"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["pulp","minim","maple","oak"], correct: 1 },
  { question: "Which of these is a palindrome?", choices: ["redivider","transit","stagger","render"], correct: 0 },
  { question: "Which of these is a palindrome?", choices: ["taco","tacocat","kitten","puppy"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PalindromeQuizSettings): PalindromeQuizState {
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
export function reducer(state: PalindromeQuizState, action: PalindromeQuizAction): PalindromeQuizState {
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
export function isTerminal(state: PalindromeQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
