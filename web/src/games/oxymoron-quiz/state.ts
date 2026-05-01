import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OxymoronQuizSettings { questions: "8" | "12"; }
export interface OxymoronQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OxymoronQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which is an oxymoron?", choices: ["dark night","bright sun","deafening silence","loud noise"], correct: 2 },
  { question: "Which is an oxymoron?", choices: ["happy ending","sad story","jumbo shrimp","big shrimp"], correct: 2 },
  { question: "Which is an oxymoron?", choices: ["bittersweet","very sweet","quite bitter","plain sweet"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["quick run","slow walk","walking dead","fast jog"], correct: 2 },
  { question: "Which is an oxymoron?", choices: ["clearly confused","fully clear","totally lost","quite sure"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["honest reply","awfully good","fast answer","kind word"], correct: 1 },
  { question: "Which is an oxymoron?", choices: ["pretty good","really bad","very nice","quite poor"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["original copy","new book","old film","fresh print"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["alone in a crowd","silent crowd","busy street","quiet park"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["small giant","big giant","tall giant","huge giant"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["open secret","hidden secret","kept secret","shared secret"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["icy hot","cool ice","warm fire","cold snow"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["seriously funny","mildly amusing","not funny","quite serious"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["only choice","best option","first pick","top selection"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["pretty ugly","very pretty","quite ugly","not nice"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["civil war","global peace","calm storm","gentle breeze"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["random order","fixed list","strict rule","loose plan"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["working vacation","busy day","relaxing trip","casual meeting"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["plastic glasses","silver spoon","gold ring","wooden chair"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["loud whisper","soft voice","quiet shout","sharp sound"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["awfully nice","very kind","quite sweet","really good"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["minor crisis","major event","big change","large issue"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["controlled chaos","wild noise","total mess","lost order"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["definitely maybe","clearly yes","obviously no","plainly true"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["found missing","lost forever","kept hidden","stayed lost"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["true myth","real story","factual report","actual event"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["growing smaller","getting bigger","becoming larger","expanding wide"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["sweet sorrow","pure joy","total grief","plain sad"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["accurate estimate","exact number","precise count","definite total"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["act naturally","be yourself","stay calm","take care"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OxymoronQuizSettings): OxymoronQuizState {
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
export function reducer(state: OxymoronQuizState, action: OxymoronQuizAction): OxymoronQuizState {
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
export function isTerminal(state: OxymoronQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
