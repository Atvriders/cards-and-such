import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ProverbQuizSettings { questions: "8" | "12"; }
export interface ProverbQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ProverbQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "A stitch in time saves...", choices: ["five","nine","one","ten"], correct: 1 },
  { question: "Actions speak louder than...", choices: ["words","music","silence","whispers"], correct: 0 },
  { question: "Don't count your chickens before they...", choices: ["fly","hatch","crow","sleep"], correct: 1 },
  { question: "The early bird catches the...", choices: ["fish","worm","sun","mouse"], correct: 1 },
  { question: "A penny saved is a penny...", choices: ["spent","earned","lost","won"], correct: 1 },
  { question: "When in Rome, do as the...", choices: ["Greeks","Romans","Romans do","tourists"], correct: 2 },
  { question: "Better late than...", choices: ["never","early","sorry","quick"], correct: 0 },
  { question: "Birds of a feather flock...", choices: ["high","together","apart","alone"], correct: 1 },
  { question: "Don't put all your eggs in one...", choices: ["pan","basket","bag","car"], correct: 1 },
  { question: "The pen is mightier than the...", choices: ["pencil","sword","rifle","fist"], correct: 1 },
  { question: "You can't judge a book by its...", choices: ["title","cover","author","price"], correct: 1 },
  { question: "Practice makes...", choices: ["money","perfect","perfect sense","fast"], correct: 1 },
  { question: "No pain, no...", choices: ["fame","gain","name","game"], correct: 1 },
  { question: "Where there's a will, there's a...", choices: ["road","way","path","bridge"], correct: 1 },
  { question: "Too many cooks spoil the...", choices: ["soup","broth","stew","sauce"], correct: 1 },
  { question: "A rolling stone gathers no...", choices: ["dust","moss","speed","friends"], correct: 1 },
  { question: "Beggars can't be...", choices: ["winners","choosers","losers","sellers"], correct: 1 },
  { question: "Every cloud has a silver...", choices: ["edge","lining","cloud","sky"], correct: 1 },
  { question: "Curiosity killed the...", choices: ["dog","cat","mouse","bird"], correct: 1 },
  { question: "Don't bite the hand that feeds...", choices: ["it","you","them","us"], correct: 1 },
  { question: "Honesty is the best...", choices: ["medicine","policy","friend","gift"], correct: 1 },
  { question: "Absence makes the heart grow...", choices: ["stronger","fonder","weaker","wiser"], correct: 1 },
  { question: "The grass is always greener on the other...", choices: ["hill","side","field","yard"], correct: 1 },
  { question: "Two heads are better than...", choices: ["none","one","four","three"], correct: 1 },
  { question: "Out of sight, out of...", choices: ["mind","heart","reach","luck"], correct: 0 },
  { question: "Look before you...", choices: ["jump","leap","run","speak"], correct: 1 },
  { question: "Time heals all...", choices: ["pain","wounds","sins","ills"], correct: 1 },
  { question: "Strike while the iron is...", choices: ["hot","cold","ready","melted"], correct: 0 },
  { question: "A picture is worth a thousand...", choices: ["dollars","words","images","songs"], correct: 1 },
  { question: "Don't cry over spilled...", choices: ["tea","milk","beans","wine"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ProverbQuizSettings): ProverbQuizState {
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
export function reducer(state: ProverbQuizState, action: ProverbQuizAction): ProverbQuizState {
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
export function isTerminal(state: ProverbQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
