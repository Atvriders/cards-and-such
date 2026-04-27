import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ProgrammingLangsQuizSettings { questions: "10" | "20" | "30"; }
export interface ProgrammingLangsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ProgrammingLangsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who created Python?", choices: ["Larry Wall", "Guido van Rossum", "Brendan Eich", "Linus Torvalds"], correct: 1 },
  { question: "Who created JavaScript?", choices: ["Brendan Eich", "Bjarne Stroustrup", "Dennis Ritchie", "James Gosling"], correct: 0 },
  { question: "Who created C?", choices: ["Dennis Ritchie", "Ken Thompson", "Bjarne Stroustrup", "Brian Kernighan"], correct: 0 },
  { question: "Who created C++?", choices: ["Ritchie", "Stroustrup", "Gosling", "Hejlsberg"], correct: 1 },
  { question: "Who created Java?", choices: ["Stroustrup", "Gosling", "Hejlsberg", "Ritchie"], correct: 1 },
  { question: "Who created Ruby?", choices: ["Matsumoto", "Wall", "Hejlsberg", "Eich"], correct: 0 },
  { question: "Who created Perl?", choices: ["Wall", "Matsumoto", "Eich", "Hejlsberg"], correct: 0 },
  { question: "Who created Lisp?", choices: ["McCarthy", "Backus", "Hopper", "Knuth"], correct: 0 },
  { question: "What does HTML stand for?", choices: ["Hyper Transfer Markup Language", "HyperText Markup Language", "High-Text Memory Language", "Home Tool Markup Language"], correct: 1 },
  { question: "What language is used in iOS native development?", choices: ["Java", "C#", "Swift/Objective-C", "Kotlin"], correct: 2 },
  { question: "What language is preferred for Android native development?", choices: ["Swift", "Kotlin/Java", "Python", "Go"], correct: 1 },
  { question: "Which language was developed at Google?", choices: ["Rust", "Go", "Swift", "Kotlin"], correct: 1 },
  { question: "Which language is statically typed?", choices: ["Python", "Ruby", "JavaScript", "TypeScript"], correct: 3 },
  { question: "Which language popularized the term 'segfault'?", choices: ["BASIC", "C", "Lisp", "Java"], correct: 1 },
  { question: "Who designed FORTRAN?", choices: ["Backus team at IBM", "Bell Labs", "Sun", "Microsoft"], correct: 0 },
  { question: "Which is the oldest still-used language?", choices: ["Python", "FORTRAN", "C", "Java"], correct: 1 },
  { question: "Which language is run by V8 engine?", choices: ["Python", "Java", "JavaScript", "Ruby"], correct: 2 },
  { question: "Which paradigm is Haskell?", choices: ["OOP", "Functional", "Procedural", "Logic"], correct: 1 },
  { question: "Which language uses indentation for blocks?", choices: ["C", "Python", "Java", "Go"], correct: 1 },
  { question: "Which is Microsoft's flagship .NET language?", choices: ["Visual Basic", "C#", "F#", "C++"], correct: 1 },
  { question: "What does SQL stand for?", choices: ["Simple Query Language", "Structured Query Language", "Standard Question Language", "Sequel Query Language"], correct: 1 },
  { question: "Who designed BASIC?", choices: ["Kemeny and Kurtz", "Backus", "Hopper", "Wirth"], correct: 0 },
  { question: "Which language has Pythonic 'duck typing'?", choices: ["Java", "C", "Python", "Go"], correct: 2 },
  { question: "Which language is best known for systems programming today?", choices: ["Rust", "Java", "Ruby", "PHP"], correct: 0 },
  { question: "Which language has a famous 'gopher' mascot?", choices: ["Python", "Go", "Rust", "Swift"], correct: 1 },
  { question: "What is COBOL primarily used for?", choices: ["Business/finance systems", "Scientific computing", "Web development", "Game design"], correct: 0 },
  { question: "Which language was designed for browsers in 10 days (originally)?", choices: ["Python", "JavaScript", "PHP", "Ruby"], correct: 1 },
  { question: "What is TypeScript?", choices: ["Subset of JS", "Typed superset of JS", "OS", "Database"], correct: 1 },
  { question: "Which language created by Wirth?", choices: ["Pascal", "C", "Java", "Lua"], correct: 0 },
  { question: "Which language is famously used for Excel macros?", choices: ["Python", "VBA", "Lua", "JavaScript"], correct: 1 },
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
