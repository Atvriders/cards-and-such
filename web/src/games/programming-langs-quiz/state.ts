import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ProgrammingLangsQuizSettings { questions: "10" | "20" | "30"; }
export interface ProgrammingLangsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ProgrammingLangsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who created Python?", choices: ["Larry Wall","Guido van Rossum","Brendan Eich","Linus Torvalds"], correct: 1 },
  { question: "In what year was Python first released?", choices: ["1989","1991","1993","1995"], correct: 1 },
  { question: "Who created JavaScript?", choices: ["Brendan Eich","James Gosling","Yukihiro Matsumoto","Anders Hejlsberg"], correct: 0 },
  { question: "JavaScript was created in approximately how many days?", choices: ["2","10","30","100"], correct: 1 },
  { question: "Who created the Java programming language?", choices: ["James Gosling","Bjarne Stroustrup","Ken Thompson","Anders Hejlsberg"], correct: 0 },
  { question: "Java was first publicly released in?", choices: ["1993","1995","1997","1999"], correct: 1 },
  { question: "Who created the C programming language?", choices: ["Ken Thompson","Dennis Ritchie","Brian Kernighan","Niklaus Wirth"], correct: 1 },
  { question: "Who created C++?", choices: ["Dennis Ritchie","Bjarne Stroustrup","Andrew Koenig","Herb Sutter"], correct: 1 },
  { question: "Who created Ruby?", choices: ["Yukihiro Matsumoto","Larry Wall","Guido van Rossum","Rasmus Lerdorf"], correct: 0 },
  { question: "Who created Perl?", choices: ["Larry Wall","Tim O'Reilly","Brian Kernighan","Damian Conway"], correct: 0 },
  { question: "Who created PHP?", choices: ["Rasmus Lerdorf","Andi Gutmans","Zeev Suraski","Kent Beck"], correct: 0 },
  { question: "Who created Go (Golang) at Google with Pike and Thompson?", choices: ["Robert Griesemer","Brad Fitzpatrick","Russ Cox","Ian Lance Taylor"], correct: 0 },
  { question: "Who designed the Rust programming language originally?", choices: ["Graydon Hoare","Niko Matsakis","Steve Klabnik","Aaron Turon"], correct: 0 },
  { question: "Who created Swift at Apple?", choices: ["Chris Lattner","Tim Cook","Craig Federighi","Andy Hertzfeld"], correct: 0 },
  { question: "Who created Kotlin at JetBrains?", choices: ["Andrey Breslav","Anders Hejlsberg","Martin Odersky","James Strachan"], correct: 0 },
  { question: "Who created Scala?", choices: ["Martin Odersky","James Strachan","Rich Hickey","Joe Armstrong"], correct: 0 },
  { question: "Who created Clojure?", choices: ["Rich Hickey","Joe Armstrong","Phil Wadler","Simon Peyton Jones"], correct: 0 },
  { question: "Who created Erlang?", choices: ["Joe Armstrong","Mike Williams","Robert Virding","All three together"], correct: 3 },
  { question: "Who created Haskell's namesake?", choices: ["Haskell Curry","Phil Wadler","Simon Peyton Jones","John Hughes"], correct: 0 },
  { question: "Who designed C# at Microsoft?", choices: ["Anders Hejlsberg","Don Syme","Mads Torgersen","Eric Lippert"], correct: 0 },
  { question: "Who designed F# at Microsoft Research?", choices: ["Don Syme","Anders Hejlsberg","Erik Meijer","Simon Peyton Jones"], correct: 0 },
  { question: "Who created TypeScript?", choices: ["Anders Hejlsberg","Brendan Eich","Ryan Dahl","Doug Crockford"], correct: 0 },
  { question: "Who created Lisp in 1958?", choices: ["John McCarthy","Marvin Minsky","Alan Kay","Guy Steele"], correct: 0 },
  { question: "Who designed Pascal?", choices: ["Niklaus Wirth","Edsger Dijkstra","Donald Knuth","John Backus"], correct: 0 },
  { question: "Who led the FORTRAN team at IBM?", choices: ["John Backus","Grace Hopper","John McCarthy","Ken Iverson"], correct: 0 },
  { question: "Who created COBOL's design (key contributor)?", choices: ["Grace Hopper","John Backus","Jean Sammet","John McCarthy"], correct: 0 },
  { question: "Who created Smalltalk at Xerox PARC?", choices: ["Alan Kay","Dan Ingalls","Adele Goldberg","All of these"], correct: 3 },
  { question: "Who created Lua?", choices: ["Roberto Ierusalimschy","Luiz Henrique de Figueiredo","Waldemar Celes","All three"], correct: 3 },
  { question: "Who created Elixir on top of the Erlang VM?", choices: ["Jose Valim","Joe Armstrong","Robert Virding","Saša Jurić"], correct: 0 },
  { question: "Node.js, which runs JavaScript server-side, was created by?", choices: ["Ryan Dahl","Isaac Schlueter","TJ Holowaychuk","Brendan Eich"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ProgrammingLangsQuizSettings): ProgrammingLangsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ProgrammingLangsQuizState, action: ProgrammingLangsQuizAction): ProgrammingLangsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ProgrammingLangsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
