import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpellingQuizSettings { questions: "8" | "12"; }
export interface SpellingQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpellingQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which spelling is correct?", choices: ["recieve","receive","receeve","recive"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["acommodate","accomodate","accommodate","acomodate"], correct: 2 },
  { question: "Which spelling is correct?", choices: ["seperate","separate","saperate","separete"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["definately","definatly","definitely","definitly"], correct: 2 },
  { question: "Which spelling is correct?", choices: ["occurence","occurrence","ocurrence","occurance"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["embarass","embarrass","embarras","embaras"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["rhythm","rythm","rhythem","ryhthm"], correct: 0 },
  { question: "Which spelling is correct?", choices: ["necessary","neccessary","necesary","nesessary"], correct: 0 },
  { question: "Which spelling is correct?", choices: ["concious","conscious","conshus","conscius"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["miscellaneous","miscellanous","miscelaneous","miscellanius"], correct: 0 },
  { question: "Which spelling is correct?", choices: ["judgement","judgment","judgemant","judgmant"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["mispell","misspell","mispelll","missspell"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["wierd","weird","weeird","wired"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["truely","truly","truley","trully"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["calender","calendar","calandar","calandr"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["maintainance","maintenance","maintenence","maintanance"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["beleive","believe","belive","beliefe"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["acheive","achieve","acheeve","achive"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["foriegn","foreign","forign","foriegne"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["liason","liaison","liaisan","liaisson"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["restaraunt","restaurant","resterant","restraunt"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["tommorrow","tomorrow","tomorow","tommorow"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["wenesday","wednesday","wednsday","weddnesday"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["febuary","february","febrary","februarry"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["goverment","government","govenment","governmant"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["enviroment","environment","enviornment","environmant"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["arguement","argument","argumant","argumeent"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["priviledge","privilege","privelege","privlege"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["pronounciation","pronunciation","prononciation","pronounsation"], correct: 1 },
  { question: "Which spelling is correct?", choices: ["vaccum","vacuum","vaccuum","vacume"], correct: 1 }

];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SpellingQuizSettings): SpellingQuizState {
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
export function reducer(state: SpellingQuizState, action: SpellingQuizAction): SpellingQuizState {
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
export function isTerminal(state: SpellingQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
